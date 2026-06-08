import countriesRaw from "@/lib/countries.json";

type CountryRow = { name: string; code: string };

const rows = [...(countriesRaw as CountryRow[])].sort((a, b) =>
  a.name.localeCompare(b.name, "en")
);

export type CountryOption = {
  label: string;
  value: string;
  flagUrl: string;
};

const COUNTRY_CODES = new Set(rows.map((country) => country.code));

// Host dei vecchi servizi esterni: usati solo per riconoscere e normalizzare
// eventuali URL ancora salvati nel DB verso le bandiere locali.
const EXTERNAL_FLAG_HOSTS = ["flagsapi.com", "flagcdn.com"];

export const COUNTRY_OPTIONS: CountryOption[] = rows.map((country) => ({
  label: country.name,
  value: country.code,
  flagUrl: buildFlagUrl(country.code),
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

// Bandiere self-hosted in public/flags/{cc}.png (vedi scripts/download-flags.mjs).
export function buildFlagUrl(countryCode: string): string {
  return `/flags/${countryCode.toLowerCase()}.png`;
}

export function getFlagUrlFromCountryCode(value: unknown): string | null {
  const normalized = normalizeCountryCode(value);
  if (!normalized || !isSupportedCountryCode(normalized)) return null;
  return buildFlagUrl(normalized);
}

export function isExternalFlagUrl(url: string): boolean {
  return EXTERNAL_FLAG_HOSTS.some((host) => url.includes(host));
}

// Sorgente unica per la bandiera/logo di una squadra:
// - usa logoUrl solo se è un logo "vero" (non un vecchio URL di servizio esterno),
// - altrimenti ricava la bandiera locale dal countryCode.
export function resolveTeamFlag(team: {
  countryCode?: string | null;
  logoUrl?: string | null;
}): string | null {
  const logo = team.logoUrl?.trim();
  if (logo && !isExternalFlagUrl(logo)) return logo;
  return getFlagUrlFromCountryCode(team.countryCode);
}
