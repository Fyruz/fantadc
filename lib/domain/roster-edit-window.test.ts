import { describe, it, expect } from "vitest";
import { isEditWindowOpen, countSubstitutions } from "./roster-edit-window";

describe("isEditWindowOpen", () => {
  const now = new Date("2026-06-10T12:00:00Z");

  it("returns false when there is no window", () => {
    expect(isEditWindowOpen(null, now)).toBe(false);
  });

  it("returns true when now is between opensAt and closesAt", () => {
    const window = {
      opensAt: new Date("2026-06-10T10:00:00Z"),
      closesAt: new Date("2026-06-10T14:00:00Z"),
    };
    expect(isEditWindowOpen(window, now)).toBe(true);
  });

  it("returns true exactly at opensAt (inclusive)", () => {
    const window = { opensAt: now, closesAt: new Date("2026-06-10T14:00:00Z") };
    expect(isEditWindowOpen(window, now)).toBe(true);
  });

  it("returns false exactly at closesAt (exclusive)", () => {
    const window = { opensAt: new Date("2026-06-10T10:00:00Z"), closesAt: now };
    expect(isEditWindowOpen(window, now)).toBe(false);
  });

  it("returns false before the window opens", () => {
    const window = {
      opensAt: new Date("2026-06-10T13:00:00Z"),
      closesAt: new Date("2026-06-10T15:00:00Z"),
    };
    expect(isEditWindowOpen(window, now)).toBe(false);
  });

  it("returns false after the window closes", () => {
    const window = {
      opensAt: new Date("2026-06-10T08:00:00Z"),
      closesAt: new Date("2026-06-10T11:00:00Z"),
    };
    expect(isEditWindowOpen(window, now)).toBe(false);
  });
});

describe("countSubstitutions", () => {
  const baseline = [1, 2, 3, 4, 5];

  it("returns 0 when the roster is unchanged", () => {
    expect(countSubstitutions(baseline, [1, 2, 3, 4, 5])).toBe(0);
  });

  it("is order-independent", () => {
    expect(countSubstitutions(baseline, [5, 4, 3, 2, 1])).toBe(0);
  });

  it("counts a single swapped player as 1", () => {
    expect(countSubstitutions(baseline, [1, 2, 3, 4, 99])).toBe(1);
  });

  it("counts two swapped players as 2", () => {
    expect(countSubstitutions(baseline, [1, 2, 3, 98, 99])).toBe(2);
  });

  it("counts a full roster replacement as 5", () => {
    expect(countSubstitutions(baseline, [10, 20, 30, 40, 50])).toBe(5);
  });

  it("does not charge for returning a previously-swapped player to the baseline", () => {
    // swap player 5 -> 99 (1 change), then swap back to 5 (cumulative count is 0)
    expect(countSubstitutions(baseline, [1, 2, 3, 4, 99])).toBe(1);
    expect(countSubstitutions(baseline, [1, 2, 3, 4, 5])).toBe(0);
  });

  it("handles an empty baseline (every player is new)", () => {
    expect(countSubstitutions([], [1, 2, 3])).toBe(3);
  });
});
