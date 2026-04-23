import { db } from "./db";
import { MatchStatus } from "@prisma/client";

export type PlayerMatchScore = {
  playerId: number;
  playerName: string;
  footballTeamName: string;
  goalPoints: number;
  bonusPoints: number;
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

  const topEntry = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)
  )[0];

  return topEntry ? topEntry[0] : null;
}

export function accumulatePlayerTotals(
  matches: Array<{
    bonuses: Array<{
      playerId: number;
      points: number | string | { toString(): string };
    }>;
    goals: Array<{ scorerId: number; isOwnGoal: boolean }>;
    votes: Array<{ playerId: number }>;
  }>,
  mvpBonus: number
): Map<number, number> {
  const totals = new Map<number, number>();

  for (const match of matches) {
    const mvpId = computeMvpWinnerId(match.votes);

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

/** Compute total ranking across all CONCLUDED matches. */
export async function computeRankings(): Promise<RankEntry[]> {
  const [matches, fantasyTeams, mvpBonusType] = await Promise.all([
    db.match.findMany({
      where: { status: MatchStatus.CONCLUDED },
      select: {
        id: true,
        bonuses: { select: { playerId: true, points: true } },
        goals: { select: { scorerId: true, isOwnGoal: true } },
        votes: { select: { playerId: true } },
      },
    }),
    db.fantasyTeam.findMany({
      select: {
        id: true,
        name: true,
        captainPlayerId: true,
        players: { select: { playerId: true } },
        user: { select: { email: true, name: true } },
      },
    }),
    db.bonusType.findFirst({ where: { code: "MVP" }, select: { points: true } }),
  ]);

  const mvpBonus = mvpBonusType ? Number(mvpBonusType.points) : 0;
  const playerTotals = accumulatePlayerTotals(matches, mvpBonus);

  const entries: Omit<RankEntry, "rank">[] = fantasyTeams.map((fantasyTeam) => {
    const rosterTotal = fantasyTeam.players.reduce(
      (sum, { playerId }) => sum + (playerTotals.get(playerId) ?? 0),
      0
    );
    const captainTotal = playerTotals.get(fantasyTeam.captainPlayerId) ?? 0;

    return {
      fantasyTeamId: fantasyTeam.id,
      fantasyTeamName: fantasyTeam.name,
      userEmail: fantasyTeam.user.email,
      userName: fantasyTeam.user.name,
      totalPoints: rosterTotal + captainTotal,
    };
  });

  entries.sort(
    (a, b) =>
      b.totalPoints - a.totalPoints ||
      a.fantasyTeamName.localeCompare(b.fantasyTeamName, "it")
  );

  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
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
        bonuses: { select: { playerId: true, points: true, bonusType: { select: { code: true, name: true } } } },
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
      [{ bonuses: match.bonuses, goals: match.goals, votes: match.votes }],
      mvpBonus
    );
    const mvpId = computeMvpWinnerId(match.votes);

    const playerScores: PlayerMatchScore[] = ft.players.map(({ player }) => {
      const goalPoints = match.goals.filter(
        (g) => !g.isOwnGoal && g.scorerId === player.id
      ).length;
      const bonusPoints = match.bonuses
        .filter((bonus) => bonus.playerId === player.id)
        .reduce((sum, bonus) => sum + Number(bonus.points), 0);
      const isMvp = player.id === mvpId;
      const totalPoints = playerPoints.get(player.id) ?? 0;
      const mvpPoints = isMvp ? mvpBonus : 0;
      const isCaptain = ft.captainPlayerId === player.id;
      const finalPoints = totalPoints * (isCaptain ? 2 : 1);
      return {
        playerId: player.id,
        playerName: player.name,
        footballTeamName: player.footballTeam.name,
        goalPoints,
        bonusPoints,
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
