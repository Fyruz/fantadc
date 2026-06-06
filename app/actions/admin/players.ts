"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PlayerRole } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import type { ActionResult } from "./football-teams";

const Schema = z.object({
  name: z.string().min(1, "Nome obbligatorio").trim(),
  role: z.nativeEnum(PlayerRole, { error: "Ruolo non valido" }),
  footballTeamId: z.coerce.number().int().positive("Squadra obbligatoria"),
});

/** Nomi delle squadre fantasy che usano il giocatore (in rosa o come capitano). */
async function fantasyTeamsUsingPlayer(playerId: number): Promise<string[]> {
  const teams = await db.fantasyTeam.findMany({
    where: {
      OR: [{ captainPlayerId: playerId }, { players: { some: { playerId } } }],
    },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return teams.map((t) => t.name);
}

/**
 * Elimina il giocatore rimuovendo prima tutti i riferimenti nelle partite
 * (presenze, voti, goal, bonus). Da chiamare solo dopo aver verificato che
 * il giocatore non appartenga ad alcuna squadra fantasy.
 */
async function deletePlayerWithMatchRefs(playerId: number): Promise<void> {
  await db.$transaction([
    db.matchPlayer.deleteMany({ where: { playerId } }),
    db.vote.deleteMany({ where: { playerId } }),
    db.matchGoal.deleteMany({ where: { scorerId: playerId } }),
    db.playerMatchBonus.deleteMany({ where: { playerId } }),
    db.player.delete({ where: { id: playerId } }),
  ]);
}

function fantasyTeamsError(teamNames: string[]): string {
  const label =
    teamNames.length === 1
      ? "una squadra fantasy"
      : `${teamNames.length} squadre fantasy`;
  return `Impossibile eliminare: il giocatore fa parte di ${label} (${teamNames.join(", ")}).`;
}

export async function createPlayer(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = Schema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    footballTeamId: formData.get("footballTeamId"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const player = await db.player.create({ data: parsed.data });
  await logAdminAction(Number(admin.id), "CREATE", "Player", player.id, null, player);

  revalidatePath("/admin/giocatori");
  redirect("/admin/giocatori");
}

export async function updatePlayer(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  const parsed = Schema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    footballTeamId: formData.get("footballTeamId"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const before = await db.player.findUnique({ where: { id } });
  if (!before) return { message: "Giocatore non trovato." };

  const player = await db.player.update({ where: { id }, data: parsed.data });
  await logAdminAction(Number(admin.id), "UPDATE", "Player", id, before, player);

  revalidatePath("/admin/giocatori");
  redirect("/admin/giocatori");
}

export async function deletePlayer(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));

  const before = await db.player.findUnique({ where: { id } });
  if (!before) return { message: "Giocatore non trovato." };

  const fantasyTeams = await fantasyTeamsUsingPlayer(id);
  if (fantasyTeams.length > 0) return { message: fantasyTeamsError(fantasyTeams) };

  try {
    await deletePlayerWithMatchRefs(id);
  } catch {
    return { message: "Impossibile eliminare il giocatore." };
  }
  await logAdminAction(Number(admin.id), "DELETE", "Player", id, before, null);

  revalidatePath("/admin/giocatori");
  redirect("/admin/giocatori");
}

export async function removePlayerFromFootballTeam(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const playerId = Number(formData.get("playerId"));
  const footballTeamId = Number(formData.get("footballTeamId"));

  if (!playerId || !footballTeamId) return { message: "Dati mancanti." };

  const before = await db.player.findFirst({
    where: { id: playerId, footballTeamId },
  });
  if (!before) return { message: "Giocatore non trovato in questa squadra." };

  const fantasyTeams = await fantasyTeamsUsingPlayer(playerId);
  if (fantasyTeams.length > 0) return { message: fantasyTeamsError(fantasyTeams) };

  try {
    await deletePlayerWithMatchRefs(playerId);
  } catch {
    return { message: "Impossibile eliminare il giocatore." };
  }
  await logAdminAction(Number(admin.id), "DELETE", "Player", playerId, before, null);

  revalidatePath("/admin/squadre");
  revalidatePath(`/admin/squadre/${footballTeamId}/edit`);
  revalidatePath("/admin/giocatori");
  redirect(`/admin/squadre/${footballTeamId}/edit`);
}
