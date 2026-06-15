import { describe, expect, it } from "vitest";
import { isScheduledMatchInProgress, LIVE_MATCH_WINDOW_MS } from "./match";

const now = new Date("2026-06-15T18:00:00.000Z");

describe("isScheduledMatchInProgress", () => {
  it("returns true for a scheduled match that has already started", () => {
    expect(
      isScheduledMatchInProgress({
        status: "SCHEDULED",
        startsAt: new Date(now.getTime() - 30 * 60 * 1000),
        now,
      })
    ).toBe(true);
  });

  it("returns true exactly at the live window cutoff", () => {
    expect(
      isScheduledMatchInProgress({
        status: "SCHEDULED",
        startsAt: new Date(now.getTime() - LIVE_MATCH_WINDOW_MS),
        now,
      })
    ).toBe(true);
  });

  it("returns false for scheduled matches before kickoff", () => {
    expect(
      isScheduledMatchInProgress({
        status: "SCHEDULED",
        startsAt: new Date(now.getTime() + 1),
        now,
      })
    ).toBe(false);
  });

  it("returns false for scheduled matches after the live window", () => {
    expect(
      isScheduledMatchInProgress({
        status: "SCHEDULED",
        startsAt: new Date(now.getTime() - LIVE_MATCH_WINDOW_MS - 1),
        now,
      })
    ).toBe(false);
  });

  it("does not treat LIVE as an active source of truth", () => {
    expect(
      isScheduledMatchInProgress({
        status: "LIVE",
        startsAt: new Date(now.getTime() - 30 * 60 * 1000),
        now,
      })
    ).toBe(false);
  });
});
