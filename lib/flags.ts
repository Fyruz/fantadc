import countriesRaw from "@/lib/countries.json";
import { CUSTOM_COUNTRIES } from "@/lib/custom-countries";

type CountryRow = { name: string; code: string };

export type CountryOption = {
  label: string;
  value: string;
  flagUrl: string;
};

// Host dei vecchi servizi esterni: usati solo per riconoscere e normalizzare
// eventuali URL ancora salvati nel DB verso le bandiere locali.
const EXTERNAL_FLAG_HOSTS = ["flagsapi.com", "flagcdn.com"];

// Bandiere SVG self-hosted che hanno priorità sui PNG scaricati da download-flags.mjs.
const SVG_FLAGS: Record<string, string> = {
  AR: "/flags/argentina.svg",
  BR: "/flags/brazil.svg",
  BI: "/flags/burundi.svg",
  CX: "/flags/christmas_island.svg",
  ER: "/flags/eritrea.svg",
  DE: "/flags/germany.svg",
  IE: "/flags/ireland.svg",
  KW: "/flags/kuwait.svg",
  LA: "/flags/laos.svg",
  NZ: "/flags/new_zealand.svg",
  NG: "/flags/nigeria.svg",
  PT: "/flags/portugal.svg",
  RU: "/flags/russia.svg",
  ES: "/flags/spain.svg",
  VE: "/flags/venezuela.svg",
};

// Paesi ISO: bandiera self-hosted come /flags/{cc}.png (vedi scripts/download-flags.mjs),
// oppure SVG dove disponibile.
const isoRows: CountryOption[] = (countriesRaw as CountryRow[]).map((country) => ({
  label: country.name,
  value: country.code,
  flagUrl: SVG_FLAGS[country.code] ?? `/flags/${country.code.toLowerCase()}.png`,
}));

// Paesi/regioni custom (vedi lib/custom-countries.ts): bandiera a percorso esplicito.
const customRows: CountryOption[] = CUSTOM_COUNTRIES.map((country) => ({
  label: country.name,
  value: country.code,
  flagUrl: country.flagUrl,
}));

export const COUNTRY_OPTIONS: CountryOption[] = [...isoRows, ...customRows].sort(
  (a, b) => a.label.localeCompare(b.label, "en")
);

const COUNTRY_CODES = new Set(COUNTRY_OPTIONS.map((option) => option.value));
const FLAG_URL_BY_CODE = new Map(
  COUNTRY_OPTIONS.map((option) => [option.value, option.flagUrl])
);

export function normalizeCountryCode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toUpperCase();
  if (!normalized) return undefined;
  return normalized;
}

export function isSupportedCountryCode(value: unknown): boolean {
  const normalized = normalizeCountryCode(value);
  if (!normalized) return false;
  // ISO a 2 lettere oppure codici custom fino a 3 lettere (es. "EUS").
  if (!/^[A-Z]{2,3}$/.test(normalized)) return false;
  return COUNTRY_CODES.has(normalized);
}

// Restituisce il percorso della bandiera per un codice (ISO o custom).
export function buildFlagUrl(countryCode: string): string {
  const normalized = countryCode.trim().toUpperCase();
  return FLAG_URL_BY_CODE.get(normalized) ?? `/flags/${normalized.toLowerCase()}.png`;
}

export function getFlagUrlFromCountryCode(value: unknown): string | null {
  const normalized = normalizeCountryCode(value);
  if (!normalized || !isSupportedCountryCode(normalized)) return null;
  return FLAG_URL_BY_CODE.get(normalized) ?? null;
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
