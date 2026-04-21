import { describe, expect, it } from "vitest";
import {
  buildMatchPlayerPointIndex,
  buildPlayerTotalPoints,
  getMvpPlayerId,
  type PublishedMatchScoreInput,
} from "./scoring-utils";

describe("getMvpPlayerId", () => {
  it("returns null when no votes are present", () => {
    expect(getMvpPlayerId([])).toBeNull();
  });

  it("keeps the first leader when votes tie", () => {
    expect(
      getMvpPlayerId([
        { playerId: 7 },
        { playerId: 9 },
        { playerId: 9 },
        { playerId: 7 },
      ])
    ).toBe(7);
  });
});

describe("buildMatchPlayerPointIndex", () => {
  const matches: PublishedMatchScoreInput[] = [
    {
      id: 1,
      bonuses: [
        { playerId: 10, points: 2 },
        { playerId: 10, points: "1.5" },
        { playerId: 11, points: -0.5 },
      ],
      votes: [{ playerId: 10 }, { playerId: 11 }, { playerId: 10 }],
    },
    {
      id: 2,
      bonuses: [{ playerId: 11, points: 3 }],
      votes: [{ playerId: 11 }],
    },
  ];

  it("aggregates bonuses and mvp bonus per match", () => {
    const index = buildMatchPlayerPointIndex(matches, 4);

    expect(index.get(1)?.get(10)).toBe(7.5);
    expect(index.get(1)?.get(11)).toBe(-0.5);
    expect(index.get(2)?.get(11)).toBe(7);
  });

  it("builds season totals across all matches", () => {
    const totals = buildPlayerTotalPoints(buildMatchPlayerPointIndex(matches, 4));

    expect(totals.get(10)).toBe(7.5);
    expect(totals.get(11)).toBe(6.5);
  });
});
