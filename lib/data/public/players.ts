import "server-only";

import { db } from "@/lib/db";
import { resolveTeamFlag } from "@/lib/flags";
import { measureServerTiming } from "@/lib/perf";

export type PublicScorerRankingRow = {
  id: number;
  name: string;
  goals: number;
  footballTeam: {
    name: string;
    shortName: string | null;
    countryCode: string | null;
    logoUrl: string | null;
  };
  flagSrc: string | null;
};

export type PublicPlayerGridRow = {
  id: number;
  name: string;
  role: string;
  footballTeam: {
    name: string;
    shortName: string | null;
    countryCode: string | null;
    logoUrl: string | null;
  };
  totalGoals: number;
  totalOwnGoals: number;
  totalBonusPoints: number;
  presenze: number;
  matchStats: Array<{
    matchId: number;
    startsAt: string;
    isHome: boolean;
    opponent: string;
    hs: number | null;
    as_: number | null;
    won: boolean;
    lost: boolean;
    matchGoals: number;
    matchBonusPoints: number;
  }>;
};

export type PublicPlayersGroup = {
  teamName: string;
  players: PublicPlayerGridRow[];
};

export type PublicFantasyPlayerPickRow = {
  rank: number;
  playerId: number;
  playerName: string;
  role: string;
  footballTeamName: string;
  footballTeamShortName: string | null;
  flagSrc: string | null;
  pickCount: number;
  pickRate: number;
  fantasyTeams: Array<{
    id: number;
    name: string;
    ownerLabel: string;
  }>;
};

export async function getPublicScorerRanking(): Promise<PublicScorerRankingRow[]> {
  return measureServerTiming("data.public.players.scorers.fetch", async () => {
    const [players, goals] = await Promise.all([
      db.player.findMany({
        select: {
          id: true,
          name: true,
          footballTeam: {
            select: {
              name: true,
              shortName: true,
              countryCode: true,
              logoUrl: true,
            },
          },
        },
      }),
      db.matchGoal.findMany({
        where: { isOwnGoal: false },
        select: { scorerId: true },
      }),
    ]);

    const goalMap = new Map<number, number>();
    for (const goal of goals) {
      goalMap.set(goal.scorerId, (goalMap.get(goal.scorerId) ?? 0) + 1);
    }

    return players
      .map((player) => ({
        ...player,
        goals: goalMap.get(player.id) ?? 0,
        flagSrc: resolveTeamFlag(player.footballTeam),
      }))
      .filter((player) => player.goals > 0)
      .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name, "it"));
  });
}

export async function getPublicPlayersGroups(): Promise<PublicPlayersGroup[]> {
  return measureServerTiming("data.public.players.index.fetch", async () => {
    const [players, appearances, goals, bonuses] = await Promise.all([
      db.player.findMany({
        orderBy: [{ footballTeam: { name: "asc" } }, { role: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          role: true,
          footballTeamId: true,
          footballTeam: {
            select: { name: true, shortName: true, countryCode: true, logoUrl: true },
          },
        },
      }),
      db.matchPlayer.findMany({
        select: {
          playerId: true,
          match: {
            select: {
              id: true,
              startsAt: true,
              homeScore: true,
              awayScore: true,
              homeTeamId: true,
              awayTeamId: true,
              homeSeed: true,
              awaySeed: true,
              homeTeam: { select: { shortName: true, name: true } },
              awayTeam: { select: { shortName: true, name: true } },
            },
          },
        },
        orderBy: { match: { startsAt: "desc" } },
      }),
      db.matchGoal.findMany({
        select: { matchId: true, scorerId: true, isOwnGoal: true },
      }),
      db.playerMatchBonus.findMany({
        select: {
          playerId: true,
          matchId: true,
          points: true,
        },
      }),
    ]);

    const appearancesByPlayer = new Map<number, typeof appearances>();
    for (const appearance of appearances) {
      const rows = appearancesByPlayer.get(appearance.playerId) ?? [];
      rows.push(appearance);
      appearancesByPlayer.set(appearance.playerId, rows);
    }

    const goalsByPlayer = new Map<number, typeof goals>();
    for (const goal of goals) {
      const rows = goalsByPlayer.get(goal.scorerId) ?? [];
      rows.push(goal);
      goalsByPlayer.set(goal.scorerId, rows);
    }

    const bonusesByPlayer = new Map<number, typeof bonuses>();
    for (const bonus of bonuses) {
      const rows = bonusesByPlayer.get(bonus.playerId) ?? [];
      rows.push(bonus);
      bonusesByPlayer.set(bonus.playerId, rows);
    }

    const enriched: PublicPlayerGridRow[] = players.map((player) => {
      const playerAppearances = appearancesByPlayer.get(player.id) ?? [];
      const playerGoals = goalsByPlayer.get(player.id) ?? [];
      const playerBonuses = bonusesByPlayer.get(player.id) ?? [];

      const totalGoals = playerGoals.filter((goal) => !goal.isOwnGoal).length;
      const totalOwnGoals = playerGoals.filter((goal) => goal.isOwnGoal).length;
      const totalBonusPoints = playerBonuses.reduce(
        (sum, bonus) => sum + Number(bonus.points),
        0
      );

      const matchStats = playerAppearances.slice(0, 5).map((appearance) => {
        const match = appearance.match;
        const isHome = match.homeTeamId === player.footballTeamId;
        const hs = isHome ? match.homeScore : match.awayScore;
        const as_ = isHome ? match.awayScore : match.homeScore;
        const opponent = isHome
          ? (match.awayTeam?.shortName ?? match.awayTeam?.name ?? match.awaySeed ?? "TBD")
          : (match.homeTeam?.shortName ?? match.homeTeam?.name ?? match.homeSeed ?? "TBD");
        const matchGoals = playerGoals.filter(
          (goal) => goal.matchId === match.id && !goal.isOwnGoal
        ).length;
        const matchBonusPoints = playerBonuses
          .filter((bonus) => bonus.matchId === match.id)
          .reduce((sum, bonus) => sum + Number(bonus.points), 0);
        const won = hs !== null && as_ !== null && hs > as_;
        const lost = hs !== null && as_ !== null && hs < as_;

        return {
          matchId: match.id,
          startsAt: match.startsAt.toISOString(),
          isHome,
          opponent,
          hs,
          as_,
          won,
          lost,
          matchGoals,
          matchBonusPoints,
        };
      });

      return {
        id: player.id,
        name: player.name,
        role: player.role,
        footballTeam: player.footballTeam,
        totalGoals,
        totalOwnGoals,
        totalBonusPoints,
        presenze: playerAppearances.length,
        matchStats,
      };
    });

    const byTeam = new Map<string, PublicPlayerGridRow[]>();
    for (const player of enriched) {
      const rows = byTeam.get(player.footballTeam.name) ?? [];
      rows.push(player);
      byTeam.set(player.footballTeam.name, rows);
    }

    return [...byTeam.entries()].map(([teamName, teamPlayers]) => ({
      teamName,
      players: teamPlayers,
    }));
  });
}

export async function getPublicFantasyPlayerPickRows(): Promise<PublicFantasyPlayerPickRow[]> {
  return measureServerTiming("data.public.players.fantasy-picks.fetch", async () => {
    const [players, totalFantasyTeams] = await Promise.all([
      db.player.findMany({
        select: {
          id: true,
          name: true,
          role: true,
          footballTeam: {
            select: { name: true, shortName: true, countryCode: true, logoUrl: true },
          },
          fantasyTeams: {
            select: {
              fantasyTeam: {
                select: { id: true, name: true, user: { select: { name: true, email: true } } },
              },
            },
          },
        },
      }),
      db.fantasyTeam.count(),
    ]);

    return players
      .map((player) => {
        const pickCount = player.fantasyTeams.length;
        const fantasyTeamRows = player.fantasyTeams
          .map(({ fantasyTeam }) => ({
            id: fantasyTeam.id,
            name: fantasyTeam.name,
            ownerLabel: fantasyTeam.user.name ?? fantasyTeam.user.email,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "it"));

        return {
          rank: 0,
          playerId: player.id,
          playerName: player.name,
          role: player.role,
          footballTeamName: player.footballTeam.name,
          footballTeamShortName: player.footballTeam.shortName,
          flagSrc: resolveTeamFlag(player.footballTeam),
          pickCount,
          pickRate: totalFantasyTeams > 0 ? (pickCount / totalFantasyTeams) * 100 : 0,
          fantasyTeams: fantasyTeamRows,
        };
      })
      .filter((row) => row.pickCount > 0)
      .sort(
        (a, b) =>
          b.pickCount - a.pickCount ||
          a.playerName.localeCompare(b.playerName, "it") ||
          a.footballTeamName.localeCompare(b.footballTeamName, "it")
      )
      .map((row, index) => ({ ...row, rank: index + 1 }));
  });
}
