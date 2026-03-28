"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import type { ActionResult } from "./football-teams";

const Schema = z.object({
  matchId: z.coerce.number().int().positive(),
  playerId: z.coerce.number().int().positive(),
  bonusTypeId: z.coerce.number().int().positive("Tipo bonus obbligatorio"),
  quantity: z.coerce.number().int().min(1).default(1),
});

export async function assignBonus(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = Schema.safeParse({
    matchId: formData.get("matchId"),
    playerId: formData.get("playerId"),
    bonusTypeId: formData.get("bonusTypeId"),
    quantity: formData.get("quantity") || 1,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const bonusType = await db.bonusType.findUnique({ where: { id: parsed.data.bonusTypeId } });
  if (!bonusType) return { message: "Tipo bonus non trovato." };

  // Verifica che il giocatore sia presente nella partita
  const mp = await db.matchPlayer.findUnique({
    where: { matchId_playerId: { matchId: parsed.data.matchId, playerId: parsed.data.playerId } },
  });
  if (!mp) return { message: "Il giocatore non è presente in questa partita." };

  const bonus = await db.playerMatchBonus.create({
    data: {
      matchId: parsed.data.matchId,
      playerId: parsed.data.playerId,
      bonusTypeId: parsed.data.bonusTypeId,
      points: Number(bonusType.points) * parsed.data.quantity,
      quantity: parsed.data.quantity,
    },
  });
  await logAdminAction(Number(admin.id), "ASSIGN_BONUS", "PlayerMatchBonus", bonus.id, null, bonus);

  revalidatePath(`/admin/partite/${parsed.data.matchId}`);
  return {};
}

export async function deleteBonus(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  const matchId = Number(formData.get("matchId"));

  const before = await db.playerMatchBonus.findUnique({ where: { id } });
  if (!before) return { message: "Bonus non trovato." };

  await db.playerMatchBonus.delete({ where: { id } });
  await logAdminAction(Number(admin.id), "DELETE_BONUS", "PlayerMatchBonus", id, before, null);

  revalidatePath(`/admin/partite/${matchId}`);
  return {};
}
