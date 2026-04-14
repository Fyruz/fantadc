"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import type { ActionResult } from "./football-teams";

const GroupSchema = z.object({
  name: z.string().min(1, "Nome obbligatorio").max(50),
  slug: z.string().min(1, "Slug obbligatorio").max(4).toUpperCase(),
  order: z.coerce.number().int().min(0).default(0),
});

export async function createGroup(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = GroupSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    order: formData.get("order") || 0,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const existing = await db.group.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { errors: { slug: ["Slug già in uso."] } };

  const group = await db.group.create({ data: parsed.data });
  await logAdminAction(Number(admin.id), "CREATE", "Group", group.id, null, group);

  revalidatePath("/admin/gironi");
  redirect(`/admin/gironi/${group.id}`);
}

export async function updateGroup(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  const parsed = GroupSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    order: formData.get("order") || 0,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const conflict = await db.group.findFirst({ where: { slug: parsed.data.slug, id: { not: id } } });
  if (conflict) return { errors: { slug: ["Slug già in uso da un altro girone."] } };

  const before = await db.group.findUnique({ where: { id } });
  const group = await db.group.update({ where: { id }, data: parsed.data });
  await logAdminAction(Number(admin.id), "UPDATE", "Group", id, before, group);

  revalidatePath("/admin/gironi");
  revalidatePath(`/admin/gironi/${id}`);
  return {};
}

export async function deleteGroup(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));

  const matchCount = await db.match.count({ where: { groupId: id } });
  if (matchCount > 0) return { message: "Impossibile eliminare: il girone ha partite associate." };

  const before = await db.group.findUnique({ where: { id } });
  await db.group.delete({ where: { id } });
  await logAdminAction(Number(admin.id), "DELETE", "Group", id, before, null);

  revalidatePath("/admin/gironi");
  redirect("/admin/gironi");
}

export async function addTeamToGroup(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const groupId = Number(formData.get("groupId"));
  const footballTeamId = Number(formData.get("footballTeamId"));
  if (!groupId || !footballTeamId) return { message: "Dati mancanti." };

  // Una squadra può stare in un solo girone
  const alreadyInGroup = await db.groupTeam.findFirst({ where: { footballTeamId } });
  if (alreadyInGroup) return { message: "Questa squadra è già assegnata a un girone." };

  await db.groupTeam.create({ data: { groupId, footballTeamId, qualified: false } });
  await logAdminAction(Number(admin.id), "ADD_TEAM_TO_GROUP", "GroupTeam", groupId, null, { groupId, footballTeamId });

  revalidatePath(`/admin/gironi/${groupId}`);
  revalidatePath("/admin/gironi");
  return {};
}

export async function removeTeamFromGroup(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const groupId = Number(formData.get("groupId"));
  const footballTeamId = Number(formData.get("footballTeamId"));

  await db.groupTeam.delete({ where: { groupId_footballTeamId: { groupId, footballTeamId } } });
  await logAdminAction(Number(admin.id), "REMOVE_TEAM_FROM_GROUP", "GroupTeam", groupId, { groupId, footballTeamId }, null);

  revalidatePath(`/admin/gironi/${groupId}`);
  revalidatePath("/admin/gironi");
  return {};
}

export async function setTeamQualified(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const groupId = Number(formData.get("groupId"));
  const footballTeamId = Number(formData.get("footballTeamId"));
  const qualified = formData.get("qualified") === "true";

  await db.groupTeam.update({
    where: { groupId_footballTeamId: { groupId, footballTeamId } },
    data: { qualified },
  });
  await logAdminAction(Number(admin.id), "SET_QUALIFIED", "GroupTeam", groupId, { footballTeamId, qualified: !qualified }, { footballTeamId, qualified });

  revalidatePath(`/admin/gironi/${groupId}`);
  revalidatePath("/admin/gironi");
  revalidatePath("/gironi");
  return {};
}
