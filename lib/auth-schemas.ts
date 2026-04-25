import { z } from "zod";

/**
 * Schema di validazione per la registrazione.
 *
 * Nota: Zod applica i validator sull'input originale e i transform (.trim(),
 * .toLowerCase()) sull'output di parsed.data. Le regole di lunghezza
 * funzionano quindi sul valore grezzo ricevuto dal form; valori con
 * spaziatura intenzionale (es. " M ") potrebbero in teoria passare la
 * lunghezza minima ma vengono comunque salvati trimmed, che è il
 * comportamento accettabile per un campo nome.
 */
export const RegisterSchema = z.object({
  name: z
    .string()
    // Two separate .min() calls intentionally: the first shows "obbligatorio" for
    // an empty field, while the second shows "almeno 2 caratteri" for a one-char
    // input. Zod collects all errors; the UI displays only [0].
    .min(1, { message: "Il nome è obbligatorio." })
    .min(2, { message: "Il nome deve avere almeno 2 caratteri." })
    .max(30, { message: "Il nome non può superare i 30 caratteri." })
    .trim(),
  email: z
    .string()
    .min(1, { message: "L'email è obbligatoria." })
    .email({ message: "Inserisci un indirizzo email valido (es. nome@dominio.it)." })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, { message: "La password deve essere di almeno 8 caratteri." })
    .max(72, { message: "Password troppo lunga." }),
});

export const LoginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
