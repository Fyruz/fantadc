import { MatchStatus } from "@prisma/client";
import { db } from "./db";
import { isMvpWindowOpen, MVP_WINDOW_MS } from "./domain/vote";

type TeamInfo = {
  name: string;
  shortName: string | null;
  countryCode: string | null;
  logoUrl: string | null;
} | null;

export type PendingMvpVote = {
  matchId: number;
  title: string;
  concludedAt: Date | null;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  homeSeed: string | null;
  awaySeed: string | null;
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
      homeScore: true,
      awayScore: true,
      homeSeed: true,
      awaySeed: true,
      homeTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
      awayTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
    },
  });

  return matches
    .filter((match) => isMvpWindowOpen(match.concludedAt))
    .map((match) => ({
      matchId: match.id,
      title: `${match.homeTeam?.shortName ?? match.homeTeam?.name ?? match.homeSeed ?? "TBD"} vs ${match.awayTeam?.shortName ?? match.awayTeam?.name ?? match.awaySeed ?? "TBD"}`,
      concludedAt: match.concludedAt,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeSeed: match.homeSeed,
      awaySeed: match.awaySeed,
    }));
}
