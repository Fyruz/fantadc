"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  AUTH_ONBOARDING_PATH,
  resolvePostAuthRedirect,
  sanitizeNextPath,
} from "@/lib/post-auth";
import {
  registerLimiter,
  loginLimiter,
  checkRateLimit,
} from "@/lib/rate-limit";

// --- Schemas ---

const RegisterSchema = z.object({
  email: z.string().email({ message: "Email non valida." }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { message: "La password deve essere di almeno 8 caratteri." })
    .max(72, { message: "Password troppo lunga." }),
  name: z.string().min(2, { message: "Il nome deve avere almeno 2 caratteri." }).trim().optional(),
});

const LoginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
});

export type AuthActionResult = {
  errors?: Record<string, string[]>;
  message?: string;
};

// --- Register ---

export async function register(
  _prev: AuthActionResult | undefined,
  formData: FormData
): Promise<AuthActionResult> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? "unknown";

  const { limited, retryAfter } = await checkRateLimit(registerLimiter, ip);
  if (limited) {
    return {
      message: `Troppi tentativi. Riprova tra ${retryAfter} secondi.`,
    };
  }

  const parsed = RegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { email, password, name } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: ["Questa email è già registrata."] } };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { email, passwordHash, name },
    select: { role: true },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { message: "Registrazione completata, ma non è stato possibile avviare la sessione. Effettua il login." };
    }
    throw e;
  }

  redirect(
    resolvePostAuthRedirect({
      role: user.role,
      hasFantasyTeam: false,
      next: AUTH_ONBOARDING_PATH,
    })
  );
}

// --- Login ---

export async function login(
  _prev: AuthActionResult | undefined,
  formData: FormData
): Promise<AuthActionResult> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? "unknown";

  const { limited, retryAfter } = await checkRateLimit(loginLimiter, ip);
  if (limited) {
    return {
      message: `Troppi tentativi. Riprova tra ${retryAfter} secondi.`,
    };
  }

  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { message: "Credenziali non valide." };
  }

  const existingUser = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, role: true, fantasyTeam: { select: { id: true } } },
  });

  const safeNext = sanitizeNextPath(formData.get("next"));

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.type === "CredentialsSignin" && (e as { cause?: { err?: { code?: string } } }).cause?.err?.code === "suspended") {
        return { message: "Account sospeso. Contatta un amministratore." };
      }
      return { message: "Email o password non corretti." };
    }
    throw e;
  }

  redirect(
    resolvePostAuthRedirect({
      role: existingUser?.role ?? UserRole.USER,
      hasFantasyTeam: !!existingUser?.fantasyTeam,
      next: safeNext,
    })
  );
}

// --- Logout ---

export async function logout() {
  await signOut({ redirectTo: "/" });
}
