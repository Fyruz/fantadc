import { z } from "zod";
import {
  buildFlagUrl,
  isSupportedCountryCode,
  normalizeCountryCode,
} from "@/lib/flags";

const CountryCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || /^[A-Z]{2}$/.test(value), {
    message: "Codice nazione non valido",
  })
  .refine((value) => !value || isSupportedCountryCode(value), {
    message: "Nazione non supportata",
  });

export const FootballTeamFormSchema = z.object({
  name: z.string().min(1, "Nome obbligatorio").trim(),
  shortName: z.string().trim().optional(),
  countryCode: CountryCodeSchema,
});

export type FootballTeamFormInput = z.infer<typeof FootballTeamFormSchema>;

export type FootballTeamPayload = {
  name: string;
  shortName: string | null;
  countryCode: string | null;
  logoUrl: string | null;
};

export function buildFootballTeamPayload(
  input: FootballTeamFormInput
): FootballTeamPayload {
  const countryCode = normalizeCountryCode(input.countryCode);

  return {
    name: input.name,
    shortName: input.shortName || null,
    countryCode: countryCode ?? null,
    logoUrl: countryCode ? buildFlagUrl(countryCode) : null,
  };
}
