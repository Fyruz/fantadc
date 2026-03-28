"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import type { ActionResult } from "./football-teams";

export async function addMatchPlayer(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const matchId = Number(formData.get("matchId"));
  const playerId = Number(formData.get("playerId"));

  const match = await db.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true },
  });
  if (!match) return { message: "Partita non trovata." };

  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player) return { message: "Giocatore non trovato." };

  if (player.footballTeamId !== match.homeTeamId && player.footballTeamId !== match.awayTeamId) {
    return { message: "Il giocatore non appartiene a nessuna delle due squadre." };
  }

  await db.matchPlayer.upsert({
    where: { matchId_playerId: { matchId, playerId } },
    create: { matchId, playerId },
    update: {},
  });

  await logAdminAction(Number(admin.id), "ADD_PLAYER", "MatchPlayer", `${matchId}_${playerId}`, null, { matchId, playerId });
  revalidatePath(`/admin/partite/${matchId}`);
  return {};
}

export async function addAllMatchPlayers(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const matchId = Number(formData.get("matchId"));

  const match = await db.match.findUnique({
    where: { id: matchId },
    select: { homeTeamId: true, awayTeamId: true },
  });
  if (!match) return { message: "Partita non trovata." };

  const players = await db.player.findMany({
    where: { footballTeamId: { in: [match.homeTeamId, match.awayTeamId] } },
    select: { id: true },
  });

  await db.$transaction(
    players.map((p) =>
      db.matchPlayer.upsert({
        where: { matchId_playerId: { matchId, playerId: p.id } },
        create: { matchId, playerId: p.id },
        update: {},
      })
    )
  );

  await logAdminAction(Number(admin.id), "ADD_PLAYER", "MatchPlayer", `${matchId}_all`, null, {
    matchId,
    count: players.length,
  });
  revalidatePath(`/admin/partite/${matchId}`);
  return {};
}

export async function removeMatchPlayer(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const matchId = Number(formData.get("matchId"));
  const playerId = Number(formData.get("playerId"));

  await db.matchPlayer.deleteMany({ where: { matchId, playerId } });
  await logAdminAction(Number(admin.id), "REMOVE_PLAYER", "MatchPlayer", `${matchId}_${playerId}`, { matchId, playerId }, null);

  revalidatePath(`/admin/partite/${matchId}`);
  return {};
}
