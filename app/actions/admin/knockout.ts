"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import { MatchStatus } from "@prisma/client";
import type { ActionResult } from "./football-teams";

// Struttura fissa del bracket (determinata dalla regola del torneo)
const BRACKET_TEMPLATE = [
  // Quarti di finale
  { roundOrder: 1, roundName: "Quarti di finale", bracketPosition: 1, homeSeed: "1A", awaySeed: "2B" },
  { roundOrder: 1, roundName: "Quarti di finale", bracketPosition: 2, homeSeed: "1C", awaySeed: "2D" },
  { roundOrder: 1, roundName: "Quarti di finale", bracketPosition: 3, homeSeed: "2A", awaySeed: "1B" },
  { roundOrder: 1, roundName: "Quarti di finale", bracketPosition: 4, homeSeed: "2C", awaySeed: "1D" },
  // Semifinali
  { roundOrder: 2, roundName: "Semifinale",        bracketPosition: 1, homeSeed: "V QF1", awaySeed: "V QF2" },
  { roundOrder: 2, roundName: "Semifinale",        bracketPosition: 2, homeSeed: "V QF3", awaySeed: "V QF4" },
  // Finale 3°/4°
  { roundOrder: 3, roundName: "Finale 3°/4° posto", bracketPosition: 1, homeSeed: "P SF1", awaySeed: "P SF2" },
  // Finale
  { roundOrder: 4, roundName: "Finale",            bracketPosition: 1, homeSeed: "V SF1", awaySeed: "V SF2" },
];

/** Crea i 4 turni e gli 8 match placeholder in una sola operazione. */
export async function initBracket(_prev: ActionResult | undefined, _formData: FormData): Promise<ActionResult> {
  void _prev;
  void _formData;
  const admin = await requireAdmin();

  const existing = await db.knockoutRound.count();
  if (existing > 0) return { message: "Il bracket esiste già. Eliminare i turni prima di reinizializzare." };

  // Crea i turni raggruppando per roundOrder
  const rounds = new Map<number, { name: string; order: number }>();
  for (const t of BRACKET_TEMPLATE) {
    if (!rounds.has(t.roundOrder)) rounds.set(t.roundOrder, { name: t.roundName, order: t.roundOrder });
  }

  for (const [order, { name }] of [...rounds.entries()].sort((a, b) => a[0] - b[0])) {
    const round = await db.knockoutRound.create({ data: { name, order } });

    const matchesForRound = BRACKET_TEMPLATE.filter((t) => t.roundOrder === order);
    for (const t of matchesForRound) {
      // Placeholder: homeTeamId e awayTeamId vengono impostati a 0 temporaneamente
      // ma usiamo un team fittizio — in realtà non possiamo creare match senza team.
      // Usiamo il primo team disponibile come placeholder e poi l'admin assegna.
      // Alternativa: creare match "TBD" con seed only — ma lo schema richiede homeTeamId.
      // SOLUZIONE: creiamo il match con homeTeamId=awayTeamId=0 NON VALIDO.
      // Quindi creiamo i match senza team (homeTeamId/awayTeamId vengono assegnati dopo).
      // Per farlo: prendiamo il primo team disponibile come "placeholder" temporaneo.
      await db.match.create({
        data: {
          knockoutRoundId: round.id,
          homeSeed: t.homeSeed,
          awaySeed: t.awaySeed,
          bracketPosition: t.bracketPosition,
          status: MatchStatus.DRAFT,
          startsAt: new Date(0), // placeholder, aggiornato quando l'admin fissa la data
          homeTeamId: null,      // TBD — assegnato da assignKnockoutTeams
          awayTeamId: null,
        },
      });
    }

    await logAdminAction(Number(admin.id), "INIT_BRACKET_ROUND", "KnockoutRound", round.id, null, { name, order });
  }

  revalidatePath("/admin/eliminazione");
  revalidatePath("/eliminazione");
  return {};
}

export async function assignKnockoutTeams(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const matchId = Number(formData.get("matchId"));
  const homeTeamId = Number(formData.get("homeTeamId"));
  const awayTeamId = Number(formData.get("awayTeamId"));

  if (!homeTeamId || !awayTeamId) return { message: "Seleziona entrambe le squadre." };
  if (homeTeamId === awayTeamId) return { message: "Le due squadre devono essere diverse." };

  const before = await db.match.findUnique({ where: { id: matchId }, select: { homeTeamId: true, awayTeamId: true } });
  await db.match.update({
    where: { id: matchId },
    data: { homeTeamId, awayTeamId },
  });
  await logAdminAction(Number(admin.id), "ASSIGN_KNOCKOUT_TEAMS", "Match", matchId, before, { homeTeamId, awayTeamId });

  revalidatePath("/admin/eliminazione");
  revalidatePath(`/admin/partite/${matchId}`);
  revalidatePath("/eliminazione");
  return {};
}

export async function updateKnockoutRound(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { message: "Nome obbligatorio." };

  const before = await db.knockoutRound.findUnique({ where: { id } });
  const round = await db.knockoutRound.update({ where: { id }, data: { name } });
  await logAdminAction(Number(admin.id), "UPDATE", "KnockoutRound", id, before, round);

  revalidatePath("/admin/eliminazione");
  return {};
}

export async function deleteBracket(_prev: ActionResult | undefined, _formData: FormData): Promise<ActionResult> {
  void _prev;
  void _formData;
  const admin = await requireAdmin();

  // Elimina solo i match TBD (homeTeamId = null) prima di eliminare i turni
  await db.match.deleteMany({ where: { knockoutRoundId: { not: null }, homeTeamId: null } });
  await db.knockoutRound.deleteMany({});
  await logAdminAction(Number(admin.id), "DELETE_BRACKET", "KnockoutRound", 0, null, null);

  revalidatePath("/admin/eliminazione");
  revalidatePath("/eliminazione");
  return {};
}
