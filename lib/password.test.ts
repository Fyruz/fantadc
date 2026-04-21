import { describe, expect, it } from "vitest";
import { isWithinBcryptByteLimit } from "./password";

describe("isWithinBcryptByteLimit", () => {
  it("accepts ASCII passwords up to 72 bytes", () => {
    expect(isWithinBcryptByteLimit("a".repeat(72))).toBe(true);
    expect(isWithinBcryptByteLimit("a".repeat(73))).toBe(false);
  });

  it("rejects multibyte passwords above the bcrypt byte limit", () => {
    expect(isWithinBcryptByteLimit("é".repeat(36))).toBe(true);
    expect(isWithinBcryptByteLimit("é".repeat(37))).toBe(false);
  });
});
