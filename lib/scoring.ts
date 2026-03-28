import { db } from "./db";
import { MatchStatus } from "@prisma/client";

export type PlayerMatchScore = {
  playerId: number;
  playerName: string;
  footballTeamName: string;
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

/** Compute total ranking across all PUBLISHED matches. */
export async function computeRankings(): Promise<RankEntry[]> {
  const [matches, fantasyTeams, mvpBonusType, playerMap] = await Promise.all([
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
    db.player.findMany({ select: { id: true, name: true } }),
  ]);

  const mvpBonus = mvpBonusType ? Number(mvpBonusType.points) : 0;
  const playerNames = new Map(playerMap.map((p) => [p.id, p.name]));

  function getMvpId(votes: { playerId: number }[]): number | null {
    if (!votes.length) return null;
    const counts = new Map<number, number>();
    for (const v of votes) counts.set(v.playerId, (counts.get(v.playerId) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  const entries: Omit<RankEntry, "rank">[] = fantasyTeams.map((ft) => {
    let total = 0;
    for (const match of matches) {
      const mvpId = getMvpId(match.votes);
      for (const { playerId } of ft.players) {
        const bonusPoints = match.bonuses
          .filter((b) => b.playerId === playerId)
          .reduce((s, b) => s + Number(b.points), 0);
        const mvpPoints = playerId === mvpId ? mvpBonus : 0;
        const base = bonusPoints + mvpPoints;
        const multiplier = ft.captainPlayerId === playerId ? 2 : 1;
        total += base * multiplier;
      }
    }
    return {
      fantasyTeamId: ft.id,
      fantasyTeamName: ft.name,
      userEmail: ft.user.email,
      userName: ft.user.name,
      totalPoints: total,
      _playerNames: playerNames,
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
      where: { status: MatchStatus.PUBLISHED },
      select: {
        id: true,
        startsAt: true,
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
        bonuses: { select: { playerId: true, points: true, bonusType: { select: { code: true, name: true } } } },
        votes: { select: { playerId: true } },
      },
      orderBy: { startsAt: "asc" },
    }),
    db.bonusType.findFirst({ where: { code: "MVP" }, select: { points: true } }),
  ]);

  if (!ft) return [];

  const mvpBonus = mvpBonusType ? Number(mvpBonusType.points) : 0;

  function getMvpId(votes: { playerId: number }[]): number | null {
    if (!votes.length) return null;
    const counts = new Map<number, number>();
    for (const v of votes) counts.set(v.playerId, (counts.get(v.playerId) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  return matches.map((match) => {
    const mvpId = getMvpId(match.votes);
    const playerScores: PlayerMatchScore[] = ft.players.map(({ player }) => {
      const bonusPoints = match.bonuses
        .filter((b) => b.playerId === player.id)
        .reduce((s, b) => s + Number(b.points), 0);
      const isMvp = player.id === mvpId;
      const mvpPoints = isMvp ? mvpBonus : 0;
      const basePoints = bonusPoints + mvpPoints;
      const isCaptain = ft.captainPlayerId === player.id;
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
    });

    return {
      matchId: match.id,
      label: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      startsAt: match.startsAt,
      playerScores,
      total: playerScores.reduce((s, p) => s + p.finalPoints, 0),
    };
  });
}
