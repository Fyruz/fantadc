import { describe, expect, it } from "vitest";
import {
  buildFlagUrl,
  getFlagUrlFromCountryCode,
  isSupportedCountryCode,
  normalizeCountryCode,
  resolveTeamFlag,
} from "./flags";

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
