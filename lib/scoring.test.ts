import { describe, expect, it } from "vitest";
import { MVP_WINDOW_MS } from "./domain/vote";
import {
  accumulatePlayerTotals,
  combinePhasePoints,
  computeMvpWinnerId,
  rankFromPoints,
  teamPointsFromPlayerTotals,
  type FantasyTeamMeta,
} from "./scoring";

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

describe("teamPointsFromPlayerTotals", () => {
  const team = { captainPlayerId: 1, players: [1, 2, 3, 4, 5].map((playerId) => ({ playerId })) };

  it("sums the roster and doubles the captain's points", () => {
    const totals = new Map([
      [1, 5], // captain
      [2, 3],
      [3, 2],
      [4, 1],
      [5, 4],
    ]);
    // roster 15 + captain 5 (counted again) = 20
    expect(teamPointsFromPlayerTotals(team, totals)).toBe(20);
  });

  it("treats players without totals as 0", () => {
    const totals = new Map([[1, 5]]); // only the captain scored
    // roster 5 + captain 5 = 10
    expect(teamPointsFromPlayerTotals(team, totals)).toBe(10);
  });

  it("adds nothing extra when the captain has no points", () => {
    const totals = new Map([
      [2, 3],
      [3, 2],
    ]);
    // roster 5 + captain(1)=0 = 5
    expect(teamPointsFromPlayerTotals(team, totals)).toBe(5);
  });

  it("supports negative totals (malus)", () => {
    const totals = new Map([
      [1, -1], // captain
      [2, 2],
    ]);
    // roster (-1 + 2) = 1 + captain (-1) = 0
    expect(teamPointsFromPlayerTotals(team, totals)).toBe(0);
  });
});

describe("combinePhasePoints", () => {
  it("sums frozen phases with the current phase per team", () => {
    const frozen = [
      { fantasyTeamId: 1, points: 10 }, // fase 1
      { fantasyTeamId: 1, points: 7 }, // fase 2
      { fantasyTeamId: 2, points: 4 },
    ];
    const current = new Map([
      [1, 3],
      [2, 6],
    ]);
    const totals = combinePhasePoints(frozen, current);
    expect(totals.get(1)).toBe(20); // 10 + 7 + 3
    expect(totals.get(2)).toBe(10); // 4 + 6
  });

  it("includes teams present only in frozen phases", () => {
    const totals = combinePhasePoints([{ fantasyTeamId: 9, points: 12 }], new Map());
    expect(totals.get(9)).toBe(12);
  });

  it("includes teams present only in the current phase (new teams)", () => {
    const totals = combinePhasePoints([], new Map([[5, 8]]));
    expect(totals.get(5)).toBe(8);
  });

  it("equals the current phase when there are no frozen phases", () => {
    const current = new Map([
      [1, 5],
      [2, 9],
    ]);
    const totals = combinePhasePoints([], current);
    expect([...totals.entries()].sort()).toEqual([...current.entries()].sort());
  });
});

describe("rankFromPoints", () => {
  const meta = (id: number, name: string): FantasyTeamMeta => ({
    id,
    name,
    captainPlayerId: 0,
    players: [],
    user: { email: `${name.toLowerCase()}@x.it`, name: null },
  });

  it("sorts by points desc and assigns sequential ranks", () => {
    const teams = [meta(1, "Bravo"), meta(2, "Alpha"), meta(3, "Charlie")];
    const points = new Map([
      [1, 12],
      [2, 20],
      [3, 5],
    ]);
    const ranked = rankFromPoints(teams, points);
    expect(ranked.map((r) => [r.fantasyTeamName, r.rank, r.totalPoints])).toEqual([
      ["Alpha", 1, 20],
      ["Bravo", 2, 12],
      ["Charlie", 3, 5],
    ]);
  });

  it("breaks ties by team name (it locale)", () => {
    const teams = [meta(1, "Zeta"), meta(2, "Alpha")];
    const points = new Map([
      [1, 10],
      [2, 10],
    ]);
    const ranked = rankFromPoints(teams, points);
    expect(ranked.map((r) => r.fantasyTeamName)).toEqual(["Alpha", "Zeta"]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2]);
  });

  it("treats teams without a points entry as 0", () => {
    const teams = [meta(1, "Alpha"), meta(2, "Bravo")];
    const ranked = rankFromPoints(teams, new Map([[1, 4]]));
    expect(ranked.find((r) => r.fantasyTeamName === "Bravo")?.totalPoints).toBe(0);
    expect(ranked.map((r) => r.fantasyTeamName)).toEqual(["Alpha", "Bravo"]);
  });
});
