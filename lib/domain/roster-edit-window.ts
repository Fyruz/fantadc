/**
 * Logica pura della finestra di modifica rosa ("mercato").
 * La rosa è normalmente bloccata per l'utente; durante una finestra aperta
 * l'utente può sostituire fino a `maxChanges` giocatori (il capitano è libero).
 *
 * Le query al DB vivono in `@/lib/roster-edit-window` per mantenere questo
 * modulo privo di dipendenze e facilmente testabile.
 */

export type EditWindowLike = { opensAt: Date; closesAt: Date };

export function isEditWindowOpen(window: EditWindowLike | null, now: Date = new Date()): boolean {
  if (!window) return false;
  return window.opensAt <= now && now < window.closesAt;
}

/**
 * Numero di sostituzioni rispetto alla rosa di partenza: ogni giocatore presente
 * nella nuova rosa ma non nella baseline conta 1. Tornare alla baseline non costa.
 */
export function countSubstitutions(baselinePlayerIds: number[], newPlayerIds: number[]): number {
  const baseline = new Set(baselinePlayerIds);
  return newPlayerIds.filter((id) => !baseline.has(id)).length;
}
