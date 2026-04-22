import { describe, expect, it } from "vitest";
import { buildVoteOpenNotificationPayload } from "@/lib/push-payload";

describe("buildVoteOpenNotificationPayload", () => {
  it("builds a direct vote deep link payload", () => {
    expect(buildVoteOpenNotificationPayload(12, "Azzurri vs Rossi")).toEqual({
      title: "Votazione MVP aperta",
      body: "È finita Azzurri vs Rossi. Apri subito il voto MVP.",
      url: "/vota/12",
      tag: "vote-open-12",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    });
  });
});
