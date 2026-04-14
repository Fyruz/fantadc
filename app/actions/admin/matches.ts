"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { MatchStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import type { ActionResult } from "./football-teams";

const scoreField = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
  z.number().int().min(0).max(99).nullable()
);

const Schema = z.object({
  homeTeamId: z.coerce.number().int().positive("Squadra casa obbligatoria"),
  awayTeamId: z.coerce.number().int().positive("Squadra ospite obbligatoria"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida").or(z.literal("")),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Ora non valida").or(z.literal("")),
  status: z.nativeEnum(MatchStatus).optional(),
  homeScore: scoreField.optional(),
  awayScore: scoreField.optional(),
});

const CreateSchema = z.object({
  homeTeamId: z.coerce.number().int().positive("Squadra casa obbligatoria"),
  awayTeamId: z.coerce.number().int().positive("Squadra ospite obbligatoria"),
  status: z.nativeEnum(MatchStatus).default(MatchStatus.DRAFT),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida").or(z.literal("")).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Ora non valida").or(z.literal("")).optional(),
  groupId: z.preprocess((v) => (v === "" || v === null || v === undefined ? null : Number(v)), z.number().int().positive().nullable()).optional(),
  knockoutRoundId: z.preprocess((v) => (v === "" || v === null || v === undefined ? null : Number(v)), z.number().int().positive().nullable()).optional(),
});

export async function createMatch(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = CreateSchema.safeParse({
    homeTeamId: formData.get("homeTeamId"),
    awayTeamId: formData.get("awayTeamId"),
    status: formData.get("status") || MatchStatus.DRAFT,
    date: formData.get("date") || undefined,
    time: formData.get("time") || undefined,
    groupId: formData.get("groupId") || null,
    knockoutRoundId: formData.get("knockoutRoundId") || null,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  if (parsed.data.homeTeamId === parsed.data.awayTeamId) {
    return { errors: { awayTeamId: ["La squadra ospite deve essere diversa dalla squadra di casa."] } };
  }

  const needsDateTime = parsed.data.status !== MatchStatus.DRAFT;
  if (needsDateTime && (!parsed.data.date || !parsed.data.time)) {
    return { errors: { date: ["Data e ora obbligatorie per questo stato."] } };
  }

  const startsAt = parsed.data.date && parsed.data.time
    ? new Date(`${parsed.data.date}T${parsed.data.time}:00`)
    : new Date(0);

  const match = await db.match.create({
    data: {
      homeTeamId: parsed.data.homeTeamId,
      awayTeamId: parsed.data.awayTeamId,
      status: parsed.data.status,
      startsAt,
      groupId: parsed.data.groupId ?? null,
      knockoutRoundId: parsed.data.knockoutRoundId ?? null,
    },
  });

  const players = await db.player.findMany({
    where: { footballTeamId: { in: [parsed.data.homeTeamId, parsed.data.awayTeamId] } },
    select: { id: true },
  });
  if (players.length > 0) {
    await db.matchPlayer.createMany({
      data: players.map((p) => ({ matchId: match.id, playerId: p.id })),
      skipDuplicates: true,
    });
  }

  await logAdminAction(Number(admin.id), "CREATE", "Match", match.id, null, {
    ...match,
    startsAt: match.startsAt.toISOString(),
    autoAddedPlayers: players.length,
  });

  revalidatePath("/admin/partite");
  redirect("/admin/partite");
}

export async function updateMatch(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  const parsed = Schema.safeParse({
    homeTeamId: formData.get("homeTeamId"),
    awayTeamId: formData.get("awayTeamId"),
    date: formData.get("date"),
    time: formData.get("time"),
    status: formData.get("status") || undefined,
    homeScore: formData.get("homeScore"),
    awayScore: formData.get("awayScore"),
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
    startsAt: new Date(`${parsed.data.date}T${parsed.data.time}:00`),
    homeScore: parsed.data.homeScore ?? null,
    awayScore: parsed.data.awayScore ?? null,
  };

  if (parsed.data.status) {
    updateData.status = parsed.data.status;
    if (parsed.data.status === MatchStatus.CONCLUDED && !before.concludedAt) {
      updateData.concludedAt = new Date();
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

export async function advanceMatchStatus(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("matchId"));
  const newStatus = formData.get("newStatus") as MatchStatus;

  if (!Object.values(MatchStatus).includes(newStatus)) {
    return { message: "Stato non valido." };
  }

  const match = await db.match.findUnique({
    where: { id },
    include: { _count: { select: { players: true } } },
  });
  if (!match) return { message: "Partita non trovata." };

  const updateData: Parameters<typeof db.match.update>[0]["data"] = { status: newStatus };
  if (newStatus === MatchStatus.CONCLUDED && !match.concludedAt) {
    updateData.concludedAt = new Date();
  }

  await db.match.update({ where: { id }, data: updateData });
  await logAdminAction(Number(admin.id), "UPDATE", "Match", id, { status: match.status }, { status: newStatus });

  revalidatePath(`/admin/partite/${id}`);
  revalidatePath("/admin/partite");
  return {};
}

export async function updateMatchScore(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("matchId"));
  const rawHome = formData.get("homeScore");
  const rawAway = formData.get("awayScore");

  const homeScore = rawHome === "" || rawHome === null ? null : Number(rawHome);
  const awayScore = rawAway === "" || rawAway === null ? null : Number(rawAway);

  if (homeScore !== null && (!Number.isInteger(homeScore) || homeScore < 0 || homeScore > 99))
    return { message: "Risultato casa non valido." };
  if (awayScore !== null && (!Number.isInteger(awayScore) || awayScore < 0 || awayScore > 99))
    return { message: "Risultato ospite non valido." };

  const before = await db.match.findUnique({ where: { id }, select: { homeScore: true, awayScore: true } });
  if (!before) return { message: "Partita non trovata." };

  await db.match.update({ where: { id }, data: { homeScore, awayScore } });
  await logAdminAction(Number(admin.id), "UPDATE_SCORE", "Match", id,
    { homeScore: before.homeScore, awayScore: before.awayScore },
    { homeScore, awayScore }
  );

  revalidatePath(`/admin/partite/${id}`);
  revalidatePath(`/partite/${id}`);
  return {};
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
