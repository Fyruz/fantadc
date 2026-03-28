"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import type { ActionResult } from "./football-teams";

const Schema = z.object({
  code: z.string().min(1).toUpperCase().trim(),
  name: z.string().min(1, "Nome obbligatorio").trim(),
  points: z.coerce.number({ error: "Valore numerico richiesto" }),
});

export async function createBonusType(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = Schema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    points: formData.get("points"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const bt = await db.bonusType.create({ data: { ...parsed.data, points: parsed.data.points } });
  await logAdminAction(Number(admin.id), "CREATE", "BonusType", bt.id, null, bt);

  revalidatePath("/admin/bonus-types");
  return {};
}

export async function updateBonusType(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  const parsed = Schema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    points: formData.get("points"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const before = await db.bonusType.findUnique({ where: { id } });
  if (!before) return { message: "Bonus type non trovato." };

  const bt = await db.bonusType.update({ where: { id }, data: { ...parsed.data, points: parsed.data.points } });
  await logAdminAction(Number(admin.id), "UPDATE", "BonusType", id, before, bt);

  revalidatePath("/admin/bonus-types");
  return {};
}

export async function deleteBonusType(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));

  const before = await db.bonusType.findUnique({ where: { id } });
  if (!before) return { message: "Bonus type non trovato." };

  try {
    await db.bonusType.delete({ where: { id } });
    await logAdminAction(Number(admin.id), "DELETE", "BonusType", id, before, null);
  } catch {
    return { message: "Impossibile eliminare: il bonus type è già assegnato a delle partite." };
  }

  revalidatePath("/admin/bonus-types");
  return {};
}
