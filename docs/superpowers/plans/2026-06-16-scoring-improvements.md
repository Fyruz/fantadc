# Scoring Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove goal auto-points from scoring, expose bonus/malus breakdown in the public storico partite, and show current-phase per-player points in all fantasy team roster views.

**Architecture:** All scoring logic lives in `lib/scoring.ts`. The public fantasy team detail flows through `lib/data/public/fantasy-rankings.ts` (cached) into `app/(public)/squadre-fanta/[id]/page.tsx`. The user-facing rosa is in `app/(user)/squadra/page.tsx`. Changes are additive: no API surface removed, just data enriched and display updated.

**Tech Stack:** Next.js 15, Prisma, TypeScript, Vitest, Tailwind CSS

---

## File Map

| File | Change |
|------|--------|
| `lib/scoring.ts` | Remove goal loop from `accumulatePlayerTotals`; add `concludedAt` to `MatchScore`; export `getLastClosedAt` |
| `lib/scoring.test.ts` | Add test verifying goals give 0 points |
| `lib/data/public/fantasy-rankings.ts` | Add `lastClosedAt: Date \| null` to `PublicFantasyTeamDetail`; fetch and return it |
| `lib/data/public/cache.ts` | Add `"lastClosedAt"` to date-revival key set |
| `app/(user)/squadra/page.tsx` | Compute current-phase player totals; use in Rosa section |
| `app/(public)/squadre-fanta/[id]/page.tsx` | Add current-phase Rosa points; add bonus chips to storico rows |
| `ai_context/domain_rules.md` | Remove goal-point rule; note MVP lookup code |

---

## Task 1: Remove goal auto-points + update domain rules

**Files:**
- Modify: `lib/scoring.ts` (accumulatePlayerTotals function)
- Modify: `lib/scoring.test.ts` (add new test)
- Modify: `ai_context/domain_rules.md`

- [ ] **Step 1: Write the failing test**

Open `lib/scoring.test.ts`. Inside the `describe("accumulatePlayerTotals", ...)` block, after the last `it(...)`, add:

```typescript
  it("does not assign points for goals (goals are tracked in MatchGoal but scored via bonus types)", () => {
    const totals = accumulatePlayerTotals(
      [{
        bonuses: [],
        goals: [{ scorerId: 1, isOwnGoal: false }, { scorerId: 1, isOwnGoal: false }],
        votes: [],
        concludedAt: closedAt,
        players: [{ playerId: 1 }],
      }],
      5
    );
    expect(totals.get(1)).toBeUndefined();
  });
```

- [ ] **Step 2: Run the test and verify it currently fails**

```bash
npx vitest run lib/scoring.test.ts
```

Expected: the new test fails with something like `expected undefined to be 2` (goals currently add 1pt each).

- [ ] **Step 3: Remove goal loop from `accumulatePlayerTotals`**

In `lib/scoring.ts`, find the `accumulatePlayerTotals` function. Delete these lines (around line 91–95):

```typescript
    for (const goal of match.goals) {
      if (!goal.isOwnGoal) {
        totals.set(goal.scorerId, (totals.get(goal.scorerId) ?? 0) + 1);
      }
    }
```

The function body after the edit should only have the bonus loop and the MVP assignment:

```typescript
export function accumulatePlayerTotals(
  matches: Array<{
    bonuses: Array<{
      playerId: number;
      points: number | string | { toString(): string };
    }>;
    goals: Array<{ scorerId: number; isOwnGoal: boolean }>;
    votes: Array<{ playerId: number }>;
    concludedAt: Date | null;
    mvpOverridePlayerId?: number | null;
    players?: Array<{ playerId: number }>;
  }>,
  mvpBonus: number
): Map<number, number> {
  const totals = new Map<number, number>();

  for (const match of matches) {
    const mvpId = getOfficialMvpPlayerId({
      concludedAt: match.concludedAt,
      votes: match.votes,
      mvpOverridePlayerId: match.mvpOverridePlayerId,
      eligiblePlayerIds: match.players?.map((player) => player.playerId),
    });

    for (const bonus of match.bonuses) {
      totals.set(
        bonus.playerId,
        (totals.get(bonus.playerId) ?? 0) + Number(bonus.points)
      );
    }

    if (mvpId !== null) {
      totals.set(mvpId, (totals.get(mvpId) ?? 0) + mvpBonus);
    }
  }

  return totals;
}
```

- [ ] **Step 4: Run all scoring tests and verify they pass**

```bash
npx vitest run lib/scoring.test.ts
```

Expected: ALL tests pass including the new one. The existing `"aggregates bonus and official MVP points across matches"` test already uses `goals: []` so it is unaffected.

- [ ] **Step 5: Update domain_rules.md**

In `ai_context/domain_rules.md`, find the Punteggio section and remove the goal rule:

Old line to delete:
```
* ogni gol segnato (non autogol) vale 1 punto fantasy per il marcatore
```

Also change the MVP points line:
```
* il giocatore MVP ufficiale riceve 5 punti fantasy
```
to:
```
* il giocatore MVP ufficiale riceve i punti configurati nel BonusType con codice `MVP` (default 3)
```

- [ ] **Step 6: TypeScript check + commit**

```bash
npx tsc --noEmit
```

Expected: no errors.

```bash
git add lib/scoring.ts lib/scoring.test.ts ai_context/domain_rules.md
git commit -m "feat(scoring): rimuovi punti automatici per i goal"
```

---

## Task 2: Add `concludedAt` to `MatchScore` and export `getLastClosedAt`

**Files:**
- Modify: `lib/scoring.ts`

These additions are prerequisites for Tasks 4 and 5.

- [ ] **Step 1: Export `getLastClosedAt`**

In `lib/scoring.ts`, find the `getLastClosedAt` function (currently private, around line 236). Change `async function` to `export async function`:

```typescript
/** Ultima fase chiusa (per il confine della fase in corso). */
export async function getLastClosedAt(): Promise<Date | null> {
  const last = await db.scoringPhase.findFirst({
    orderBy: { order: "desc" },
    select: { closedAt: true },
  });
  return last?.closedAt ?? null;
}
```

- [ ] **Step 2: Add `concludedAt` to the `MatchScore` type**

Find the `MatchScore` type (around line 26) and add the field:

```typescript
export type MatchScore = {
  matchId: number;
  label: string;
  startsAt: Date;
  concludedAt: Date | null;
  playerScores: PlayerMatchScore[];
  total: number;
};
```

- [ ] **Step 3: Return `concludedAt` from `computeTeamHistory`**

In `computeTeamHistory`, find the `return matches.map((match) => { ... })` at the bottom. In the returned object, add `concludedAt: match.concludedAt`:

```typescript
    return {
      matchId: match.id,
      label: `${match.homeTeam?.name ?? match.homeSeed ?? "TBD"} vs ${match.awayTeam?.name ?? match.awaySeed ?? "TBD"}`,
      startsAt: match.startsAt,
      concludedAt: match.concludedAt,
      playerScores,
      total: playerScores.reduce((s, p) => s + p.finalPoints, 0),
    };
```

- [ ] **Step 4: TypeScript check + commit**

```bash
npx tsc --noEmit
```

Expected: no errors.

```bash
git add lib/scoring.ts
git commit -m "feat(scoring): esporta getLastClosedAt, aggiungi concludedAt a MatchScore"
```

---

## Task 3: Add `lastClosedAt` to public fantasy team detail

**Files:**
- Modify: `lib/data/public/fantasy-rankings.ts`
- Modify: `lib/data/public/cache.ts`

- [ ] **Step 1: Add `"lastClosedAt"` to the date revival set in `cache.ts`**

In `lib/data/public/cache.ts`, find `revivePublicDates` and update the key set:

```typescript
export function revivePublicDates<T>(value: T): T {
  return reviveDateFields(value, new Set(["startsAt", "concludedAt", "date", "lastClosedAt"]));
}
```

- [ ] **Step 2: Add `lastClosedAt` to `PublicFantasyTeamDetail` type**

In `lib/data/public/fantasy-rankings.ts`, find the `PublicFantasyTeamDetail` type and add the field:

```typescript
export type PublicFantasyTeamDetail = {
  team: {
    id: number;
    name: string;
    captainPlayerId: number;
    ownerLabel: string;
    players: Array<{
      player: {
        id: number;
        name: string;
        role: string;
        footballTeam: {
          name: string;
          shortName: string | null;
          countryCode: string | null;
          logoUrl: string | null;
        };
      };
    }>;
  };
  history: Awaited<ReturnType<typeof computeTeamHistory>>;
  totalPoints: number;
  lastClosedAt: Date | null;
};
```

- [ ] **Step 3: Populate `lastClosedAt` in `getPublicFantasyTeamDetail`**

In the same file, inside the `getPublicFantasyTeamDetail` loader function, add the `getLastClosedAt` import at the top of the file alongside the other scoring imports:

```typescript
import {
  computeCurrentPhaseRankings,
  computePhaseRankings,
  computeTeamHistory,
  getLastClosedAt,
  getTeamPhaseBreakdown,
  type RankEntry,
} from "@/lib/scoring";
```

Then inside the loader (after `if (!team) return null;`), include `lastClosedAt` in the parallel fetch:

```typescript
    if (!team) return null;

    const [history, phaseBreakdown, lastClosedAt] = await Promise.all([
      computeTeamHistory(teamId),
      getTeamPhaseBreakdown(teamId),
      getLastClosedAt(),
    ]);
    const totalPoints = phaseBreakdown.reduce((sum, phase) => sum + phase.points, 0);

    return {
      team: {
        id: team.id,
        name: team.name,
        captainPlayerId: team.captainPlayerId,
        ownerLabel: team.user.name ?? team.user.email,
        players: team.players,
      },
      history,
      totalPoints,
      lastClosedAt,
    };
```

- [ ] **Step 4: TypeScript check + commit**

```bash
npx tsc --noEmit
```

Expected: no errors.

```bash
git add lib/data/public/fantasy-rankings.ts lib/data/public/cache.ts
git commit -m "feat(data): aggiungi lastClosedAt al dettaglio pubblico squadra fantasy"
```

---

## Task 4: Show current-phase points in user's Rosa

**Files:**
- Modify: `app/(user)/squadra/page.tsx`

Currently the Rosa section shows `playerTotals` computed from **all** history. This task changes it to show totals from the **current phase** only (matches with `concludedAt >= lastClosedAt`, or all matches if no phase has been closed).

- [ ] **Step 1: Import `getLastClosedAt` and fetch in parallel**

In `app/(user)/squadra/page.tsx`, find the imports at the top. Add `getLastClosedAt` to the scoring import:

```typescript
import { computeTeamHistory, getTeamPhaseBreakdown, getLastClosedAt } from "@/lib/scoring";
```

Then in the page function body, find where `history` is fetched:

```typescript
  const history = await computeTeamHistory(fantasyTeam.id);
```

Replace with a parallel fetch that also gets `lastClosedAt`:

```typescript
  const [history, lastClosedAt] = await Promise.all([
    computeTeamHistory(fantasyTeam.id),
    getLastClosedAt(),
  ]);
```

- [ ] **Step 2: Compute current-phase player totals**

Find the existing `playerTotals` computation:

```typescript
  const playerTotals = new Map<number, number>();
  for (const ms of history) {
    for (const ps of ms.playerScores) {
      playerTotals.set(ps.playerId, (playerTotals.get(ps.playerId) ?? 0) + ps.finalPoints);
    }
  }
```

Replace it with:

```typescript
  const currentPhasePlayerTotals = new Map<number, number>();
  for (const ms of history) {
    if (lastClosedAt && ms.concludedAt && ms.concludedAt < lastClosedAt) continue;
    for (const ps of ms.playerScores) {
      currentPhasePlayerTotals.set(ps.playerId, (currentPhasePlayerTotals.get(ps.playerId) ?? 0) + ps.finalPoints);
    }
  }
```

- [ ] **Step 3: Use `currentPhasePlayerTotals` in the Rosa section**

In the JSX, find the Rosa player rows. The current code reads:

```typescript
          const pts = playerTotals.get(player.id) ?? 0;
```

Change to:

```typescript
          const pts = currentPhasePlayerTotals.get(player.id) ?? 0;
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors. If TypeScript complains about the `playerTotals` variable being unused, that's expected — you replaced it with `currentPhasePlayerTotals`.

- [ ] **Step 5: Commit**

```bash
git add app/(user)/squadra/page.tsx
git commit -m "feat(rosa): mostra punti fase attuale accanto ai giocatori nella rosa utente"
```

---

## Task 5: Update public team page — Rosa points + storico bonus breakdown

**Files:**
- Modify: `app/(public)/squadre-fanta/[id]/page.tsx`

This is a two-part visual change in the same file:
1. Add current-phase per-player points in the Rosa section
2. Add bonus/malus chips in the expanded storico rows

- [ ] **Step 1: Compute current-phase player totals from `detail`**

In `app/(public)/squadre-fanta/[id]/page.tsx`, find where `detail` is destructured:

```typescript
  const { team, history, totalPoints } = detail;
```

Change to:

```typescript
  const { team, history, totalPoints, lastClosedAt } = detail;

  const currentPhasePlayerTotals = new Map<number, number>();
  for (const ms of history) {
    if (lastClosedAt && ms.concludedAt && ms.concludedAt < lastClosedAt) continue;
    for (const ps of ms.playerScores) {
      currentPhasePlayerTotals.set(ps.playerId, (currentPhasePlayerTotals.get(ps.playerId) ?? 0) + ps.finalPoints);
    }
  }
```

- [ ] **Step 2: Add points to Rosa section**

Find the Rosa player rows. Currently each row ends at the captain badge with no points shown. The row looks like:

```tsx
              {/* Captain badge */}
              {isCaptain && (
                <span className="text-xs font-semibold shrink-0" style={{ color: "#C48A00" }}>
                  CAP
                </span>
              )}
            </div>
```

After the captain badge `</div>` closing tag of the row, add the points display:

```tsx
              {/* Captain badge */}
              {isCaptain && (
                <span className="text-xs font-semibold shrink-0" style={{ color: "#C48A00" }}>
                  CAP
                </span>
              )}

              {/* Current phase points */}
              {history.length > 0 && (() => {
                const pts = currentPhasePlayerTotals.get(player.id) ?? 0;
                return (
                  <span
                    className="text-sm font-semibold shrink-0 tabular-nums"
                    style={{ color: pts > 0 ? "var(--primary)" : "rgba(0,0,0,0.35)" }}
                  >
                    {pts.toFixed(1)}
                  </span>
                );
              })()}
            </div>
```

- [ ] **Step 3: Add bonus breakdown to storico expanded rows**

Find the expanded storico player rows in the `history.map(...)` section. The current player row is:

```tsx
                    <div
                      key={ps.playerId}
                      className="flex items-center justify-between py-2"
                      style={{ borderBottom: "1px solid rgba(9,20,76,0.04)" }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {ps.isCaptain && (
                          <span className="text-[10px] font-semibold shrink-0" style={{ color: "#C48A00" }}>CAP</span>
                        )}
                        {ps.isMvp && (
                          <span className="text-[10px] font-semibold shrink-0" style={{ color: "#E8A000" }}>MVP</span>
                        )}
                        <span className="text-sm text-black truncate">{ps.playerName}</span>
                        <span className="text-xs shrink-0" style={{ color: "rgba(0,0,0,0.45)" }}>
                          {ps.footballTeamName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        {ps.isCaptain && ps.basePoints > 0 && (
                          <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.45)" }}>×2</span>
                        )}
                        <span
                          className="text-sm font-semibold"
                          style={{ color: ps.finalPoints > 0 ? "#16A34A" : ps.finalPoints < 0 ? "#DC2626" : "rgba(0,0,0,0.45)" }}
                        >
                          {ps.finalPoints > 0 ? "+" : ""}{ps.finalPoints.toFixed(1)}
                        </span>
                      </div>
                    </div>
```

Replace the entire player row with this version that adds bonus chips and changes `items-center` to `items-start` to handle multi-line rows:

```tsx
                    <div
                      key={ps.playerId}
                      className="flex items-start justify-between py-2"
                      style={{ borderBottom: "1px solid rgba(9,20,76,0.04)" }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          {ps.isCaptain && (
                            <span className="text-[10px] font-semibold shrink-0" style={{ color: "#C48A00" }}>CAP</span>
                          )}
                          {ps.isMvp && (
                            <span className="text-[10px] font-semibold shrink-0" style={{ color: "#E8A000" }}>MVP</span>
                          )}
                          <span className="text-sm text-black truncate">{ps.playerName}</span>
                          <span className="text-xs shrink-0" style={{ color: "rgba(0,0,0,0.45)" }}>
                            {ps.footballTeamName}
                          </span>
                        </div>
                        {(ps.bonusDetails.length > 0 || (ps.isMvp && ps.mvpPoints > 0)) && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {ps.isMvp && ps.mvpPoints > 0 && (
                              <span
                                className="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                                style={{ borderColor: "rgba(232,160,0,0.45)", color: "#C48A00" }}
                              >
                                MVP
                                <span className="ml-1">+{ps.mvpPoints.toFixed(1)}</span>
                              </span>
                            )}
                            {ps.bonusDetails.map((bonus) => (
                              <span
                                key={bonus.code}
                                className="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                                style={{ borderColor: "rgba(9,20,76,0.12)", color: "rgba(0,0,0,0.55)" }}
                                title={bonus.name}
                              >
                                {bonus.code}
                                {bonus.quantity > 1 ? ` ×${bonus.quantity}` : ""}
                                <span className="ml-1">
                                  {bonus.points > 0 ? "+" : ""}{bonus.points.toFixed(1)}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-3 pt-0.5">
                        {ps.isCaptain && ps.basePoints > 0 && (
                          <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.45)" }}>×2</span>
                        )}
                        <span
                          className="text-sm font-semibold"
                          style={{ color: ps.finalPoints > 0 ? "#16A34A" : ps.finalPoints < 0 ? "#DC2626" : "rgba(0,0,0,0.45)" }}
                        >
                          {ps.finalPoints > 0 ? "+" : ""}{ps.finalPoints.toFixed(1)}
                        </span>
                      </div>
                    </div>
```

- [ ] **Step 4: TypeScript check + build**

```bash
npx tsc --noEmit
```

Expected: no errors.

```bash
npm run build
```

Expected: build completes without errors.

- [ ] **Step 5: Commit**

```bash
git add app/(public)/squadre-fanta/[id]/page.tsx
git commit -m "feat(squadre-fanta): punti fase attuale in rosa, breakdown bonus nello storico"
```

---

## Self-Review

**Spec coverage:**
- ✅ Goal non danno punti → Task 1 (`accumulatePlayerTotals` loop rimosso, test aggiunto)
- ✅ MVP da 3 punti → nessuna modifica al codice; l'admin crea il BonusType `MVP` con 3 pt dal pannello admin
- ✅ Storico partite mostra bonus/malus → Task 5 step 3 (pubblico), il dashboard usa già ScoreTable che mostra i chip
- ✅ Rose squadre fanta mostrano punti fase attuale → Task 4 (rosa utente), Task 5 step 2 (rosa pubblica)

**Dependencies in order:**
- Task 2 deve precedere Task 4 e Task 5 (richiede `MatchScore.concludedAt` e `getLastClosedAt`)
- Task 3 deve precedere Task 5 (richiede `PublicFantasyTeamDetail.lastClosedAt`)
- Tasks 1, 2, 3 sono indipendenti tra loro

**No placeholders:** tutto il codice è scritto integralmente.

**Type consistency:** `getLastClosedAt` è esportata in Task 2 e importata in Task 3 e Task 4. `MatchScore.concludedAt: Date | null` è usata consistentemente in Task 4 e Task 5. `currentPhasePlayerTotals` è lo stesso nome usato in Task 4 e Task 5.
