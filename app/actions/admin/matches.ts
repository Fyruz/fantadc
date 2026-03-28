"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { MatchStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import type { ActionResult } from "./football-teams";

const Schema = z.object({
  homeTeamId: z.coerce.number().int().positive("Squadra casa obbligatoria"),
  awayTeamId: z.coerce.number().int().positive("Squadra ospite obbligatoria"),
  startsAt: z.string().min(1, "Data obbligatoria"),
  status: z.nativeEnum(MatchStatus).optional(),
});

export async function createMatch(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = Schema.safeParse({
    homeTeamId: formData.get("homeTeamId"),
    awayTeamId: formData.get("awayTeamId"),
    startsAt: formData.get("startsAt"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  if (parsed.data.homeTeamId === parsed.data.awayTeamId) {
    return { errors: { awayTeamId: ["La squadra ospite deve essere diversa dalla squadra di casa."] } };
  }

  const match = await db.match.create({
    data: {
      homeTeamId: parsed.data.homeTeamId,
      awayTeamId: parsed.data.awayTeamId,
      startsAt: new Date(parsed.data.startsAt),
    },
  });
  await logAdminAction(Number(admin.id), "CREATE", "Match", match.id, null, { ...match, startsAt: match.startsAt.toISOString() });

  revalidatePath("/admin/partite");
  redirect("/admin/partite");
}

export async function updateMatch(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  const parsed = Schema.safeParse({
    homeTeamId: formData.get("homeTeamId"),
    awayTeamId: formData.get("awayTeamId"),
    startsAt: formData.get("startsAt"),
    status: formData.get("status") || undefined,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  if (parsed.data.homeTeamId === parsed.data.awayTeamId) {
    return { errors: { awayTeamId: ["Le due squadre devono essere diverse."] } };
  }

  const before = await db.match.findUnique({ where: { id } });
  if (!before) return { message: "Partita non trovata." };

  const updateData: Parameters<typeof db.match.update>[0]["data"] = {
    homeTeamId: parsed.data.homeTeamId,
    awayTeamId: parsed.data.awayTeamId,
    startsAt: new Date(parsed.data.startsAt),
  };

  if (parsed.data.status) {
    updateData.status = parsed.data.status;
    if (parsed.data.status === MatchStatus.CONCLUDED && !before.concludedAt) {
      updateData.concludedAt = new Date();
    }
    if (parsed.data.status === MatchStatus.PUBLISHED && !before.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }

  const match = await db.match.update({ where: { id }, data: updateData });
  await logAdminAction(Number(admin.id), "UPDATE", "Match", id,
    { ...before, startsAt: before.startsAt.toISOString() },
    { ...match, startsAt: match.startsAt.toISOString() }
  );

  revalidatePath("/admin/partite");
  revalidatePath(`/admin/partite/${id}`);
  redirect(`/admin/partite/${id}`);
}

export async function deleteMatch(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));

  const before = await db.match.findUnique({ where: { id } });
  if (!before) return { message: "Partita non trovata." };

  await db.match.delete({ where: { id } });
  await logAdminAction(Number(admin.id), "DELETE", "Match", id, { ...before, startsAt: before.startsAt.toISOString() }, null);

  revalidatePath("/admin/partite");
  redirect("/admin/partite");
}
