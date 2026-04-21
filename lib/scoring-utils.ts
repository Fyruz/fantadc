export type NumericLike = number | string | { toString(): string };

export type PublishedMatchScoreInput = {
  id: number;
  bonuses: ReadonlyArray<{
    playerId: number;
    points: NumericLike;
  }>;
  votes: ReadonlyArray<{
    playerId: number;
  }>;
};

export type MatchPlayerPointIndex = Map<number, Map<number, number>>;

function toNumber(value: NumericLike): number {
  return typeof value === "number" ? value : Number(value.toString());
}

export function getMvpPlayerId(
  votes: ReadonlyArray<{
    playerId: number;
  }>
): number | null {
  if (!votes.length) return null;

  const counts = new Map<number, number>();
  let winnerId: number | null = null;
  let winnerVotes = 0;

  for (const vote of votes) {
    const nextCount = (counts.get(vote.playerId) ?? 0) + 1;
    counts.set(vote.playerId, nextCount);

    if (nextCount > winnerVotes) {
      winnerId = vote.playerId;
      winnerVotes = nextCount;
    }
  }

  return winnerId;
}

export function buildMatchPlayerPointIndex(
  matches: ReadonlyArray<PublishedMatchScoreInput>,
  mvpBonus: number
): MatchPlayerPointIndex {
  const pointsByMatch = new Map<number, Map<number, number>>();

  for (const match of matches) {
    const pointsByPlayer = new Map<number, number>();

    for (const bonus of match.bonuses) {
      pointsByPlayer.set(
        bonus.playerId,
        (pointsByPlayer.get(bonus.playerId) ?? 0) + toNumber(bonus.points)
      );
    }

    const mvpId = getMvpPlayerId(match.votes);
    if (mvpId !== null) {
      pointsByPlayer.set(mvpId, (pointsByPlayer.get(mvpId) ?? 0) + mvpBonus);
    }

    pointsByMatch.set(match.id, pointsByPlayer);
  }

  return pointsByMatch;
}

export function buildPlayerTotalPoints(
  pointsByMatch: MatchPlayerPointIndex
): Map<number, number> {
  const totals = new Map<number, number>();

  for (const pointsByPlayer of pointsByMatch.values()) {
    for (const [playerId, points] of pointsByPlayer.entries()) {
      totals.set(playerId, (totals.get(playerId) ?? 0) + points);
    }
  }

  return totals;
}
