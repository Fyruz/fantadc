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
