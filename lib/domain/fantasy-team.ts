import { z } from "zod";

/**
 * Regola di validazione del nome di una squadra fanta.
 * Condivisa tra la creazione lato utente e la modifica lato admin.
 */
export const fantasyTeamNameSchema = z
  .string()
  .min(1, "Nome obbligatorio")
  .max(40, "Max 40 caratteri")
  .trim()
  .refine((n) => !/\b(merda|cazzo|vaffanculo|stronzo|puttana)\b/i.test(n), {
    message: "Il nome contiene parole non consentite.",
  });
