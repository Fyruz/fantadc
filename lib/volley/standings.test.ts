import { describe, expect, it } from "vitest";
import { computeVolleyStandings } from "./standings";

const teams = [
  { id: 1, name: "Alfa" },
  { id: 2, name: "Beta" },
  { id: 3, name: "Gamma" },
];

describe("computeVolleyStandings", () => {
  it("uses set wins as standings points", () => {
    const rows = computeVolleyStandings(teams.slice(0, 2), [
      {
        homeTeamId: 1,
        awayTeamId: 2,
        status: "CONCLUDED",
        sets: [
          { homePoints: 25, awayPoints: 20 },
          { homePoints: 25, awayPoints: 21 },
        ],
      },
    ]);

    expect(rows[0]).toMatchObject({ teamId: 1, setsWon: 2, wins: 1 });
    expect(rows[1]).toMatchObject({ teamId: 2, setsWon: 0, wins: 0 });
  });

  it("breaks equal standings points by match wins", () => {
    const rows = computeVolleyStandings([...teams, { id: 4, name: "Delta" }], [
      {
        homeTeamId: 1,
        awayTeamId: 3,
        status: "CONCLUDED",
        sets: [
          { homePoints: 25, awayPoints: 20 },
          { homePoints: 25, awayPoints: 20 },
        ],
      },
      {
        homeTeamId: 2,
        awayTeamId: 3,
        status: "CONCLUDED",
        sets: [
          { homePoints: 25, awayPoints: 20 },
          { homePoints: 23, awayPoints: 25 },
          { homePoints: 21, awayPoints: 25 },
        ],
      },
      {
        homeTeamId: 2,
        awayTeamId: 4,
        status: "CONCLUDED",
        sets: [
          { homePoints: 25, awayPoints: 20 },
          { homePoints: 23, awayPoints: 25 },
          { homePoints: 21, awayPoints: 25 },
        ],
      },
    ]);

    const alfaIndex = rows.findIndex((row) => row.teamId === 1);
    const betaIndex = rows.findIndex((row) => row.teamId === 2);

    expect(alfaIndex).toBeLessThan(betaIndex);
    expect(rows[betaIndex]).toMatchObject({ setsWon: 2, wins: 0 });
  });

  it("then breaks ties by head-to-head standings points", () => {
    const rows = computeVolleyStandings(teams, [
      {
        homeTeamId: 1,
        awayTeamId: 2,
        status: "CONCLUDED",
        sets: [
          { homePoints: 25, awayPoints: 20 },
          { homePoints: 25, awayPoints: 20 },
        ],
      },
      {
        homeTeamId: 2,
        awayTeamId: 3,
        status: "CONCLUDED",
        sets: [
          { homePoints: 25, awayPoints: 20 },
          { homePoints: 25, awayPoints: 20 },
        ],
      },
    ]);

    expect(rows[0]).toMatchObject({ teamId: 1, setsWon: 2, wins: 1, headToHeadPoints: 2 });
    expect(rows[1]).toMatchObject({ teamId: 2, setsWon: 2, wins: 1, headToHeadPoints: 0 });
  });

  it("then uses points ratio and lower disciplinary score", () => {
    const rowsByRatio = computeVolleyStandings(teams, [
      {
        homeTeamId: 1,
        awayTeamId: 3,
        status: "CONCLUDED",
        sets: [{ homePoints: 25, awayPoints: 10 }],
      },
      {
        homeTeamId: 2,
        awayTeamId: 3,
        status: "CONCLUDED",
        sets: [{ homePoints: 25, awayPoints: 20 }],
      },
    ]);

    expect(rowsByRatio[0].teamId).toBe(1);

    const rowsByDiscipline = computeVolleyStandings(teams.slice(0, 2), [
      {
        homeTeamId: 1,
        awayTeamId: 2,
        status: "CONCLUDED",
        homeDisciplinaryPoints: 1,
        awayDisciplinaryPoints: 0,
        sets: [],
      },
    ]);

    expect(rowsByDiscipline.map((row) => row.teamId)).toEqual([2, 1]);
    expect(rowsByDiscipline.every((row) => row.drawRequired)).toBe(false);
  });
});
