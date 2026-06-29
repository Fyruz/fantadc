import { measureServerTiming } from "../perf";

export type VolleyStandingRow = {
  teamId: number;
  teamName: string;
  played: number;
  wins: number;
  setsWon: number;
  setsLost: number;
  headToHeadPoints: number;
  pointsScored: number;
  pointsConceded: number;
  pointsRatio: number;
  disciplinaryPoints: number;
  drawRequired: boolean;
};

type SetResult = { homePoints: number; awayPoints: number };

type MatchForStandings = {
  homeTeamId: number;
  awayTeamId: number;
  status: string;
  homeDisciplinaryPoints?: number | null;
  awayDisciplinaryPoints?: number | null;
  sets: SetResult[];
};

function countSetWins(sets: SetResult[]): { home: number; away: number } {
  return sets.reduce(
    (acc, set) => {
      if (set.homePoints > set.awayPoints) acc.home++;
      if (set.awayPoints > set.homePoints) acc.away++;
      return acc;
    },
    { home: 0, away: 0 }
  );
}

export function computeVolleyStandings(
  teams: { id: number; name: string }[],
  matches: MatchForStandings[]
): VolleyStandingRow[] {
  return measureServerTiming("volley.computeVolleyStandings", () => {
    const map = new Map<number, VolleyStandingRow>();

    for (const t of teams) {
      map.set(t.id, {
        teamId: t.id,
        teamName: t.name,
        played: 0,
        wins: 0,
        setsWon: 0,
        setsLost: 0,
        headToHeadPoints: 0,
        pointsScored: 0,
        pointsConceded: 0,
        pointsRatio: 0,
        disciplinaryPoints: 0,
        drawRequired: false,
      });
    }

    for (const m of matches) {
      if (m.status !== "CONCLUDED") continue;
      const home = map.get(m.homeTeamId);
      const away = map.get(m.awayTeamId);
      if (!home || !away) continue;

      home.played++;
      away.played++;

      const setWins = countSetWins(m.sets);
      if (setWins.home > setWins.away) home.wins++;
      if (setWins.away > setWins.home) away.wins++;

      home.disciplinaryPoints += m.homeDisciplinaryPoints ?? 0;
      away.disciplinaryPoints += m.awayDisciplinaryPoints ?? 0;

      for (const s of m.sets) {
        if (s.homePoints > s.awayPoints) {
          home.setsWon++;
          away.setsLost++;
        } else if (s.awayPoints > s.homePoints) {
          away.setsWon++;
          home.setsLost++;
        }
        home.pointsScored += s.homePoints;
        home.pointsConceded += s.awayPoints;
        away.pointsScored += s.awayPoints;
        away.pointsConceded += s.homePoints;
      }
    }

    const rows = Array.from(map.values());

    for (const row of rows) {
      row.pointsRatio =
        row.pointsConceded === 0
          ? row.pointsScored
          : row.pointsScored / row.pointsConceded;
    }

    const headToHeadClusters = new Map<string, Set<number>>();
    for (const row of rows) {
      const key = `${row.setsWon}:${row.wins}`;
      const cluster = headToHeadClusters.get(key) ?? new Set<number>();
      cluster.add(row.teamId);
      headToHeadClusters.set(key, cluster);
    }

    for (const cluster of headToHeadClusters.values()) {
      if (cluster.size < 2) continue;

      for (const m of matches) {
        if (m.status !== "CONCLUDED") continue;
        if (!cluster.has(m.homeTeamId) || !cluster.has(m.awayTeamId)) continue;

        const setWins = countSetWins(m.sets);
        const home = map.get(m.homeTeamId);
        const away = map.get(m.awayTeamId);
        if (!home || !away) continue;

        home.headToHeadPoints += setWins.home;
        away.headToHeadPoints += setWins.away;
      }
    }

    for (const row of rows) {
      row.drawRequired = rows.some(
        (other) =>
          other.teamId !== row.teamId &&
          other.setsWon === row.setsWon &&
          other.wins === row.wins &&
          other.headToHeadPoints === row.headToHeadPoints &&
          other.pointsRatio === row.pointsRatio &&
          other.disciplinaryPoints === row.disciplinaryPoints
      );
    }

    return rows.sort((a, b) => {
      if (b.setsWon !== a.setsWon) return b.setsWon - a.setsWon;
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.headToHeadPoints !== a.headToHeadPoints) {
        return b.headToHeadPoints - a.headToHeadPoints;
      }
      if (b.pointsRatio !== a.pointsRatio) return b.pointsRatio - a.pointsRatio;
      if (a.disciplinaryPoints !== b.disciplinaryPoints) {
        return a.disciplinaryPoints - b.disciplinaryPoints;
      }
      return a.teamName.localeCompare(b.teamName, "it") || a.teamId - b.teamId;
    });
  });
}
