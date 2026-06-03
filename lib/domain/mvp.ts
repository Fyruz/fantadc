import { isMvpWindowOpen } from "./vote";

export type MvpVote = { playerId: number };

export type MvpVoteCount = {
  playerId: number;
  votes: number;
};

export type MvpResolution =
  | { status: "open"; playerId: null; voteCounts: MvpVoteCount[] }
  | { status: "no_votes"; playerId: null; voteCounts: MvpVoteCount[] }
  | { status: "tied"; playerId: null; tiedPlayerIds: number[]; voteCounts: MvpVoteCount[] }
  | { status: "resolved"; playerId: number; source: "automatic" | "admin"; voteCounts: MvpVoteCount[] };

export function countMvpVotes(votes: MvpVote[]): MvpVoteCount[] {
  const counts = new Map<number, number>();
  for (const vote of votes) {
    counts.set(vote.playerId, (counts.get(vote.playerId) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([playerId, voteCount]) => ({ playerId, votes: voteCount }))
    .sort((a, b) => b.votes - a.votes || a.playerId - b.playerId);
}

export function resolveMvp({
  concludedAt,
  votes,
  mvpOverridePlayerId,
  eligiblePlayerIds,
}: {
  concludedAt: Date | null;
  votes: MvpVote[];
  mvpOverridePlayerId?: number | null;
  eligiblePlayerIds?: number[];
}): MvpResolution {
  const voteCounts = countMvpVotes(votes);

  if (!concludedAt) {
    return { status: "no_votes", playerId: null, voteCounts };
  }

  if (isMvpWindowOpen(concludedAt)) {
    return { status: "open", playerId: null, voteCounts };
  }

  if (mvpOverridePlayerId) {
    const validOverride = !eligiblePlayerIds || eligiblePlayerIds.includes(mvpOverridePlayerId);
    if (validOverride) {
      return { status: "resolved", playerId: mvpOverridePlayerId, source: "admin", voteCounts };
    }
  }

  if (voteCounts.length === 0) {
    return { status: "no_votes", playerId: null, voteCounts };
  }

  const topVotes = voteCounts[0].votes;
  const tiedPlayerIds = voteCounts
    .filter((entry) => entry.votes === topVotes)
    .map((entry) => entry.playerId);

  if (tiedPlayerIds.length > 1) {
    return { status: "tied", playerId: null, tiedPlayerIds, voteCounts };
  }

  return { status: "resolved", playerId: voteCounts[0].playerId, source: "automatic", voteCounts };
}

export function getOfficialMvpPlayerId(input: Parameters<typeof resolveMvp>[0]): number | null {
  const resolution = resolveMvp(input);
  return resolution.status === "resolved" ? resolution.playerId : null;
}
