import "server-only";

import { MatchStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { resolveMvp } from "@/lib/domain/mvp";
import { resolveTeamFlag } from "@/lib/flags";

export type MvpMatchRow = {
  matchId: number;
  label: string;
  concludedAt: Date;
  mvpPlayer: {
    id: number;
    name: string;
    flagSrc: string | null;
    footballTeamName: string;
  };
};

export type MvpPlayerRow = {
  playerId: number;
  playerName: string;
  flagSrc: string | null;
  footballTeamName: string;
  count: number;
  matches: { matchId: number; label: string; concludedAt: Date }[];
};

export type PublicMvpData = {
  byMatch: MvpMatchRow[];
  byPlayer: MvpPlayerRow[];
};

export async function getPublicMvpData(): Promise<PublicMvpData> {
  const matches = await db.match.findMany({
    where: { status: MatchStatus.CONCLUDED, concludedAt: { not: null } },
    orderBy: { concludedAt: "desc" },
    select: {
      id: true,
      concludedAt: true,
      homeSeed: true,
      awaySeed: true,
      mvpOverridePlayerId: true,
      homeTeam: { select: { name: true, shortName: true } },
      awayTeam: { select: { name: true, shortName: true } },
      votes: { select: { playerId: true } },
      players: {
        select: {
          playerId: true,
          player: {
            select: {
              id: true,
              name: true,
              footballTeam: {
                select: { name: true, shortName: true, countryCode: true, logoUrl: true },
              },
            },
          },
        },
      },
    },
  });

  const byMatch: MvpMatchRow[] = [];
  const byPlayerMap = new Map<number, MvpPlayerRow>();

  for (const match of matches) {
    const resolution = resolveMvp({
      concludedAt: match.concludedAt,
      votes: match.votes,
      mvpOverridePlayerId: match.mvpOverridePlayerId,
      eligiblePlayerIds: match.players.map((p) => p.playerId),
    });

    if (resolution.status !== "resolved") continue;

    const mp = match.players.find((p) => p.playerId === resolution.playerId);
    if (!mp) continue;

    const homeName = match.homeTeam?.shortName ?? match.homeTeam?.name ?? match.homeSeed ?? "TBD";
    const awayName = match.awayTeam?.shortName ?? match.awayTeam?.name ?? match.awaySeed ?? "TBD";
    const label = `${homeName} vs ${awayName}`;
    const flagSrc = resolveTeamFlag(mp.player.footballTeam);

    const matchRow = {
      matchId: match.id,
      label,
      concludedAt: match.concludedAt!,
      mvpPlayer: {
        id: mp.player.id,
        name: mp.player.name,
        flagSrc,
        footballTeamName: mp.player.footballTeam.name,
      },
    };

    byMatch.push(matchRow);

    const existing = byPlayerMap.get(mp.player.id);
    if (existing) {
      existing.count += 1;
      existing.matches.push({ matchId: match.id, label, concludedAt: match.concludedAt! });
    } else {
      byPlayerMap.set(mp.player.id, {
        playerId: mp.player.id,
        playerName: mp.player.name,
        flagSrc,
        footballTeamName: mp.player.footballTeam.name,
        count: 1,
        matches: [{ matchId: match.id, label, concludedAt: match.concludedAt! }],
      });
    }
  }

  const byPlayer = [...byPlayerMap.values()].sort(
    (a, b) => b.count - a.count || a.playerName.localeCompare(b.playerName, "it")
  );

  return { byMatch, byPlayer };
}

export type MvpMatchDetail = {
  match: {
    homeTeamName: string;
    awayTeamName: string;
    homeTeamFlagSrc: string | null;
    awayTeamFlagSrc: string | null;
    homeScore: number | null;
    awayScore: number | null;
  };
  mvpPlayer: {
    name: string;
    flagSrc: string | null;
  };
  mvpBonusPoints: number;
  homeGoals: string[];
  awayGoals: string[];
};

export async function getMvpMatchDetail(matchId: number): Promise<MvpMatchDetail | null> {
  const [match, mvpBonusType] = await Promise.all([
    db.match.findUnique({
      where: { id: matchId, status: MatchStatus.CONCLUDED },
      select: {
        concludedAt: true,
        homeScore: true,
        awayScore: true,
        homeSeed: true,
        awaySeed: true,
        homeTeamId: true,
        awayTeamId: true,
        mvpOverridePlayerId: true,
        homeTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
        awayTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
        votes: { select: { playerId: true } },
        players: {
          select: {
            playerId: true,
            player: {
              select: {
                id: true,
                name: true,
                footballTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
              },
            },
          },
        },
        goals: {
          orderBy: { minute: "asc" },
          select: {
            isOwnGoal: true,
            minute: true,
            scorer: {
              select: {
                name: true,
                footballTeamId: true,
              },
            },
          },
        },
      },
    }),
    db.bonusType.findFirst({ where: { code: "MVP" }, select: { points: true } }),
  ]);

  if (!match) return null;

  const resolution = resolveMvp({
    concludedAt: match.concludedAt,
    votes: match.votes,
    mvpOverridePlayerId: match.mvpOverridePlayerId,
    eligiblePlayerIds: match.players.map((p) => p.playerId),
  });

  if (resolution.status !== "resolved") return null;

  const mp = match.players.find((p) => p.playerId === resolution.playerId);
  if (!mp) return null;

  const homeGoals: string[] = [];
  const awayGoals: string[] = [];

  for (const g of match.goals) {
    const scorerIsHome = g.scorer.footballTeamId === match.homeTeamId;
    const countsForHome = g.isOwnGoal ? !scorerIsHome : scorerIsHome;
    const lastName = g.scorer.name.trim().split(/\s+/).slice(-1)[0];
    if (countsForHome) {
      homeGoals.push(lastName);
    } else {
      awayGoals.push(lastName);
    }
  }

  return {
    match: {
      homeTeamName: match.homeTeam?.name ?? match.homeSeed ?? "TBD",
      awayTeamName: match.awayTeam?.name ?? match.awaySeed ?? "TBD",
      homeTeamFlagSrc: match.homeTeam ? resolveTeamFlag(match.homeTeam) : null,
      awayTeamFlagSrc: match.awayTeam ? resolveTeamFlag(match.awayTeam) : null,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    },
    mvpPlayer: {
      name: mp.player.name,
      flagSrc: resolveTeamFlag(mp.player.footballTeam),
    },
    mvpBonusPoints: mvpBonusType ? Number(mvpBonusType.points) : 3,
    homeGoals,
    awayGoals,
  };
}
