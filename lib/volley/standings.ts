export type VolleyStandingRow = {
  teamId: number;
  teamName: string;
  played: number;
  setsWon: number;
  setsLost: number;
  pointsScored: number;
  pointsConceded: number;
  setRatio: number;
  pointsRatio: number;
};

type SetResult = { homePoints: number; awayPoints: number };

type MatchForStandings = {
  homeTeamId: number;
  awayTeamId: number;
  status: string;
  sets: SetResult[];
};

export function computeVolleyStandings(
  teams: { id: number; name: string }[],
  matches: MatchForStandings[]
): VolleyStandingRow[] {
  const map = new Map<number, VolleyStandingRow>();

  for (const t of teams) {
    map.set(t.id, {
      teamId: t.id,
      teamName: t.name,
      played: 0,
      setsWon: 0,
      setsLost: 0,
      pointsScored: 0,
      pointsConceded: 0,
      setRatio: 0,
      pointsRatio: 0,
    });
  }

  for (const m of matches) {
    if (m.status !== "CONCLUDED") continue;
    const home = map.get(m.homeTeamId);
    const away = map.get(m.awayTeamId);
    if (!home || !away) continue;

    home.played++;
    away.played++;

    for (const s of m.sets) {
      if (s.homePoints > s.awayPoints) {
        home.setsWon++;
        away.setsLost++;
      } else {
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
    row.setRatio =
      row.setsLost === 0 ? row.setsWon : row.setsWon / row.setsLost;
    row.pointsRatio =
      row.pointsConceded === 0
        ? row.pointsScored
        : row.pointsScored / row.pointsConceded;
  }

  return rows.sort((a, b) => {
    if (b.setsWon !== a.setsWon) return b.setsWon - a.setsWon;
    if (b.setRatio !== a.setRatio) return b.setRatio - a.setRatio;
    return b.pointsRatio - a.pointsRatio;
  });
}
