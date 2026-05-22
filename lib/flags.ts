import countriesRaw from "@/lib/countries.json";

type CountryRow = { name: string; code: string };

export const FLAGS_API_STYLE = "flat";
export const FLAGS_API_SIZE = 64;

const rows = [...(countriesRaw as CountryRow[])].sort((a, b) =>
  a.name.localeCompare(b.name, "en")
);

export type CountryOption = {
  label: string;
  value: string;
  flagUrl: string;
};

const COUNTRY_CODES = new Set(rows.map((country) => country.code));

export const COUNTRY_OPTIONS: CountryOption[] = rows.map((country) => ({
  label: country.name,
  value: country.code,
  flagUrl: buildFlagsApiUrl(country.code),
}));

export function normalizeCountryCode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toUpperCase();
  if (!normalized) return undefined;
  return normalized;
}

export function isSupportedCountryCode(value: unknown): boolean {
  const normalized = normalizeCountryCode(value);
  if (!normalized) return false;
  if (!/^[A-Z]{2}$/.test(normalized)) return false;
  return COUNTRY_CODES.has(normalized);
}

export function buildFlagsApiUrl(countryCode: string): string {
  return `https://flagsapi.com/${countryCode}/${FLAGS_API_STYLE}/${FLAGS_API_SIZE}.png`;
}

export function getFlagUrlFromCountryCode(value: unknown): string | null {
  const normalized = normalizeCountryCode(value);
  if (!normalized || !isSupportedCountryCode(normalized)) return null;
  return buildFlagsApiUrl(normalized);
}
