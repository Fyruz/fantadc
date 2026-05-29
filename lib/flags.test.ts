import { describe, expect, it } from "vitest";
import {
  buildFlagsApiUrl,
  getFlagUrlFromCountryCode,
  isSupportedCountryCode,
  normalizeCountryCode,
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

  it("genera URL FlagsAPI coerente", () => {
    expect(buildFlagsApiUrl("IT")).toBe("https://flagsapi.com/IT/flat/64.png");
  });

  it("restituisce URL solo per country code supportati", () => {
    expect(getFlagUrlFromCountryCode("IT")).toBe("https://flagsapi.com/IT/flat/64.png");
    expect(getFlagUrlFromCountryCode("ZZ")).toBeNull();
    expect(getFlagUrlFromCountryCode("ITA")).toBeNull();
  });
});
