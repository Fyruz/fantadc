import { db } from "./db";

export type StandingEntry = {
  rank: number;
  teamId: number;
  teamName: string;
  shortName: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
};

export async function computeStandings(): Promise<StandingEntry[]> {
  const [matches, allTeams] = await Promise.all([
    db.match.findMany({
      where: {
        status: { in: ["CONCLUDED", "PUBLISHED"] },
        homeScore: { not: null },
        awayScore: { not: null },
      },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
        homeTeam: { select: { id: true, name: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, shortName: true } },
      },
    }),
    db.footballTeam.findMany({ select: { id: true, name: true, shortName: true } }),
  ]);

  const map = new Map<number, Omit<StandingEntry, "rank">>();

  const ensure = (team: { id: number; name: string; shortName: string | null }) => {
    if (!map.has(team.id)) {
      map.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        shortName: team.shortName,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
      });
    }
    return map.get(team.id)!;
  };

  // Seed all teams (even those without matches)
  for (const t of allTeams) ensure(t);

  for (const m of matches) {
    const hs = m.homeScore!;
    const as_ = m.awayScore!;
    const home = ensure(m.homeTeam);
    const away = ensure(m.awayTeam);

    home.played++; away.played++;
    home.goalsFor += hs; home.goalsAgainst += as_;
    away.goalsFor += as_; away.goalsAgainst += hs;

    if (hs > as_) {
      home.won++; home.points += 3; away.lost++;
    } else if (hs < as_) {
      away.won++; away.points += 3; home.lost++;
    } else {
      home.drawn++; home.points += 1;
      away.drawn++; away.points += 1;
    }
  }

  const entries = [...map.values()];
  for (const e of entries) e.goalDiff = e.goalsFor - e.goalsAgainst;

  entries.sort((a, b) =>
    b.points - a.points ||
    b.goalDiff - a.goalDiff ||
    b.goalsFor - a.goalsFor ||
    a.teamName.localeCompare(b.teamName, "it")
  );

  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}
