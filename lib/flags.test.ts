import { describe, expect, it } from "vitest";
import {
  buildFlagUrl,
  COUNTRY_OPTIONS,
  getFlagUrlFromCountryCode,
  isSupportedCountryCode,
  normalizeCountryCode,
  resolveTeamFlag,
} from "./flags";
import { CUSTOM_COUNTRIES } from "./custom-countries";

describe("flags helpers", () => {
  it("normalizza country code in uppercase", () => {
    expect(normalizeCountryCode(" it ")).toBe("IT");
  });

  it("ritorna undefined su valori vuoti o non stringa", () => {
    expect(normalizeCountryCode("")).toBeUndefined();
    expect(normalizeCountryCode(null)).toBeUndefined();
    expect(normalizeCountryCode(undefined)).toBeUndefined();
  });

  it("accetta country code ISO2 validi", () => {
    expect(isSupportedCountryCode("IT")).toBe(true);
    expect(isSupportedCountryCode("it")).toBe(true);
    expect(isSupportedCountryCode("US")).toBe(true);
  });

  it("rifiuta country code non validi", () => {
    expect(isSupportedCountryCode("I")).toBe(false);
    expect(isSupportedCountryCode("ITA")).toBe(false);
    expect(isSupportedCountryCode("1T")).toBe(false);
  });

  it("genera path bandiera locale coerente", () => {
    expect(buildFlagUrl("IT")).toBe("/flags/it.png");
  });

  it("restituisce path solo per country code supportati", () => {
    expect(getFlagUrlFromCountryCode("IT")).toBe("/flags/it.png");
    expect(getFlagUrlFromCountryCode("ZZ")).toBeNull();
    expect(getFlagUrlFromCountryCode("ITA")).toBeNull();
  });

  it("resolveTeamFlag normalizza vecchi URL esterni verso la bandiera locale", () => {
    expect(
      resolveTeamFlag({ countryCode: "IT", logoUrl: "https://flagsapi.com/IT/flat/64.png" })
    ).toBe("/flags/it.png");
    expect(
      resolveTeamFlag({ countryCode: "IT", logoUrl: "https://flagcdn.com/w40/it.png" })
    ).toBe("/flags/it.png");
  });

  it("resolveTeamFlag preferisce un logo custom reale", () => {
    expect(
      resolveTeamFlag({ countryCode: "IT", logoUrl: "/uploads/logo.png" })
    ).toBe("/uploads/logo.png");
  });

  it("resolveTeamFlag ricava la bandiera dal solo countryCode", () => {
    expect(resolveTeamFlag({ countryCode: "FR", logoUrl: null })).toBe("/flags/fr.png");
    expect(resolveTeamFlag({ countryCode: null, logoUrl: null })).toBeNull();
  });
});

describe("paesi custom", () => {
  it("i Paesi Baschi sono supportati e selezionabili", () => {
    expect(isSupportedCountryCode("EUS")).toBe(true);
    expect(getFlagUrlFromCountryCode("eus")).toBe("/flags/paesi_baschi.svg");
    expect(buildFlagUrl("EUS")).toBe("/flags/paesi_baschi.svg");
    expect(COUNTRY_OPTIONS.some((o) => o.value === "EUS" && o.label === "Paesi Baschi")).toBe(true);
  });

  it("ogni paese custom è presente tra le opzioni con la sua bandiera", () => {
    for (const custom of CUSTOM_COUNTRIES) {
      expect(isSupportedCountryCode(custom.code)).toBe(true);
      expect(getFlagUrlFromCountryCode(custom.code)).toBe(custom.flagUrl);
      const option = COUNTRY_OPTIONS.find((o) => o.value === custom.code);
      expect(option).toEqual({ label: custom.name, value: custom.code, flagUrl: custom.flagUrl });
    }
  });

  it("resolveTeamFlag funziona per una squadra con codice custom", () => {
    expect(resolveTeamFlag({ countryCode: "EUS", logoUrl: null })).toBe("/flags/paesi_baschi.svg");
  });
});
