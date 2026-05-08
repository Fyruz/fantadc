import { describe, it, expect } from "vitest";
import { isMvpWindowOpen, MVP_WINDOW_MS, validateVote } from "./vote";

describe("isMvpWindowOpen", () => {
  it("returns false when concludedAt is null", () => {
    expect(isMvpWindowOpen(null)).toBe(false);
  });

  it("returns true when match just concluded", () => {
    const now = new Date();
    expect(isMvpWindowOpen(now)).toBe(true);
  });

  it("returns true when concluded just before the window closes", () => {
    const almostClosed = new Date(Date.now() - (MVP_WINDOW_MS - 1_000));
    expect(isMvpWindowOpen(almostClosed)).toBe(true);
  });

  it("returns false when concluded exactly at the window cutoff", () => {
    const cutoff = new Date(Date.now() - MVP_WINDOW_MS);
    expect(isMvpWindowOpen(cutoff)).toBe(false);
  });

  it("returns false when concluded well after the window cutoff", () => {
    const oldDate = new Date(Date.now() - MVP_WINDOW_MS - 60_000);
    expect(isMvpWindowOpen(oldDate)).toBe(false);
  });
});

describe("validateVote", () => {
  const now = new Date();
  const playerIds = [1, 2, 3, 4, 5];

  it("returns null for a valid vote", () => {
    expect(
      validateVote({ playerIds, candidatePlayerId: 2, concludedAt: now, alreadyVoted: false })
    ).toBeNull();
  });

  it("returns VOTING_WINDOW_CLOSED when concludedAt is null", () => {
    expect(
      validateVote({ playerIds, candidatePlayerId: 2, concludedAt: null, alreadyVoted: false })
    ).toBe("VOTING_WINDOW_CLOSED");
  });

  it("returns VOTING_WINDOW_CLOSED when window has expired", () => {
    const oldDate = new Date(Date.now() - MVP_WINDOW_MS - 60_000);
    expect(
      validateVote({ playerIds, candidatePlayerId: 2, concludedAt: oldDate, alreadyVoted: false })
    ).toBe("VOTING_WINDOW_CLOSED");
  });

  it("returns ALREADY_VOTED when user has already voted", () => {
    expect(
      validateVote({ playerIds, candidatePlayerId: 2, concludedAt: now, alreadyVoted: true })
    ).toBe("ALREADY_VOTED");
  });

  it("returns PLAYER_NOT_IN_MATCH when candidate is not in the player list", () => {
    expect(
      validateVote({ playerIds, candidatePlayerId: 99, concludedAt: now, alreadyVoted: false })
    ).toBe("PLAYER_NOT_IN_MATCH");
  });

  it("VOTING_WINDOW_CLOSED takes priority over ALREADY_VOTED", () => {
    const oldDate = new Date(Date.now() - MVP_WINDOW_MS - 60_000);
    expect(
      validateVote({ playerIds, candidatePlayerId: 2, concludedAt: oldDate, alreadyVoted: true })
    ).toBe("VOTING_WINDOW_CLOSED");
  });

  it("ALREADY_VOTED takes priority over PLAYER_NOT_IN_MATCH", () => {
    expect(
      validateVote({ playerIds, candidatePlayerId: 99, concludedAt: now, alreadyVoted: true })
    ).toBe("ALREADY_VOTED");
  });
});
