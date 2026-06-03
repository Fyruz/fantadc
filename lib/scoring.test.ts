import { describe, expect, it } from "vitest";
import { MVP_WINDOW_MS } from "./domain/vote";
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

  it("returns null when top votes are tied", () => {
    expect(
      computeMvpWinnerId([
        { playerId: 8 },
        { playerId: 3 },
        { playerId: 8 },
        { playerId: 3 },
      ])
    ).toBeNull();
  });
});

describe("accumulatePlayerTotals", () => {
  const closedAt = new Date(Date.now() - MVP_WINDOW_MS - 60_000);
  const openAt = new Date();

  it("aggregates bonus and official MVP points across matches", () => {
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
          concludedAt: closedAt,
          players: [{ playerId: 1 }, { playerId: 2 }, { playerId: 3 }],
        },
        {
          bonuses: [
            { playerId: 2, points: 3 },
            { playerId: 3, points: 0.5 },
          ],
          goals: [],
          votes: [{ playerId: 3 }],
          concludedAt: closedAt,
          players: [{ playerId: 2 }, { playerId: 3 }],
        },
      ],
      5
    );

    expect(totals.get(1)).toBe(8.5);
    expect(totals.get(2)).toBe(2);
    expect(totals.get(3)).toBe(5.5);
  });

  it("does not assign MVP points while the vote window is open", () => {
    const totals = accumulatePlayerTotals(
      [{
        bonuses: [],
        goals: [],
        votes: [{ playerId: 1 }, { playerId: 1 }],
        concludedAt: openAt,
        players: [{ playerId: 1 }],
      }],
      5
    );

    expect(totals.get(1)).toBeUndefined();
  });

  it("does not assign MVP points when final votes are tied without admin override", () => {
    const totals = accumulatePlayerTotals(
      [{
        bonuses: [],
        goals: [],
        votes: [{ playerId: 1 }, { playerId: 2 }],
        concludedAt: closedAt,
        players: [{ playerId: 1 }, { playerId: 2 }],
      }],
      5
    );

    expect(totals.get(1)).toBeUndefined();
    expect(totals.get(2)).toBeUndefined();
  });

  it("assigns MVP points to the admin override after the window closes", () => {
    const totals = accumulatePlayerTotals(
      [{
        bonuses: [],
        goals: [],
        votes: [{ playerId: 1 }, { playerId: 2 }],
        concludedAt: closedAt,
        mvpOverridePlayerId: 2,
        players: [{ playerId: 1 }, { playerId: 2 }],
      }],
      5
    );

    expect(totals.get(1)).toBeUndefined();
    expect(totals.get(2)).toBe(5);
  });

  it("does not assign MVP points when there are no votes", () => {
    const totals = accumulatePlayerTotals(
      [{
        bonuses: [],
        goals: [],
        votes: [],
        concludedAt: closedAt,
        players: [{ playerId: 1 }],
      }],
      5
    );

    expect(totals.get(1)).toBeUndefined();
  });
});
