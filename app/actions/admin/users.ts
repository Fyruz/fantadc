"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { isWithinBcryptByteLimit } from "@/lib/password";
import { requireAdmin } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import type { ActionResult } from "./football-teams";

const UserIdSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export async function suspendUser(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const adminId = Number(admin.id);
  const parsed = UserIdSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { message: "Utente non valido." };

  const { userId } = parsed.data;

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { message: "Utente non trovato." };
  if (user.id === adminId) return { message: "Non puoi sospendere te stesso." };

  await db.user.update({ where: { id: userId }, data: { isSuspended: true } });
  await logAdminAction(adminId, "SUSPEND_USER", "User", userId, { isSuspended: false }, { isSuspended: true });

  revalidatePath("/admin/utenti");
  revalidatePath(`/admin/utenti/${userId}`);
  return {};
}

export async function unsuspendUser(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const adminId = Number(admin.id);
  const parsed = UserIdSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { message: "Utente non valido." };

  const { userId } = parsed.data;

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { message: "Utente non trovato." };
  if (!user.isSuspended) return {};

  await db.user.update({ where: { id: userId }, data: { isSuspended: false } });
  await logAdminAction(
    adminId,
    "UNSUSPEND_USER",
    "User",
    userId,
    { isSuspended: true },
    { isSuspended: false }
  );

  revalidatePath("/admin/utenti");
  revalidatePath(`/admin/utenti/${userId}`);
  return {};
}

const CreateAdminSchema = z.object({
  email: z.string().email("Email non valida").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password min 8 caratteri")
    .refine(isWithinBcryptByteLimit, "Password troppo lunga"),
  name: z.string().trim().optional(),
});

export async function createAdmin(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = CreateAdminSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || undefined,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { errors: { email: ["Email già registrata."] } };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const newAdmin = await db.user.create({
    data: { email: parsed.data.email, passwordHash, name: parsed.data.name, role: UserRole.ADMIN },
  });
  await logAdminAction(Number(admin.id), "CREATE_ADMIN", "User", newAdmin.id, null, { email: newAdmin.email, role: newAdmin.role });

  revalidatePath("/admin/utenti");
  return { message: `Admin ${newAdmin.email} creato.` };
}
