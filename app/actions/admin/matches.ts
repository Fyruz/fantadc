"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { MatchStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import { parseMatchDateTimeInput } from "@/lib/domain/match";
import type { ActionResult } from "./football-teams";
import { revalidateDcupPublicPaths } from "./revalidate-public";

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
  groupId: z.preprocess((v) => (v === "" || v === null || v === undefined ? null : Number(v)), z.number().int().positive().nullable()).optional(),
  knockoutRoundId: z.preprocess((v) => (v === "" || v === null || v === undefined ? null : Number(v)), z.number().int().positive().nullable()).optional(),
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

function startsAtFromForm(date: string | undefined, time: string | undefined) {
  if (date && time) {
    return parseMatchDateTimeInput(date, time);
  }

  const startsAt = new Date();
  startsAt.setSeconds(0, 0);
  return startsAt;
}

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

  if ((parsed.data.date && !parsed.data.time) || (!parsed.data.date && parsed.data.time)) {
    return { errors: { date: ["Inserisci sia data sia ora."] } };
  }

  const startsAt = startsAtFromForm(parsed.data.date, parsed.data.time);

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
  revalidateDcupPublicPaths(match.id);
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
    groupId: formData.get("groupId") || null,
    knockoutRoundId: formData.get("knockoutRoundId") || null,
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
    startsAt: parseMatchDateTimeInput(parsed.data.date, parsed.data.time),
    homeScore: parsed.data.homeScore ?? null,
    awayScore: parsed.data.awayScore ?? null,
    groupId: parsed.data.groupId ?? null,
    knockoutRoundId: parsed.data.knockoutRoundId ?? null,
  };

  if (parsed.data.status) {
    updateData.status = parsed.data.status;
    if (parsed.data.status === MatchStatus.CONCLUDED) {
      if (before.status !== MatchStatus.CONCLUDED || !before.concludedAt) {
        updateData.concludedAt = new Date();
      }
    } else {
      updateData.concludedAt = null;
      updateData.mvpOverridePlayerId = null;
    }
  }

  const match = await db.match.update({ where: { id }, data: updateData });
  await logAdminAction(Number(admin.id), "UPDATE", "Match", id,
    { ...before, startsAt: before.startsAt.toISOString() },
    { ...match, startsAt: match.startsAt.toISOString() }
  );

  revalidatePath("/admin/partite");
  revalidatePath(`/admin/partite/${id}`);
  revalidateDcupPublicPaths(id);
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

  const updateData: Parameters<typeof db.match.update>[0]["data"] = {
    status: newStatus,
    concludedAt: newStatus === MatchStatus.CONCLUDED ? new Date() : null,
  };
  if (newStatus !== MatchStatus.CONCLUDED) {
    updateData.mvpOverridePlayerId = null;
  }

  await db.match.update({ where: { id }, data: updateData });
  await logAdminAction(Number(admin.id), "UPDATE", "Match", id, { status: match.status }, { status: newStatus });

  revalidatePath(`/admin/partite/${id}`);
  revalidatePath("/admin/partite");
  revalidateDcupPublicPaths(id);
  return {};
}

export async function updateMatchMvpOverride(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const matchId = Number(formData.get("matchId"));
  const rawPlayerId = formData.get("playerId");
  const playerId = rawPlayerId === "" || rawPlayerId === null ? null : Number(rawPlayerId);

  if (!Number.isInteger(matchId) || matchId <= 0) {
    return { message: "Partita non valida." };
  }
  if (playerId !== null && (!Number.isInteger(playerId) || playerId <= 0)) {
    return { message: "MVP non valido." };
  }

  const match = await db.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      status: true,
      mvpOverridePlayerId: true,
      players: { select: { playerId: true } },
    },
  });
  if (!match) return { message: "Partita non trovata." };
  if (match.status !== MatchStatus.CONCLUDED) {
    return { message: "Puoi impostare l'MVP solo per partite concluse." };
  }

  if (playerId !== null && !match.players.some((player) => player.playerId === playerId)) {
    return { message: "Il giocatore scelto non è presente in questa partita." };
  }

  const updated = await db.match.update({
    where: { id: matchId },
    data: { mvpOverridePlayerId: playerId },
    select: { id: true, mvpOverridePlayerId: true },
  });

  await logAdminAction(
    Number(admin.id),
    "UPDATE_MVP_OVERRIDE",
    "Match",
    matchId,
    { mvpOverridePlayerId: match.mvpOverridePlayerId },
    { mvpOverridePlayerId: updated.mvpOverridePlayerId }
  );

  revalidatePath(`/admin/partite/${matchId}`);
  revalidatePath(`/partite/${matchId}`);
  revalidatePath("/classifica-fanta");
  revalidatePath("/dashboard");
  revalidateDcupPublicPaths(matchId);
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
  revalidateDcupPublicPaths(id);
  return {};
}

export async function deleteMatch(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));

  const before = await db.match.findUnique({ where: { id } });
  if (!before) return { message: "Partita non trovata." };

  await db.match.delete({ where: { id } });
  await logAdminAction(Number(admin.id), "DELETE", "Match", id, { ...before, startsAt: before.startsAt.toISOString() }, null);

  revalidatePath("/admin/partite");
  revalidateDcupPublicPaths(id);
  redirect("/admin/partite");
}
