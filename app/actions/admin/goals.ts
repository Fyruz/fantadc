"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import type { ActionResult } from "./football-teams";

async function syncMatchScore(matchId: number) {
  const match = await db.match.findUnique({
    where: { id: matchId },
    select: { homeTeamId: true, awayTeamId: true },
  });
  if (!match) return;

  const goals = await db.matchGoal.findMany({
    where: { matchId },
    include: { scorer: { select: { footballTeamId: true } } },
  });

  if (goals.length === 0) {
    await db.match.update({ where: { id: matchId }, data: { homeScore: null, awayScore: null } });
    return;
  }

  let homeScore = 0;
  let awayScore = 0;
  for (const g of goals) {
    const scorerIsHome = g.scorer.footballTeamId === match.homeTeamId;
    if (g.isOwnGoal) {
      if (scorerIsHome) awayScore++;
      else homeScore++;
    } else {
      if (scorerIsHome) homeScore++;
      else awayScore++;
    }
  }

  await db.match.update({ where: { id: matchId }, data: { homeScore, awayScore } });
}

const AddGoalSchema = z.object({
  matchId:   z.coerce.number().int().positive(),
  scorerId:  z.coerce.number().int().positive("Seleziona il marcatore"),
  isOwnGoal: z.preprocess((v) => v === "true" || v === true, z.boolean()).default(false),
  minute:    z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(1).max(120).nullable()
  ),
});

export async function addGoal(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = AddGoalSchema.safeParse({
    matchId:   formData.get("matchId"),
    scorerId:  formData.get("scorerId"),
    isOwnGoal: formData.get("isOwnGoal"),
    minute:    formData.get("minute") || null,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const goal = await db.matchGoal.create({
    data: {
      matchId:   parsed.data.matchId,
      scorerId:  parsed.data.scorerId,
      isOwnGoal: parsed.data.isOwnGoal,
      minute:    parsed.data.minute,
    },
  });
  await logAdminAction(Number(admin.id), "ADD_GOAL", "MatchGoal", goal.id, null, goal);
  await syncMatchScore(parsed.data.matchId);

  revalidatePath(`/admin/partite/${parsed.data.matchId}`);
  return {};
}

export async function deleteGoal(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id     = Number(formData.get("id"));
  const matchId = Number(formData.get("matchId"));

  const before = await db.matchGoal.findUnique({ where: { id } });
  if (!before) return { message: "Goal non trovato." };

  await db.matchGoal.delete({ where: { id } });
  await logAdminAction(Number(admin.id), "DELETE_GOAL", "MatchGoal", id, before, null);
  await syncMatchScore(matchId);

  revalidatePath(`/admin/partite/${matchId}`);
  return {};
}
