import { describe, it, expect } from "vitest";
import { PlayerRole } from "@prisma/client";
import { validateRoster, type RosterPlayer } from "./roster";

function makePlayer(id: number, role: PlayerRole, teamId: number): RosterPlayer {
  return { playerId: id, role, footballTeamId: teamId };
}

const GK = PlayerRole.GK;
const PL = PlayerRole.PLAYER;

const VALID_ROSTER: RosterPlayer[] = [
  makePlayer(1, GK, 1),
  makePlayer(2, PL, 2),
  makePlayer(3, PL, 3),
  makePlayer(4, PL, 4),
  makePlayer(5, PL, 5),
];

describe("validateRoster", () => {
  it("returns null for a valid roster", () => {
    expect(validateRoster(VALID_ROSTER, 1)).toBeNull();
  });

  it("accepts any player in the roster as captain", () => {
    expect(validateRoster(VALID_ROSTER, 3)).toBeNull();
    expect(validateRoster(VALID_ROSTER, 5)).toBeNull();
  });

  it("returns WRONG_SIZE when fewer than 5 players", () => {
    const short = VALID_ROSTER.slice(0, 4);
    expect(validateRoster(short, 1)).toBe("WRONG_SIZE");
  });

  it("returns WRONG_SIZE when more than 5 players", () => {
    const long = [...VALID_ROSTER, makePlayer(6, PL, 6)];
    expect(validateRoster(long, 1)).toBe("WRONG_SIZE");
  });

  it("returns WRONG_GK_COUNT when no goalkeeper", () => {
    const noGk: RosterPlayer[] = [
      makePlayer(1, PL, 1),
      makePlayer(2, PL, 2),
      makePlayer(3, PL, 3),
      makePlayer(4, PL, 4),
      makePlayer(5, PL, 5),
    ];
    expect(validateRoster(noGk, 1)).toBe("WRONG_GK_COUNT");
  });

  it("returns WRONG_GK_COUNT when two goalkeepers", () => {
    const twoGk: RosterPlayer[] = [
      makePlayer(1, GK, 1),
      makePlayer(2, GK, 2),
      makePlayer(3, PL, 3),
      makePlayer(4, PL, 4),
      makePlayer(5, PL, 5),
    ];
    expect(validateRoster(twoGk, 1)).toBe("WRONG_GK_COUNT");
  });

  it("returns DUPLICATE_TEAM when two players from the same team", () => {
    const dupTeam: RosterPlayer[] = [
      makePlayer(1, GK, 1),
      makePlayer(2, PL, 2),
      makePlayer(3, PL, 2), // same team as player 2
      makePlayer(4, PL, 4),
      makePlayer(5, PL, 5),
    ];
    expect(validateRoster(dupTeam, 1)).toBe("DUPLICATE_TEAM");
  });

  it("returns CAPTAIN_NOT_IN_ROSTER when captain id is not in the roster", () => {
    expect(validateRoster(VALID_ROSTER, 99)).toBe("CAPTAIN_NOT_IN_ROSTER");
  });

  it("returns WRONG_SIZE before CAPTAIN_NOT_IN_ROSTER (wrong size wins)", () => {
    const short = VALID_ROSTER.slice(0, 3);
    expect(validateRoster(short, 99)).toBe("WRONG_SIZE");
  });
});
