import { describe, expect, test } from "vitest";
import { filterGroups } from "@/app/(user)/squadra/crea/_types";
import type { PlayerGroup } from "@/app/(user)/squadra/crea/_types";

const groups: PlayerGroup[] = [
  {
    teamId: 1,
    teamName: "Juventus",
    teamCode: "JUV",
    players: [
      { id: 1, name: "Vlahovic", role: "A", footballTeam: { id: 1, name: "Juventus", shortName: "JUV" } },
      { id: 2, name: "Yildiz", role: "A", footballTeam: { id: 1, name: "Juventus", shortName: "JUV" } },
    ],
  },
  {
    teamId: 2,
    teamName: "Inter",
    teamCode: "INT",
    players: [
      { id: 3, name: "Lautaro", role: "A", footballTeam: { id: 2, name: "Inter", shortName: "INT" } },
    ],
  },
];

describe("filterGroups", () => {
  test("restituisce tutti i gruppi se la query è vuota", () => {
    expect(filterGroups(groups, "")).toHaveLength(2);
  });

  test("restituisce tutti i gruppi se la query è solo spazi", () => {
    expect(filterGroups(groups, "   ")).toHaveLength(2);
  });

  test("filtra per nome giocatore (case-insensitive)", () => {
    const result = filterGroups(groups, "vlah");
    expect(result).toHaveLength(1);
    expect(result[0].players).toHaveLength(1);
    expect(result[0].players[0].name).toBe("Vlahovic");
  });

  test("filtra per nome squadra", () => {
    const result = filterGroups(groups, "inter");
    expect(result).toHaveLength(1);
    expect(result[0].teamId).toBe(2);
  });

  test("filtra per codice squadra", () => {
    const result = filterGroups(groups, "JUV");
    expect(result).toHaveLength(1);
    expect(result[0].teamCode).toBe("JUV");
  });

  test("restituisce array vuoto se nessun match", () => {
    expect(filterGroups(groups, "zzz")).toHaveLength(0);
  });

  test("esclude un gruppo se tutti i suoi giocatori non matchano", () => {
    const result = filterGroups(groups, "lautaro");
    expect(result).toHaveLength(1);
    expect(result[0].teamId).toBe(2);
  });
});
