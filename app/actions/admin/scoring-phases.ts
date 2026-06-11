"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import { computeFantasyTeamPoints } from "@/lib/scoring";
import type { ActionResult } from "./football-teams";

function revalidateScoring() {
  revalidatePath("/admin/fasi-punteggio");
  revalidatePath("/admin");
  revalidatePath("/classifica-fanta");
  revalidatePath("/squadra");
  revalidatePath("/dashboard");
  revalidatePath("/squadre-fanta");
}

/**
 * Chiude la fase di punteggio corrente: congela i punti di ogni squadra (rosa
 * attuale) sulle partite concluse dall'ultima chiusura a ora. Core riusato sia
 * dal pulsante dedicato sia dalla spunta all'apertura del mercato.
 */
export async function closeScoringPhase(name: string, adminUserId: number): Promise<number> {
  const last = await db.scoringPhase.findFirst({
    orderBy: { order: "desc" },
    select: { closedAt: true, order: true },
  });
  const from = last?.closedAt ?? null;
  const to = new Date();

  const [points, teams] = await Promise.all([
    computeFantasyTeamPoints({ from, to }),
    db.fantasyTeam.findMany({
      select: { id: true, captainPlayerId: true, players: { select: { playerId: true } } },
    }),
  ]);

  const order = (last?.order ?? 0) + 1;

  const phase = await db.$transaction(async (tx) => {
    const created = await tx.scoringPhase.create({
      data: { name, order, startsAt: from, closedAt: to, createdById: adminUserId },
    });
    if (teams.length > 0) {
      await tx.scoringPhaseScore.createMany({
        data: teams.map((t) => ({
          phaseId: created.id,
          fantasyTeamId: t.id,
          points: points.get(t.id) ?? 0,
          rosterPlayerIds: t.players.map((p) => p.playerId),
          captainPlayerId: t.captainPlayerId,
        })),
      });
    }
    return created;
  });

  await logAdminAction(adminUserId, "CLOSE_SCORING_PHASE", "ScoringPhase", phase.id, null, {
    name,
    order,
    closedAt: to,
    teams: teams.length,
  });

  return phase.id;
}

const NameSchema = z.object({ name: z.string().min(1, "Nome fase obbligatorio").max(60, "Max 60 caratteri").trim() });

export async function closeScoringPhaseAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = NameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  await closeScoringPhase(parsed.data.name, Number(admin.id));
  revalidateScoring();
  return { message: "Fase chiusa e storico salvato." };
}

export async function renameScoringPhase(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  const parsed = NameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const before = await db.scoringPhase.findUnique({ where: { id } });
  if (!before) return { message: "Fase non trovata." };

  await db.scoringPhase.update({ where: { id }, data: { name: parsed.data.name } });
  await logAdminAction(Number(admin.id), "RENAME_SCORING_PHASE", "ScoringPhase", id, before, { name: parsed.data.name });
  revalidateScoring();
  return { message: "Fase rinominata." };
}

/** Elimina solo l'ultima fase (per non rompere il confine delle fasi successive). */
export async function deleteScoringPhase(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));

  const last = await db.scoringPhase.findFirst({ orderBy: { order: "desc" }, select: { id: true } });
  if (!last || last.id !== id) {
    return { message: "Puoi eliminare solo l'ultima fase chiusa." };
  }

  const before = await db.scoringPhase.findUnique({ where: { id } });
  await db.scoringPhase.delete({ where: { id } });
  await logAdminAction(Number(admin.id), "DELETE_SCORING_PHASE", "ScoringPhase", id, before, null);
  revalidateScoring();
  return { message: "Fase eliminata." };
}
