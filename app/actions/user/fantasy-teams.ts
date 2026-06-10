"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PlayerRole } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { validateRoster } from "@/lib/domain/roster";
import { fantasyTeamNameSchema } from "@/lib/domain/fantasy-team";
import { getActiveEditWindow } from "@/lib/roster-edit-window";
import { countSubstitutions } from "@/lib/domain/roster-edit-window";

export type CreateTeamResult =
  | { success: true; teamId: number }
  | { success: false; errors?: Record<string, string[]>; message?: string };

const Schema = z.object({
  name: fantasyTeamNameSchema,
  captainPlayerId: z.coerce.number().int().positive("Capitano obbligatorio"),
  playerIds: z
    .array(z.coerce.number().int().positive())
    .length(5, "Seleziona esattamente 5 giocatori"),
});

export async function createFantasyTeam(
  _prev: CreateTeamResult | undefined,
  formData: FormData
): Promise<CreateTeamResult> {
  const user = await requireAuth();
  const userId = Number(user.id);

  // Check user doesn't already have a team
  const existing = await db.fantasyTeam.findUnique({ where: { userId } });
  if (existing) {
    return { success: false, message: "Hai già una squadra fantasy." };
  }

  const rawPlayerIds = formData.getAll("playerIds").map(Number);
  const parsed = Schema.safeParse({
    name: formData.get("name"),
    captainPlayerId: formData.get("captainPlayerId"),
    playerIds: rawPlayerIds,
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { name, captainPlayerId, playerIds } = parsed.data;

  const players = await db.player.findMany({
    where: { id: { in: playerIds } },
    select: { id: true, role: true, footballTeamId: true },
  });

  if (players.length !== 5) {
    return { success: false, message: "Uno o più giocatori non trovati." };
  }

  const rosterError = validateRoster(
    players.map((p) => ({ playerId: p.id, role: p.role as PlayerRole, footballTeamId: p.footballTeamId })),
    captainPlayerId
  );

  if (rosterError) {
    const messages: Record<string, string> = {
      WRONG_SIZE: "Seleziona esattamente 5 giocatori.",
      WRONG_GK_COUNT: "Devi avere esattamente 1 portiere.",
      WRONG_PLAYER_COUNT: "Devi avere esattamente 4 giocatori di movimento.",
      DUPLICATE_TEAM: "I 5 giocatori devono appartenere a 5 squadre reali diverse.",
      CAPTAIN_NOT_IN_ROSTER: "Il capitano deve essere uno dei 5 giocatori selezionati.",
    };
    return { success: false, message: messages[rosterError] ?? rosterError };
  }

  const [newTeam] = await db.$transaction([
    db.fantasyTeam.create({
      data: {
        name,
        userId,
        captainPlayerId,
        players: {
          create: playerIds.map((playerId) => ({ playerId })),
        },
      },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/squadra");
  return { success: true, teamId: newTeam.id };
}

export type UpdateRosterResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

const UpdateSchema = z.object({
  captainPlayerId: z.coerce.number().int().positive("Capitano obbligatorio"),
  playerIds: z
    .array(z.coerce.number().int().positive())
    .length(5, "Seleziona esattamente 5 giocatori"),
});

/**
 * Modifica della rosa da parte dell'utente, consentita solo durante una finestra
 * di "mercato" aperta dall'admin e nei limiti di sostituzioni configurati.
 * Il nome squadra non è modificabile; il cambio di capitano è sempre libero.
 */
export async function updateMyFantasyRoster(
  _prev: UpdateRosterResult | undefined,
  formData: FormData
): Promise<UpdateRosterResult> {
  const user = await requireAuth();
  const userId = Number(user.id);

  const team = await db.fantasyTeam.findUnique({
    where: { userId },
    include: { players: { select: { playerId: true } } },
  });
  if (!team) return { success: false, message: "Non hai ancora una squadra." };

  const window = await getActiveEditWindow();
  if (!window) return { success: false, message: "Le modifiche non sono aperte." };

  const rawPlayerIds = formData.getAll("playerIds").map(Number);
  const parsed = UpdateSchema.safeParse({
    captainPlayerId: formData.get("captainPlayerId"),
    playerIds: rawPlayerIds,
  });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { captainPlayerId, playerIds } = parsed.data;

  const players = await db.player.findMany({
    where: { id: { in: playerIds } },
    select: { id: true, role: true, footballTeamId: true },
  });
  if (players.length !== 5) {
    return { success: false, message: "Uno o più giocatori non trovati." };
  }

  const rosterError = validateRoster(
    players.map((p) => ({ playerId: p.id, role: p.role as PlayerRole, footballTeamId: p.footballTeamId })),
    captainPlayerId
  );
  if (rosterError) {
    const messages: Record<string, string> = {
      WRONG_SIZE: "Seleziona esattamente 5 giocatori.",
      WRONG_GK_COUNT: "Devi avere esattamente 1 portiere.",
      WRONG_PLAYER_COUNT: "Devi avere esattamente 4 giocatori di movimento.",
      DUPLICATE_TEAM: "I 5 giocatori devono appartenere a 5 squadre reali diverse.",
      CAPTAIN_NOT_IN_ROSTER: "Il capitano deve essere uno dei 5 giocatori selezionati.",
    };
    return { success: false, message: messages[rosterError] ?? rosterError };
  }

  // Baseline = rosa al primo salvataggio in questa finestra (rosa di partenza).
  const usage = await db.rosterEditUsage.findUnique({
    where: { windowId_fantasyTeamId: { windowId: window.id, fantasyTeamId: team.id } },
  });
  const baseline = usage
    ? (usage.baselinePlayerIds as number[])
    : team.players.map((p) => p.playerId);

  const changesUsed = countSubstitutions(baseline, playerIds);
  if (changesUsed > window.maxChanges) {
    return {
      success: false,
      message: `Puoi sostituire al massimo ${window.maxChanges} ${
        window.maxChanges === 1 ? "giocatore" : "giocatori"
      } rispetto alla rosa di partenza.`,
    };
  }

  await db.$transaction([
    db.rosterEditUsage.upsert({
      where: { windowId_fantasyTeamId: { windowId: window.id, fantasyTeamId: team.id } },
      create: {
        windowId: window.id,
        fantasyTeamId: team.id,
        baselinePlayerIds: baseline,
        changesUsed,
      },
      update: { changesUsed },
    }),
    db.fantasyTeamPlayer.deleteMany({ where: { fantasyTeamId: team.id } }),
    db.fantasyTeamPlayer.createMany({
      data: playerIds.map((playerId) => ({ fantasyTeamId: team.id, playerId })),
    }),
    db.fantasyTeam.update({ where: { id: team.id }, data: { captainPlayerId } }),
  ]);

  revalidatePath("/squadra");
  revalidatePath("/dashboard");
  return { success: true };
}
