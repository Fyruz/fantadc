import { MatchStatus } from "@prisma/client";
import { db } from "./db";
import {
  buildMatchPlayerPointIndex,
  buildPlayerTotalPoints,
  getMvpPlayerId,
} from "./scoring-utils";

export type PlayerMatchScore = {
  playerId: number;
  playerName: string;
  footballTeamName: string;
  bonusPoints: number;
  isMvp: boolean;
  mvpPoints: number;
  basePoints: number;
  isCaptain: boolean;
  finalPoints: number;
};

export type MatchScore = {
  matchId: number;
  label: string;
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

/** Compute total ranking across all PUBLISHED matches. */
export async function computeRankings(): Promise<RankEntry[]> {
  const [matches, fantasyTeams, mvpBonusType] = await Promise.all([
    db.match.findMany({
      where: { status: MatchStatus.PUBLISHED },
      select: {
        id: true,
        bonuses: { select: { playerId: true, points: true } },
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
  const totalPointsByPlayer = buildPlayerTotalPoints(
    buildMatchPlayerPointIndex(matches, mvpBonus)
  );

  const entries = fantasyTeams.map((fantasyTeam) => {
    const totalPoints = fantasyTeam.players.reduce((total, { playerId }) => {
      const playerPoints = totalPointsByPlayer.get(playerId) ?? 0;
      const multiplier = fantasyTeam.captainPlayerId === playerId ? 2 : 1;
      return total + playerPoints * multiplier;
    }, 0);

    return {
      fantasyTeamId: fantasyTeam.id,
      fantasyTeamName: fantasyTeam.name,
      userEmail: fantasyTeam.user.email,
      userName: fantasyTeam.user.name,
      totalPoints,
    };
  });

  entries.sort(
    (left, right) =>
      right.totalPoints - left.totalPoints ||
      left.fantasyTeamName.localeCompare(right.fantasyTeamName, "it")
  );

  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

/** Compute per-match score history for a single fantasy team. */
export async function computeTeamHistory(
  fantasyTeamId: number
): Promise<MatchScore[]> {
  const [fantasyTeam, matches, mvpBonusType] = await Promise.all([
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
      where: { status: MatchStatus.PUBLISHED },
      select: {
        id: true,
        startsAt: true,
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
        bonuses: { select: { playerId: true, points: true } },
        votes: { select: { playerId: true } },
      },
      orderBy: { startsAt: "asc" },
    }),
    db.bonusType.findFirst({ where: { code: "MVP" }, select: { points: true } }),
  ]);

  if (!fantasyTeam) return [];

  const mvpBonus = mvpBonusType ? Number(mvpBonusType.points) : 0;
  const pointsByMatch = buildMatchPlayerPointIndex(matches, mvpBonus);

  return matches.map((match) => {
    const matchPoints = pointsByMatch.get(match.id) ?? new Map<number, number>();
    const mvpId = getMvpPlayerId(match.votes);
    const playerScores: PlayerMatchScore[] = fantasyTeam.players.map(
      ({ player }) => {
        let bonusPoints = 0;
        for (const bonus of match.bonuses) {
          if (bonus.playerId === player.id) {
            bonusPoints += Number(bonus.points);
          }
        }

        const isMvp = player.id === mvpId;
        const mvpPoints = isMvp ? mvpBonus : 0;
        const basePoints = matchPoints.get(player.id) ?? 0;
        const isCaptain = fantasyTeam.captainPlayerId === player.id;
        const finalPoints = basePoints * (isCaptain ? 2 : 1);

        return {
          playerId: player.id,
          playerName: player.name,
          footballTeamName: player.footballTeam.name,
          bonusPoints,
          isMvp,
          mvpPoints,
          basePoints,
          isCaptain,
          finalPoints,
        };
      }
    );

    return {
      matchId: match.id,
      label: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      startsAt: match.startsAt,
      playerScores,
      total: playerScores.reduce((total, playerScore) => total + playerScore.finalPoints, 0),
    };
  });
}
