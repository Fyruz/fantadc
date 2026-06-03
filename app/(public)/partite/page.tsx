import { db } from "@/lib/db";
import PartiteClient from "./_partite-client";

export default async function PartitePublicPage() {
  const [matches, groups] = await Promise.all([
    db.match.findMany({
      where: { status: { not: "DRAFT" } },
      orderBy: { startsAt: "asc" },
      select: {
        id: true, status: true, startsAt: true, homeScore: true, awayScore: true,
        homeSeed: true, awaySeed: true,
        homeTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
        awayTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
        group: { select: { name: true, slug: true } },
        knockoutRound: { select: { name: true } },
      },
    }),
    db.group.findMany({
      orderBy: { order: "asc" },
      include: {
        teams: {
          include: { footballTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } } },
        },
        matches: {
          where: { status: "CONCLUDED", homeScore: { not: null }, awayScore: { not: null } },
          select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true },
        },
      },
    }),
  ]);

  type GroupRow = { teamId: number; name: string; shortName: string | null; countryCode: string | null; logoUrl: string | null; qualified: boolean; played: number; won: number; drawn: number; lost: number; goalDiff: number; points: number };
  const groupStandings = groups.map((g) => {
    const map = new Map<number, GroupRow>();
    for (const gt of g.teams) {
      map.set(gt.footballTeamId, {
        teamId: gt.footballTeamId,
        name: gt.footballTeam.name,
        shortName: gt.footballTeam.shortName,
        countryCode: gt.footballTeam.countryCode,
        logoUrl: gt.footballTeam.logoUrl,
        qualified: gt.qualified,
        played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0,
      });
    }
    for (const m of g.matches) {
      if (!m.homeTeamId || !m.awayTeamId) continue;
      const hs = m.homeScore!; const as_ = m.awayScore!;
      const home = map.get(m.homeTeamId); const away = map.get(m.awayTeamId);
      if (home) { home.played++; home.goalDiff += hs - as_; if (hs > as_) { home.won++; home.points += 3; } else if (hs === as_) { home.drawn++; home.points += 1; } else home.lost++; }
      if (away) { away.played++; away.goalDiff += as_ - hs; if (as_ > hs) { away.won++; away.points += 3; } else if (hs === as_) { away.drawn++; away.points += 1; } else away.lost++; }
    }
    const rows = [...map.values()].sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || a.name.localeCompare(b.name, "it"));
    return { id: g.id, name: g.name, rows };
  });

  if (matches.length === 0 && groupStandings.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-10">
        <p className="text-sm text-center" style={{ color: "rgba(0,0,0,0.40)" }}>Nessuna partita disponibile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <PartiteClient matches={matches} groups={groupStandings} />
    </div>
  );
}
