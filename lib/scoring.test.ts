import { describe, expect, it } from "vitest";
import { accumulatePlayerTotals, computeMvpWinnerId } from "./scoring";

describe("computeMvpWinnerId", () => {
  it("returns null when there are no votes", () => {
    expect(computeMvpWinnerId([])).toBeNull();
  });

  it("returns the most voted player id", () => {
    expect(
      computeMvpWinnerId([
        { playerId: 4 },
        { playerId: 2 },
        { playerId: 4 },
        { playerId: 1 },
      ])
    ).toBe(4);
  });

  it("breaks ties deterministically using the lower player id", () => {
    expect(
      computeMvpWinnerId([
        { playerId: 8 },
        { playerId: 3 },
        { playerId: 8 },
        { playerId: 3 },
      ])
    ).toBe(3);
  });
});

describe("accumulatePlayerTotals", () => {
  it("aggregates bonus and MVP points across matches", () => {
    const totals = accumulatePlayerTotals(
      [
        {
          bonuses: [
            { playerId: 1, points: 2 },
            { playerId: 1, points: 1.5 },
            { playerId: 2, points: -1 },
          ],
          goals: [],
          votes: [{ playerId: 1 }, { playerId: 3 }, { playerId: 1 }],
        },
        {
          bonuses: [
            { playerId: 2, points: 3 },
            { playerId: 3, points: 0.5 },
          ],
          goals: [],
          votes: [{ playerId: 3 }],
        },
      ],
      2
    );

    expect(totals.get(1)).toBe(5.5);
    expect(totals.get(2)).toBe(2);
    expect(totals.get(3)).toBe(2.5);
  });
});
