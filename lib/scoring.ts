import { db } from "./db";
import { MatchStatus } from "@prisma/client";
import { getOfficialMvpPlayerId } from "./domain/mvp";

export type PlayerMatchScore = {
  playerId: number;
  playerName: string;
  footballTeamName: string;
  played: boolean;
  goalPoints: number;
  bonusPoints: number;
  bonusDetails: Array<{
    code: string;
    name: string;
    quantity: number;
    points: number;
  }>;
  isMvp: boolean;
  mvpPoints: number;
  basePoints: number;
  isCaptain: boolean;
  finalPoints: number; // basePoints * (isCaptain ? 2 : 1)
};

export type MatchScore = {
  matchId: number;
  label: string; // "HomeTeam vs AwayTeam"
  startsAt: Date;
  playerScores: PlayerMatchScore[];
  total: number;
};

export type RankEntry = {
  rank: number;
  fantasyTeamId: number;
  fantasyTeamName: string;
  userEmail: string;
  userName: string | null;
  totalPoints: number;
};

export function computeMvpWinnerId(votes: Array<{ playerId: number }>): number | null {
  if (!votes.length) return null;

  const counts = new Map<number, number>();
  for (const vote of votes) {
    counts.set(vote.playerId, (counts.get(vote.playerId) ?? 0) + 1);
  }

  const sortedEntries = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0] - b[0]
  );
  const topEntry = sortedEntries[0];
  const tied = sortedEntries[1] && sortedEntries[1][1] === topEntry[1];

  return tied ? null : topEntry[0];
}

export function accumulatePlayerTotals(
  matches: Array<{
    bonuses: Array<{
      playerId: number;
      points: number | string | { toString(): string };
    }>;
    goals: Array<{ scorerId: number; isOwnGoal: boolean }>;
    votes: Array<{ playerId: number }>;
    concludedAt: Date | null;
    mvpOverridePlayerId?: number | null;
    players?: Array<{ playerId: number }>;
  }>,
  mvpBonus: number
): Map<number, number> {
  const totals = new Map<number, number>();

  for (const match of matches) {
    const mvpId = getOfficialMvpPlayerId({
      concludedAt: match.concludedAt,
      votes: match.votes,
      mvpOverridePlayerId: match.mvpOverridePlayerId,
      eligiblePlayerIds: match.players?.map((player) => player.playerId),
    });

    for (const bonus of match.bonuses) {
      totals.set(
        bonus.playerId,
        (totals.get(bonus.playerId) ?? 0) + Number(bonus.points)
      );
    }

    for (const goal of match.goals) {
      if (!goal.isOwnGoal) {
        totals.set(goal.scorerId, (totals.get(goal.scorerId) ?? 0) + 1);
      }
    }

    if (mvpId !== null) {
      totals.set(mvpId, (totals.get(mvpId) ?? 0) + mvpBonus);
    }
  }

  return totals;
}

type FantasyTeamMeta = {
  id: number;
  name: string;
  captainPlayerId: number;
  players: { playerId: number }[];
  user: { email: string; name: string | null };
};

/**
 * Punti fanta per squadra (rosa attuale) sulle partite CONCLUDED nella finestra
 * temporale data — `from`/`to` filtrano per `concludedAt` (>= from, < to).
 * Senza opzioni = tutte le partite concluse.
 */
export async function computeFantasyTeamPoints(opts?: {
  from?: Date | null;
  to?: Date | null;
}): Promise<Map<number, number>> {
  const concludedAt: { gte?: Date; lt?: Date } = {};
  if (opts?.from) concludedAt.gte = opts.from;
  if (opts?.to) concludedAt.lt = opts.to;

  const [matches, fantasyTeams, mvpBonus] = await Promise.all([
    db.match.findMany({
      where: {
        status: MatchStatus.CONCLUDED,
        ...(opts?.from || opts?.to ? { concludedAt } : {}),
      },
      select: {
        concludedAt: true,
        mvpOverridePlayerId: true,
        players: { select: { playerId: true } },
        bonuses: { select: { playerId: true, points: true } },
        goals: { select: { scorerId: true, isOwnGoal: true } },
        votes: { select: { playerId: true } },
      },
    }),
    db.fantasyTeam.findMany({
      select: { id: true, captainPlayerId: true, players: { select: { playerId: true } } },
    }),
    getMvpBonus(),
  ]);

  const playerTotals = accumulatePlayerTotals(matches, mvpBonus);

  const result = new Map<number, number>();
  for (const ft of fantasyTeams) {
    const rosterTotal = ft.players.reduce((sum, { playerId }) => sum + (playerTotals.get(playerId) ?? 0), 0);
    const captainTotal = playerTotals.get(ft.captainPlayerId) ?? 0;
    result.set(ft.id, rosterTotal + captainTotal);
  }
  return result;
}

async function getMvpBonus(): Promise<number> {
  const mvpBonusType = await db.bonusType.findFirst({ where: { code: "MVP" }, select: { points: true } });
  return mvpBonusType ? Number(mvpBonusType.points) : 0;
}

async function getFantasyTeamMeta(): Promise<FantasyTeamMeta[]> {
  return db.fantasyTeam.findMany({
    select: {
      id: true,
      name: true,
      captainPlayerId: true,
      players: { select: { playerId: true } },
      user: { select: { email: true, name: true } },
    },
  });
}

function rankFromPoints(teams: FantasyTeamMeta[], points: Map<number, number>): RankEntry[] {
  const entries: Omit<RankEntry, "rank">[] = teams.map((ft) => ({
    fantasyTeamId: ft.id,
    fantasyTeamName: ft.name,
    userEmail: ft.user.email,
    userName: ft.user.name,
    totalPoints: points.get(ft.id) ?? 0,
  }));

  entries.sort(
    (a, b) =>
      b.totalPoints - a.totalPoints ||
      a.fantasyTeamName.localeCompare(b.fantasyTeamName, "it")
  );

  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}

/** Compute total ranking across all CONCLUDED matches (rosa attuale, tutte le partite). */
export async function computeRankings(): Promise<RankEntry[]> {
  const [teams, points] = await Promise.all([getFantasyTeamMeta(), computeFantasyTeamPoints()]);
  return rankFromPoints(teams, points);
}

/** Ultima fase chiusa (per il confine della fase in corso). */
async function getLastClosedAt(): Promise<Date | null> {
  const last = await db.scoringPhase.findFirst({
    orderBy: { order: "desc" },
    select: { closedAt: true },
  });
  return last?.closedAt ?? null;
}

/** Classifica generale: somma delle fasi congelate + fase in corso (live). */
export async function computeCumulativeRankings(): Promise<RankEntry[]> {
  const [teams, frozenRows, lastClosedAt] = await Promise.all([
    getFantasyTeamMeta(),
    db.scoringPhaseScore.findMany({ select: { fantasyTeamId: true, points: true } }),
    getLastClosedAt(),
  ]);

  const current = await computeFantasyTeamPoints({ from: lastClosedAt });

  const totals = new Map<number, number>();
  for (const row of frozenRows) {
    totals.set(row.fantasyTeamId, (totals.get(row.fantasyTeamId) ?? 0) + Number(row.points));
  }
  for (const [teamId, pts] of current) {
    totals.set(teamId, (totals.get(teamId) ?? 0) + pts);
  }

  return rankFromPoints(teams, totals);
}

/** Classifica di una fase congelata. */
export async function computePhaseRankings(phaseId: number): Promise<RankEntry[]> {
  const [teams, rows] = await Promise.all([
    getFantasyTeamMeta(),
    db.scoringPhaseScore.findMany({ where: { phaseId }, select: { fantasyTeamId: true, points: true } }),
  ]);
  const points = new Map<number, number>();
  for (const row of rows) points.set(row.fantasyTeamId, Number(row.points));
  return rankFromPoints(teams, points);
}

/** Classifica della fase in corso (live, dalla chiusura dell'ultima fase). */
export async function computeCurrentPhaseRankings(): Promise<RankEntry[]> {
  const lastClosedAt = await getLastClosedAt();
  const [teams, points] = await Promise.all([
    getFantasyTeamMeta(),
    computeFantasyTeamPoints({ from: lastClosedAt }),
  ]);
  return rankFromPoints(teams, points);
}

export type PhaseBreakdownEntry = {
  phaseId: number | null; // null = fase in corso
  name: string;
  points: number;
  current: boolean;
};

/** Punti per fase di una singola squadra (fasi congelate + fase in corso). */
export async function getTeamPhaseBreakdown(fantasyTeamId: number): Promise<PhaseBreakdownEntry[]> {
  const [phases, lastClosedAt] = await Promise.all([
    db.scoringPhase.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, scores: { where: { fantasyTeamId }, select: { points: true } } },
    }),
    getLastClosedAt(),
  ]);

  const result: PhaseBreakdownEntry[] = phases.map((p) => ({
    phaseId: p.id,
    name: p.name,
    points: p.scores[0] ? Number(p.scores[0].points) : 0,
    current: false,
  }));

  const current = await computeFantasyTeamPoints({ from: lastClosedAt });
  result.push({
    phaseId: null,
    name: "Fase in corso",
    points: current.get(fantasyTeamId) ?? 0,
    current: true,
  });

  return result;
}

/** Compute per-match score history for a single fantasy team. */
export async function computeTeamHistory(fantasyTeamId: number): Promise<MatchScore[]> {
  const [ft, matches, mvpBonusType] = await Promise.all([
    db.fantasyTeam.findUnique({
      where: { id: fantasyTeamId },
      select: {
        captainPlayerId: true,
        players: {
          select: {
            player: {
              select: {
                id: true,
                name: true,
                footballTeam: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    db.match.findMany({
      where: { status: MatchStatus.CONCLUDED },
      select: {
        id: true,
        startsAt: true,
        homeSeed: true,
        awaySeed: true,
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
        players: { select: { playerId: true } },
        concludedAt: true,
        mvpOverridePlayerId: true,
        bonuses: {
          select: {
            playerId: true,
            quantity: true,
            points: true,
            bonusType: { select: { code: true, name: true } },
          },
        },
        goals: { select: { scorerId: true, isOwnGoal: true } },
        votes: { select: { playerId: true } },
      },
      orderBy: { startsAt: "asc" },
    }),
    db.bonusType.findFirst({ where: { code: "MVP" }, select: { points: true } }),
  ]);

  if (!ft) return [];

  const mvpBonus = mvpBonusType ? Number(mvpBonusType.points) : 0;

  return matches.map((match) => {
    const playerPoints = accumulatePlayerTotals(
      [{
        bonuses: match.bonuses,
        goals: match.goals,
        votes: match.votes,
        concludedAt: match.concludedAt,
        mvpOverridePlayerId: match.mvpOverridePlayerId,
        players: match.players,
      }],
      mvpBonus
    );
    const mvpId = getOfficialMvpPlayerId({
      concludedAt: match.concludedAt,
      votes: match.votes,
      mvpOverridePlayerId: match.mvpOverridePlayerId,
      eligiblePlayerIds: match.players.map((p) => p.playerId),
    });
    const playedPlayerIds = new Set(match.players.map((p) => p.playerId));

    const playerScores: PlayerMatchScore[] = ft.players.map(({ player }) => {
      const played = playedPlayerIds.has(player.id);
      const goalPoints = match.goals.filter(
        (g) => !g.isOwnGoal && g.scorerId === player.id
      ).length;
      const bonuses = match.bonuses.filter((bonus) => bonus.playerId === player.id);
      const bonusDetailsByCode = new Map<
        string,
        { code: string; name: string; quantity: number; points: number }
      >();
      for (const bonus of bonuses) {
        const current = bonusDetailsByCode.get(bonus.bonusType.code) ?? {
          code: bonus.bonusType.code,
          name: bonus.bonusType.name,
          quantity: 0,
          points: 0,
        };
        current.quantity += bonus.quantity;
        current.points += Number(bonus.points);
        bonusDetailsByCode.set(current.code, current);
      }
      const bonusDetails = [...bonusDetailsByCode.values()].sort((a, b) =>
        a.code.localeCompare(b.code, "it")
      );
      const bonusPoints = bonusDetails.reduce((sum, bonus) => sum + bonus.points, 0);
      const isMvp = player.id === mvpId;
      const totalPoints = playerPoints.get(player.id) ?? 0;
      const mvpPoints = isMvp ? mvpBonus : 0;
      const isCaptain = ft.captainPlayerId === player.id;
      const finalPoints = totalPoints * (isCaptain ? 2 : 1);
      return {
        playerId: player.id,
        playerName: player.name,
        footballTeamName: player.footballTeam.name,
        played,
        goalPoints,
        bonusPoints,
        bonusDetails,
        isMvp,
        mvpPoints,
        basePoints: totalPoints,
        isCaptain,
        finalPoints,
      };
    });

    return {
      matchId: match.id,
      label: `${match.homeTeam?.name ?? match.homeSeed ?? "TBD"} vs ${match.awayTeam?.name ?? match.awaySeed ?? "TBD"}`,
      startsAt: match.startsAt,
      playerScores,
      total: playerScores.reduce((s, p) => s + p.finalPoints, 0),
    };
  });
}
