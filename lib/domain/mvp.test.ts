import { describe, expect, it } from "vitest";
import { MVP_WINDOW_MS } from "./vote";
import { resolveMvp } from "./mvp";

describe("resolveMvp", () => {
  const closedAt = new Date(Date.now() - MVP_WINDOW_MS - 60_000);
  const openAt = new Date();

  it("keeps MVP unresolved while the vote window is open", () => {
    expect(
      resolveMvp({
        concludedAt: openAt,
        votes: [{ playerId: 1 }, { playerId: 1 }],
      })
    ).toMatchObject({ status: "open", playerId: null });
  });

  it("resolves a unique winner after the vote window closes", () => {
    expect(
      resolveMvp({
        concludedAt: closedAt,
        votes: [{ playerId: 1 }, { playerId: 2 }, { playerId: 1 }],
      })
    ).toMatchObject({ status: "resolved", playerId: 1, source: "automatic" });
  });

  it("requires an admin decision when final votes are tied", () => {
    expect(
      resolveMvp({
        concludedAt: closedAt,
        votes: [{ playerId: 1 }, { playerId: 2 }],
      })
    ).toMatchObject({ status: "tied", playerId: null, tiedPlayerIds: [1, 2] });
  });

  it("uses a valid admin override after the vote window closes", () => {
    expect(
      resolveMvp({
        concludedAt: closedAt,
        votes: [{ playerId: 1 }, { playerId: 2 }],
        mvpOverridePlayerId: 2,
        eligiblePlayerIds: [1, 2],
      })
    ).toMatchObject({ status: "resolved", playerId: 2, source: "admin" });
  });

  it("does not resolve an MVP when there are no votes", () => {
    expect(resolveMvp({ concludedAt: closedAt, votes: [] })).toMatchObject({
      status: "no_votes",
      playerId: null,
    });
  });
});
