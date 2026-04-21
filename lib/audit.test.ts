import { describe, expect, it } from "vitest";
import { sanitizeAuditPayload } from "./audit-utils";

describe("sanitizeAuditPayload", () => {
  it("redacts sensitive keys recursively", () => {
    expect(
      sanitizeAuditPayload({
        email: "user@example.com",
        passwordHash: "secret",
        nested: {
          token: "abc",
        },
      })
    ).toEqual({
      email: "user@example.com",
      passwordHash: "[REDACTED]",
      nested: {
        token: "[REDACTED]",
      },
    });
  });

  it("serializes dates and truncates deep payloads", () => {
    expect(
      sanitizeAuditPayload({
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  level6: "hidden",
                },
              },
            },
          },
        },
      })
    ).toEqual({
      createdAt: "2025-01-01T00:00:00.000Z",
      level1: {
        level2: {
          level3: {
            level4: {
              level5: "[Truncated]",
            },
          },
        },
      },
    });
  });
});
