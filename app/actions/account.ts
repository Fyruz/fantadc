"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { signOut } from "@/lib/auth";
import { passwordChangeLimiter, checkRateLimit } from "@/lib/rate-limit";

export type ChangePasswordResult = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Inserisci la password corrente."),
    newPassword: z
      .string()
      .min(8, "La nuova password deve avere almeno 8 caratteri.")
      .max(72, "Password troppo lunga."),
    confirmPassword: z.string().min(1, "Conferma la nuova password."),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"],
  });

export async function changePassword(
  _prev: ChangePasswordResult | undefined,
  formData: FormData
): Promise<ChangePasswordResult> {
  const user = await requireAuth();

  const { limited, retryAfter } = await checkRateLimit(
    passwordChangeLimiter,
    `pw-change-${user.id}`
  );
  if (limited) {
    return { message: `Troppi tentativi. Riprova tra ${retryAfter} secondi.` };
  }

  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { currentPassword, newPassword } = parsed.data;

  const dbUser = await db.user.findUnique({
    where: { id: Number(user.id) },
    select: { passwordHash: true },
  });
  if (!dbUser) return { message: "Utente non trovato." };

  const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!valid) {
    return { errors: { currentPassword: ["Password corrente non corretta."] } };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.user.update({
    where: { id: Number(user.id) },
    data: { passwordHash, passwordChangedAt: new Date() },
  });

  // Invalida la sessione JWT corrente forzando il re-login con la nuova password.
  // I JWT non hanno revoca nativa: signOut cancella il cookie lato client,
  // impedendo a una sessione rubata di restare valida dopo il cambio.
  // signOut({ redirectTo }) lancia internamente NEXT_REDIRECT — la riga
  // successiva è irraggiungibile ma serve al type-checker.
  await signOut({ redirectTo: "/login" });
  return { success: true };
}
