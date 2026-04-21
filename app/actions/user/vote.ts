"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { validateVote } from "@/lib/domain/vote";
import { voteLimiter, checkRateLimit } from "@/lib/rate-limit";

export type VoteResult =
  | { success: true }
  | { success: false; message: string };

const Schema = z.object({
  matchId: z.coerce.number().int().positive(),
  playerId: z.coerce.number().int().positive(),
});

export async function castVote(
  _prev: VoteResult | undefined,
  formData: FormData
): Promise<VoteResult> {
  const user = await requireAuth();
  const userId = Number(user.id);

  const parsed = Schema.safeParse({
    matchId: formData.get("matchId"),
    playerId: formData.get("playerId"),
  });
  if (!parsed.success) return { success: false, message: "Dati non validi." };

  const { matchId, playerId } = parsed.data;

  // Rate limit per utente
  const rl = await checkRateLimit(voteLimiter, `vote:${userId}`);
  if (rl.limited) {
    return { success: false, message: `Troppi tentativi. Riprova tra ${rl.retryAfter}s.` };
  }

  const match = await db.match.findUnique({
    where: { id: matchId },
    include: { players: { select: { playerId: true } } },
  });
  if (!match) return { success: false, message: "Partita non trovata." };

  const alreadyVoted = !!(await db.vote.findUnique({
    where: { userId_matchId: { userId, matchId } },
  }));

  const validationError = validateVote({
    playerIds: match.players.map((p) => p.playerId),
    candidatePlayerId: playerId,
    concludedAt: match.concludedAt,
    alreadyVoted,
  });

  if (validationError === "VOTING_WINDOW_CLOSED")
    return { success: false, message: "La finestra di voto è chiusa." };
  if (validationError === "ALREADY_VOTED")
    return { success: false, message: "Hai già votato per questa partita." };
  if (validationError === "PLAYER_NOT_IN_MATCH")
    return { success: false, message: "Il giocatore non è presente in questa partita." };

  try {
    await db.vote.create({ data: { userId, matchId, playerId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, message: "Hai già votato per questa partita." };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { success: false, message: "Il giocatore non è presente in questa partita." };
    }

    return { success: false, message: "Si è verificato un errore durante il voto." };
  }

  revalidatePath(`/vota/${matchId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
