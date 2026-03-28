"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";

const Schema = z.object({
  name: z.string().min(1, "Nome obbligatorio").trim(),
  shortName: z.string().trim().optional(),
  logoUrl: z.string().url("URL non valido").trim().optional().or(z.literal("")),
});

export type ActionResult = { errors?: Record<string, string[]>; message?: string };

export async function createFootballTeam(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = Schema.safeParse({
    name: formData.get("name"),
    shortName: formData.get("shortName") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const existing = await db.footballTeam.findUnique({ where: { name: parsed.data.name } });
  if (existing) return { errors: { name: ["Nome già esistente."] } };

  const team = await db.footballTeam.create({ data: { name: parsed.data.name, shortName: parsed.data.shortName, logoUrl: parsed.data.logoUrl || null } });
  await logAdminAction(Number(admin.id), "CREATE", "FootballTeam", team.id, null, team);

  revalidatePath("/admin/squadre");
  redirect("/admin/squadre");
}

export async function updateFootballTeam(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  const parsed = Schema.safeParse({
    name: formData.get("name"),
    shortName: formData.get("shortName") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const before = await db.footballTeam.findUnique({ where: { id } });
  if (!before) return { message: "Squadra non trovata." };

  const team = await db.footballTeam.update({ where: { id }, data: { name: parsed.data.name, shortName: parsed.data.shortName, logoUrl: parsed.data.logoUrl || null } });
  await logAdminAction(Number(admin.id), "UPDATE", "FootballTeam", id, before, team);

  revalidatePath("/admin/squadre");
  redirect("/admin/squadre");
}

export async function deleteFootballTeam(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));

  const before = await db.footballTeam.findUnique({ where: { id } });
  if (!before) return { message: "Squadra non trovata." };

  try {
    await db.footballTeam.delete({ where: { id } });
    await logAdminAction(Number(admin.id), "DELETE", "FootballTeam", id, before, null);
  } catch {
    return { message: "Impossibile eliminare: la squadra ha giocatori o partite associate." };
  }

  revalidatePath("/admin/squadre");
  redirect("/admin/squadre");
}
