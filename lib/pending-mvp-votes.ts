import { MatchStatus } from "@prisma/client";
import { db } from "./db";
import { isMvpWindowOpen, MVP_WINDOW_MS } from "./domain/vote";

export type PendingMvpVote = {
  matchId: number;
  title: string;
};

export async function getPendingOpenMvpVotes(userId: number): Promise<PendingMvpVote[]> {
  const voteCutoff = new Date(Date.now() - MVP_WINDOW_MS);
  const matches = await db.match.findMany({
    where: {
      status: MatchStatus.CONCLUDED,
      concludedAt: { not: null, gte: voteCutoff },
      votes: { none: { userId } },
    },
    orderBy: { concludedAt: "desc" },
    select: {
      id: true,
      concludedAt: true,
      homeSeed: true,
      awaySeed: true,
      homeTeam: { select: { name: true, shortName: true } },
      awayTeam: { select: { name: true, shortName: true } },
    },
  });

  return matches
    .filter((match) => isMvpWindowOpen(match.concludedAt))
    .map((match) => ({
      matchId: match.id,
      title: `${match.homeTeam?.shortName ?? match.homeTeam?.name ?? match.homeSeed ?? "TBD"} vs ${match.awayTeam?.shortName ?? match.awayTeam?.name ?? match.awaySeed ?? "TBD"}`,
    }));
}
