import { describe, expect, it } from "vitest";
import {
  buildFootballTeamPayload,
  FootballTeamFormSchema,
} from "./football-team-form";

describe("FootballTeamFormSchema", () => {
  it("accetta countryCode valido", () => {
    const result = FootballTeamFormSchema.safeParse({
      name: "Italia",
      shortName: "ITA",
      countryCode: "IT",
    });
    expect(result.success).toBe(true);
  });

  it("normalizza countryCode lowercase", () => {
    const result = FootballTeamFormSchema.safeParse({
      name: "Italia",
      shortName: "ITA",
      countryCode: "it",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.countryCode).toBe("IT");
  });

  it("rifiuta countryCode con formato non valido", () => {
    const result = FootballTeamFormSchema.safeParse({
      name: "Italia",
      shortName: "ITA",
      countryCode: "ITA",
    });
    expect(result.success).toBe(false);
  });

  it("rifiuta countryCode non supportato", () => {
    const result = FootballTeamFormSchema.safeParse({
      name: "Italia",
      shortName: "ITA",
      countryCode: "ZZ",
    });
    expect(result.success).toBe(false);
  });
});

describe("buildFootballTeamPayload", () => {
  it("imposta logoUrl da countryCode", () => {
    const parsed = FootballTeamFormSchema.parse({
      name: "Italia",
      shortName: "ITA",
      countryCode: "IT",
    });
    const payload = buildFootballTeamPayload(parsed);
    expect(payload.countryCode).toBe("IT");
    expect(payload.logoUrl).toBe("https://flagsapi.com/IT/flat/64.png");
  });

  it("pulisce countryCode e logoUrl quando non presente", () => {
    const parsed = FootballTeamFormSchema.parse({
      name: "Team",
      shortName: "TM",
      countryCode: "",
    });
    const payload = buildFootballTeamPayload(parsed);
    expect(payload.countryCode).toBeNull();
    expect(payload.logoUrl).toBeNull();
  });
});
