import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";
import { computeFantasyTeamPoints } from "@/lib/scoring";

/**
 * Chiude la fase di punteggio corrente: congela i punti di ogni squadra (rosa
 * attuale) sulle partite concluse dall'ultima chiusura a ora.
 *
 * NB: helper interno (non è una server action). L'autorizzazione admin deve
 * essere garantita dal chiamante (le action wrapper fanno `requireAdmin`).
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
