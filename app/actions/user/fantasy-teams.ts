"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PlayerRole } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { validateRoster } from "@/lib/domain/roster";

export type CreateTeamResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

const Schema = z.object({
  name: z
    .string()
    .min(1, "Nome obbligatorio")
    .max(40, "Max 40 caratteri")
    .trim()
    .refine((n) => !/\b(merda|cazzo|vaffanculo|stronzo|puttana)\b/i.test(n), {
      message: "Il nome contiene parole non consentite.",
    }),
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

  await db.$transaction([
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
  redirect("/squadra");
}
