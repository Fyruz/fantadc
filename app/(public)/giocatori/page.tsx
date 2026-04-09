import { db } from "@/lib/db";
import PlayersGrid from "./_players-grid";

export default async function GiocatoriPublicPage() {
  const [players, appearances, goals, bonuses] = await Promise.all([
    db.player.findMany({
      orderBy: [{ footballTeam: { name: "asc" } }, { role: "asc" }, { name: "asc" }],
      include: { footballTeam: { select: { id: true, name: true, shortName: true } } },
    }),
    db.matchPlayer.findMany({
      include: {
        match: {
          select: {
            id: true,
            startsAt: true,
            status: true,
            homeScore: true,
            awayScore: true,
            homeTeamId: true,
            awayTeamId: true,
            homeTeam: { select: { shortName: true, name: true } },
            awayTeam: { select: { shortName: true, name: true } },
          },
        },
      },
      orderBy: { match: { startsAt: "desc" } },
    }),
    db.matchGoal.findMany({
      select: { matchId: true, scorerId: true, isOwnGoal: true, minute: true },
    }),
    db.playerMatchBonus.findMany({
      select: {
        playerId: true,
        matchId: true,
        points: true,
        quantity: true,
        bonusType: { select: { code: true } },
      },
    }),
  ]);

  // Pre-group by player ID
  const appearancesByPlayer = new Map<number, typeof appearances>();
  for (const a of appearances) {
    const arr = appearancesByPlayer.get(a.playerId) ?? [];
    arr.push(a);
    appearancesByPlayer.set(a.playerId, arr);
  }

  const goalsByPlayer = new Map<number, typeof goals>();
  for (const g of goals) {
    const arr = goalsByPlayer.get(g.scorerId) ?? [];
    arr.push(g);
    goalsByPlayer.set(g.scorerId, arr);
  }

  const bonusesByPlayer = new Map<number, typeof bonuses>();
  for (const b of bonuses) {
    const arr = bonusesByPlayer.get(b.playerId) ?? [];
    arr.push(b);
    bonusesByPlayer.set(b.playerId, arr);
  }

  // Build enriched player objects
  const enriched = players.map((p) => {
    const apps = appearancesByPlayer.get(p.id) ?? [];
    const pGoals = goalsByPlayer.get(p.id) ?? [];
    const pBonuses = bonusesByPlayer.get(p.id) ?? [];

    const totalGoals = pGoals.filter((g) => !g.isOwnGoal).length;
    const totalOwnGoals = pGoals.filter((g) => g.isOwnGoal).length;
    const totalBonusPoints = pBonuses.reduce(
      (s, b) => s + Number(b.points) * b.quantity,
      0
    );

    // Per-match stats (last 5 appearances)
    const matchStats = apps.slice(0, 5).map((a) => {
      const m = a.match;
      const isHome = m.homeTeamId === p.footballTeamId;
      const hs = isHome ? m.homeScore : m.awayScore;
      const as_ = isHome ? m.awayScore : m.homeScore;
      const opponent = isHome
        ? (m.awayTeam.shortName ?? m.awayTeam.name)
        : (m.homeTeam.shortName ?? m.homeTeam.name);
      const matchGoals = pGoals.filter(
        (g) => g.matchId === m.id && !g.isOwnGoal
      ).length;
      const matchBonusPoints = pBonuses
        .filter((b) => b.matchId === m.id)
        .reduce((s, b) => s + Number(b.points) * b.quantity, 0);
      const won =
        hs !== null && as_ !== null && hs > as_;
      const lost =
        hs !== null && as_ !== null && hs < as_;

      return {
        matchId: m.id,
        startsAt: m.startsAt.toISOString(),
        isHome,
        opponent,
        hs,
        as_,
        won,
        lost,
        matchGoals,
        matchBonusPoints,
        status: m.status,
      };
    });

    return {
      id: p.id,
      name: p.name,
      role: p.role,
      footballTeamId: p.footballTeamId,
      footballTeam: p.footballTeam,
      totalGoals,
      totalOwnGoals,
      totalBonusPoints,
      presenze: apps.length,
      matchStats,
    };
  });

  // Group by team
  const byTeam = new Map<string, typeof enriched>();
  for (const p of enriched) {
    const team = p.footballTeam.name;
    const arr = byTeam.get(team) ?? [];
    arr.push(p);
    byTeam.set(team, arr);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="over-label mb-1">Stagione 2025</div>
        <h1
          className="font-display font-black text-3xl uppercase"
          style={{ color: "var(--text-primary)" }}
        >
          GIOCATORI
        </h1>
      </div>

      {byTeam.size === 0 ? (
        <div
          className="card p-8 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Nessun giocatore presente.
        </div>
      ) : (
        <PlayersGrid groups={[...byTeam.entries()].map(([teamName, players]) => ({ teamName, players }))} />
      )}
    </div>
  );
}
