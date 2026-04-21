# Crea Squadra Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign completo della pagina di creazione squadra — mobile full-screen field-first, slot card rettangolari, menu contestuale capitano, bottom sheet selezione con ricerca.

**Architecture:** Si creano tre nuovi file (`_types.ts`, `_slot-card.tsx`, `_player-sheet.tsx`) per decomporre la logica e i componenti. `_form.tsx` viene riscritto per usarli. `page.tsx` viene semplificato. Nessun cambio a logica di validazione, action server o DB.

**Tech Stack:** Next.js 15, React 19, TypeScript, PrimeReact v10, Tailwind CSS v4, Vitest

---

## File Structure

| Azione | File | Responsabilità |
|--------|------|----------------|
| Create | `app/(user)/squadra/crea/_types.ts` | Tipi condivisi, costanti, `getTeamCode`, `filterGroups` |
| Create | `app/(user)/squadra/crea/_slot-card.tsx` | Componente card slot sul campo (vuoto / pieno / capitano) |
| Create | `app/(user)/squadra/crea/_player-sheet.tsx` | Bottom sheet / dialog selezione giocatore con ricerca |
| Modify | `app/(user)/squadra/crea/_form.tsx` | Riscrittura completa: nuovo layout, context menu, wire-up |
| Modify | `app/(user)/squadra/crea/page.tsx` | Rimozione wrapper admin-card, breadcrumb, descrizione |
| Create | `__tests__/squadra/player-sheet.test.ts` | Test puri per `filterGroups` |

---

### Task 1: Tipi e utilità condivise (`_types.ts`)

**Files:**
- Create: `app/(user)/squadra/crea/_types.ts`

- [ ] **Step 1: Creare `_types.ts` con tipi, costanti e `getTeamCode`** (senza `filterGroups` ancora)

```ts
// app/(user)/squadra/crea/_types.ts

export type Player = {
  id: number;
  name: string;
  role: "P" | "A";
  footballTeam: { id: number; name: string; shortName: string | null };
};

export type SlotKey = "goalkeeper" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
export type SlotsState = Record<SlotKey, Player | null>;

export type PlayerGroup = {
  teamId: number;
  teamName: string;
  teamCode: string;
  players: Player[];
};

export const SLOT_ORDER: SlotKey[] = [
  "goalkeeper",
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
];

export const OUTFIELD_SLOTS: SlotKey[] = ["topLeft", "topRight", "bottomLeft", "bottomRight"];

export function getTeamCode(player: Player): string {
  return (player.footballTeam.shortName ?? player.footballTeam.name.slice(0, 3)).toUpperCase();
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```
Expected: nessun errore relativo a `_types.ts`.

- [ ] **Step 3: Commit**

```bash
git add app/(user)/squadra/crea/_types.ts
git commit -m "feat(crea-squadra): shared types and utilities"
```

---

### Task 2: TDD — `filterGroups`

**Files:**
- Create: `__tests__/squadra/player-sheet.test.ts`
- Modify: `app/(user)/squadra/crea/_types.ts`

- [ ] **Step 1: Scrivere il test (fallirà perché `filterGroups` non esiste ancora)**

```ts
// __tests__/squadra/player-sheet.test.ts
import { describe, expect, test } from "vitest";
import { filterGroups } from "@/app/(user)/squadra/crea/_types";
import type { PlayerGroup } from "@/app/(user)/squadra/crea/_types";

const groups: PlayerGroup[] = [
  {
    teamId: 1,
    teamName: "Juventus",
    teamCode: "JUV",
    players: [
      { id: 1, name: "Vlahovic", role: "A", footballTeam: { id: 1, name: "Juventus", shortName: "JUV" } },
      { id: 2, name: "Yildiz", role: "A", footballTeam: { id: 1, name: "Juventus", shortName: "JUV" } },
    ],
  },
  {
    teamId: 2,
    teamName: "Inter",
    teamCode: "INT",
    players: [
      { id: 3, name: "Lautaro", role: "A", footballTeam: { id: 2, name: "Inter", shortName: "INT" } },
    ],
  },
];

describe("filterGroups", () => {
  test("restituisce tutti i gruppi se la query è vuota", () => {
    expect(filterGroups(groups, "")).toHaveLength(2);
  });

  test("restituisce tutti i gruppi se la query è solo spazi", () => {
    expect(filterGroups(groups, "   ")).toHaveLength(2);
  });

  test("filtra per nome giocatore (case-insensitive)", () => {
    const result = filterGroups(groups, "vlah");
    expect(result).toHaveLength(1);
    expect(result[0].players).toHaveLength(1);
    expect(result[0].players[0].name).toBe("Vlahovic");
  });

  test("filtra per nome squadra", () => {
    const result = filterGroups(groups, "inter");
    expect(result).toHaveLength(1);
    expect(result[0].teamId).toBe(2);
  });

  test("filtra per codice squadra", () => {
    const result = filterGroups(groups, "JUV");
    expect(result).toHaveLength(1);
    expect(result[0].teamCode).toBe("JUV");
  });

  test("restituisce array vuoto se nessun match", () => {
    expect(filterGroups(groups, "zzz")).toHaveLength(0);
  });

  test("esclude un gruppo se tutti i suoi giocatori non matchano", () => {
    const result = filterGroups(groups, "lautaro");
    expect(result).toHaveLength(1);
    expect(result[0].teamId).toBe(2);
  });
});
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

```bash
npm test
```
Expected: FAIL — `filterGroups is not a function` o errore di importazione.

- [ ] **Step 3: Aggiungere `filterGroups` a `_types.ts`**

Aggiungere in fondo al file, dopo `getTeamCode`:

```ts
export function filterGroups(groups: PlayerGroup[], query: string): PlayerGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((g) => ({
      ...g,
      players: g.players.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          g.teamName.toLowerCase().includes(q) ||
          g.teamCode.toLowerCase().includes(q)
      ),
    }))
    .filter((g) => g.players.length > 0);
}
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

```bash
npm test
```
Expected: 7 tests passed.

- [ ] **Step 5: Commit**

```bash
git add app/(user)/squadra/crea/_types.ts __tests__/squadra/player-sheet.test.ts
git commit -m "feat(crea-squadra): filterGroups with tests"
```

---

### Task 3: Componente `SlotCard`

**Files:**
- Create: `app/(user)/squadra/crea/_slot-card.tsx`

- [ ] **Step 1: Creare `_slot-card.tsx`**

```tsx
// app/(user)/squadra/crea/_slot-card.tsx
"use client";

import { Button } from "primereact/button";
import { getTeamCode } from "./_types";
import type { Player, SlotKey } from "./_types";

const SLOT_LABEL: Record<SlotKey, string> = {
  goalkeeper: "GK",
  topLeft: "G1",
  topRight: "G2",
  bottomLeft: "G3",
  bottomRight: "G4",
};

const baseClass =
  "relative cursor-pointer rounded-[10px] px-3 py-2 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-60";

export default function SlotCard({
  slotKey,
  player,
  isCaptain,
  pending,
  onEmptyClick,
  onFilledClick,
}: {
  slotKey: SlotKey;
  player: Player | null;
  isCaptain: boolean;
  pending: boolean;
  onEmptyClick: () => void;
  onFilledClick: () => void;
}) {
  const label = SLOT_LABEL[slotKey];

  if (!player) {
    return (
      <Button
        type="button"
        unstyled
        onClick={onEmptyClick}
        disabled={pending}
        aria-label={`Seleziona ${label}`}
        className={`${baseClass} border border-dashed border-white/40 bg-white/[0.12] hover:bg-white/[0.18]`}
        style={{ minWidth: 72 }}
      >
        <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/55">{label}</div>
        <div className="text-[11px] text-white/65">Libero</div>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      unstyled
      onClick={onFilledClick}
      disabled={pending}
      aria-label={`Azioni su ${player.name}`}
      className={`${baseClass} bg-white/90 shadow-[0_3px_10px_rgba(0,0,0,0.18)] hover:bg-white`}
      style={{ minWidth: 72 }}
    >
      {isCaptain && (
        <span className="absolute -right-[7px] -top-[7px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--gold)] text-[9px] font-black text-[var(--text-primary)] shadow-[0_2px_6px_rgba(232,160,0,0.4)]">
          ★
        </span>
      )}
      <div
        className="text-[9px] font-bold uppercase tracking-[1px]"
        style={{ color: "#6466A3" }}
      >
        {getTeamCode(player)}
      </div>
      <div className="text-[13px] font-extrabold leading-tight" style={{ color: "#06073D" }}>
        {player.name}
      </div>
    </Button>
  );
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```
Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add app/(user)/squadra/crea/_slot-card.tsx
git commit -m "feat(crea-squadra): SlotCard component — card-style slot"
```

---

### Task 4: Componente `PlayerSheet`

**Files:**
- Create: `app/(user)/squadra/crea/_player-sheet.tsx`

- [ ] **Step 1: Creare `_player-sheet.tsx`**

```tsx
// app/(user)/squadra/crea/_player-sheet.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { filterGroups } from "./_types";
import type { Player, PlayerGroup } from "./_types";

export default function PlayerSheet({
  visible,
  slotLabel,
  availableGroups,
  currentPlayerId,
  onSelect,
  onHide,
  isMobile,
}: {
  visible: boolean;
  slotLabel: string;
  availableGroups: PlayerGroup[];
  currentPlayerId: number | null;
  onSelect: (player: Player) => void;
  onHide: () => void;
  isMobile: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => filterGroups(availableGroups, search),
    [availableGroups, search]
  );

  const dialogStyle = isMobile
    ? { width: "100%", margin: 0, borderRadius: "20px 20px 0 0", maxHeight: "75vh" }
    : { width: "min(34rem, 96vw)" };

  function handleHide() {
    onHide();
    setSearch("");
  }

  function handleSelect(player: Player) {
    onSelect(player);
    setSearch("");
  }

  return (
    <Dialog
      visible={visible}
      onHide={handleHide}
      header={slotLabel}
      position={isMobile ? "bottom" : "center"}
      style={dialogStyle}
      modal
      draggable={false}
      resizable={false}
    >
      <div className="flex flex-col gap-3">
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per nome o squadra..."
          className="w-full"
        />

        {filtered.length === 0 ? (
          <div className="py-6 text-center text-sm text-[var(--text-muted)]">
            {availableGroups.length === 0
              ? "Nessun giocatore disponibile per questo slot."
              : "Nessun risultato."}
          </div>
        ) : (
          <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto pr-1">
            {filtered.map((group) => (
              <section key={group.teamId}>
                <div className="mb-1 px-1 text-[9px] font-bold uppercase tracking-[2px] text-[var(--text-muted)]">
                  {group.teamName}
                </div>
                <div className="flex flex-col">
                  {group.players.map((player) => (
                    <Button
                      key={player.id}
                      type="button"
                      unstyled
                      onClick={() => handleSelect(player)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                        currentPlayerId === player.id
                          ? "bg-[var(--primary-light)] text-[var(--primary)]"
                          : "text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
                      }`}
                    >
                      <span className="text-sm font-semibold">{player.name}</span>
                      <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        {group.teamCode}
                      </span>
                    </Button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```
Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add app/(user)/squadra/crea/_player-sheet.tsx
git commit -m "feat(crea-squadra): PlayerSheet — bottom sheet + search"
```

---

### Task 5: Riscrittura `_form.tsx`

**Files:**
- Modify: `app/(user)/squadra/crea/_form.tsx`

Layout mobile: nome squadra centrato in cima → campo `flex-1` → conferma centrata in basso.
Layout desktop: campo colonna sinistra → sidebar destra con nome, riepilogo, capitano, conferma.
Context menu: Dialog piccolo (220px) con 3 azioni sullo slot pieno.
`isMobile` rilevato con `useEffect` + `matchMedia` per posizionare il Dialog.

- [ ] **Step 1: Sovrascrivere `_form.tsx` completamente**

```tsx
// app/(user)/squadra/crea/_form.tsx
"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { createFantasyTeam } from "@/app/actions/user/fantasy-teams";
import { getTeamCode, SLOT_ORDER } from "./_types";
import type { Player, PlayerGroup, SlotKey, SlotsState } from "./_types";
import SlotCard from "./_slot-card";
import PlayerSheet from "./_player-sheet";

const SLOT_META: Record<
  SlotKey,
  { label: string; role: Player["role"]; wrapperClassName: string }
> = {
  goalkeeper: {
    label: "Portiere",
    role: "P",
    wrapperClassName: "left-1/2 top-[72%] -translate-x-1/2 -translate-y-1/2",
  },
  topLeft: {
    label: "Giocatore 1",
    role: "A",
    wrapperClassName: "left-[24%] top-[23%] -translate-x-1/2 -translate-y-1/2",
  },
  topRight: {
    label: "Giocatore 2",
    role: "A",
    wrapperClassName: "left-[76%] top-[23%] -translate-x-1/2 -translate-y-1/2",
  },
  bottomLeft: {
    label: "Giocatore 3",
    role: "A",
    wrapperClassName: "left-[24%] top-[49%] -translate-x-1/2 -translate-y-1/2",
  },
  bottomRight: {
    label: "Giocatore 4",
    role: "A",
    wrapperClassName: "left-[76%] top-[49%] -translate-x-1/2 -translate-y-1/2",
  },
};

function createEmptySlots(): SlotsState {
  return {
    goalkeeper: null,
    topLeft: null,
    topRight: null,
    bottomLeft: null,
    bottomRight: null,
  };
}

export default function CreaSquadraForm({ players }: { players: Player[] }) {
  const [state, action, pending] = useActionState(createFantasyTeam, undefined);
  const [slots, setSlots] = useState<SlotsState>(() => createEmptySlots());
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>(null);
  const [menuSlot, setMenuSlot] = useState<SlotKey | null>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const selectedPlayers = useMemo(
    () =>
      SLOT_ORDER.map((k) => slots[k]).filter((p): p is Player => p !== null),
    [slots]
  );
  const selectedIds = useMemo(
    () => selectedPlayers.map((p) => p.id),
    [selectedPlayers]
  );

  const validation = useMemo(() => {
    const gkCount = selectedPlayers.filter((p) => p.role === "P").length;
    const playerCount = selectedPlayers.filter((p) => p.role === "A").length;
    const uniqueTeams = new Set(
      selectedPlayers.map((p) => p.footballTeam.id)
    ).size;
    const captainOk = captainId !== null && selectedIds.includes(captainId);
    return {
      count: selectedIds.length,
      gkOk: gkCount === 1,
      playerOk: playerCount === 4,
      teamsOk: uniqueTeams === selectedIds.length,
      captainOk,
      nameOk: teamName.trim().length >= 1,
      isValid:
        selectedIds.length === 5 &&
        gkCount === 1 &&
        playerCount === 4 &&
        uniqueTeams === 5 &&
        captainOk &&
        teamName.trim().length >= 1,
    };
  }, [captainId, selectedIds, selectedPlayers, teamName]);

  const activePlayer = activeSlot ? slots[activeSlot] : null;
  const availablePlayers = useMemo(() => {
    if (!activeSlot) return [];
    const currentPlayerId = activePlayer?.id ?? null;
    const usedPlayerIds = new Set(
      selectedPlayers
        .filter((p) => p.id !== currentPlayerId)
        .map((p) => p.id)
    );
    const usedTeamIds = new Set(
      selectedPlayers
        .filter((p) => p.id !== currentPlayerId)
        .map((p) => p.footballTeam.id)
    );
    return players.filter(
      (p) =>
        p.role === SLOT_META[activeSlot].role &&
        !usedPlayerIds.has(p.id) &&
        !usedTeamIds.has(p.footballTeam.id)
    );
  }, [activePlayer?.id, activeSlot, players, selectedPlayers]);

  const availableGroups = useMemo(() => {
    const groups = new Map<number, PlayerGroup>();
    availablePlayers.forEach((p) => {
      const existing = groups.get(p.footballTeam.id);
      if (existing) {
        existing.players.push(p);
        return;
      }
      groups.set(p.footballTeam.id, {
        teamId: p.footballTeam.id,
        teamName: p.footballTeam.name,
        teamCode: getTeamCode(p),
        players: [p],
      });
    });
    return [...groups.values()];
  }, [availablePlayers]);

  const menuPlayer = menuSlot ? slots[menuSlot] : null;
  const menuIsCaptain = menuPlayer ? captainId === menuPlayer.id : false;

  function openSlot(slotKey: SlotKey) {
    if (pending) return;
    setMenuSlot(null);
    setActiveSlot(slotKey);
  }

  function assignPlayerToActiveSlot(player: Player) {
    if (!activeSlot) return;
    const replaced = slots[activeSlot];
    setSlots((prev) => ({ ...prev, [activeSlot]: player }));
    if (
      replaced &&
      replaced.id !== player.id &&
      captainId === replaced.id
    ) {
      setCaptainId(null);
    }
    setActiveSlot(null);
  }

  function clearSlot(slotKey: SlotKey) {
    const player = slots[slotKey];
    if (!player) return;
    setSlots((prev) => ({ ...prev, [slotKey]: null }));
    if (captainId === player.id) setCaptainId(null);
  }

  return (
    <form
      action={action}
      className="flex min-h-[calc(100svh-11rem)] flex-col gap-3 lg:min-h-0"
    >
      {/* Mobile: nome squadra centrato in cima */}
      <div className="flex justify-center lg:hidden">
        <InputText
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full max-w-xs text-center"
          placeholder="es. I Guerrieri"
          maxLength={40}
        />
      </div>

      {/* Campo + sidebar desktop */}
      <div className="flex flex-1 flex-col lg:grid lg:flex-none lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-4">
        {/* Campo di gioco */}
        <div
          className="relative flex-1 overflow-hidden rounded-[28px] border border-white/20 px-4 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] lg:aspect-[5/6] lg:w-full lg:flex-none lg:max-w-[26rem] lg:mx-auto"
          style={{
            background:
              "linear-gradient(180deg, #179B54 0%, #138748 48%, #0D6D38 100%)",
          }}
        >
          {/* Righe del campo */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 42px, transparent 42px, transparent 84px)",
            }}
          />
          <div className="pointer-events-none absolute inset-x-[14%] top-[12%] h-[58%] rounded-[30px] border border-white/30" />
          <div className="pointer-events-none absolute left-1/2 top-[18%] h-[46%] w-[42%] -translate-x-1/2 rounded-[999px] border border-white/25" />
          <div className="pointer-events-none absolute left-1/2 top-[64%] h-[22%] w-[54%] -translate-x-1/2 rounded-t-[22px] border border-b-0 border-white/25" />
          <div className="pointer-events-none absolute left-1/2 top-[64%] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 shadow-[0_0_0_6px_rgba(255,255,255,0.08)]" />

          {/* Slot */}
          {SLOT_ORDER.map((slotKey) => {
            const player = slots[slotKey];
            return (
              <div
                key={slotKey}
                className={`absolute ${SLOT_META[slotKey].wrapperClassName}`}
              >
                <SlotCard
                  slotKey={slotKey}
                  player={player}
                  isCaptain={player !== null && captainId === player.id}
                  pending={pending}
                  onEmptyClick={() => openSlot(slotKey)}
                  onFilledClick={() => {
                    if (!pending) setMenuSlot(slotKey);
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Sidebar desktop */}
        <div className="hidden lg:flex lg:flex-col lg:gap-4">
          <div className="card flex flex-col gap-4 p-4">
            {/* Nome squadra */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Nome squadra *
              </label>
              <InputText
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full"
                placeholder="es. I Guerrieri"
                maxLength={40}
              />
              {state?.success === false && state.errors?.name && (
                <p className="mt-1 text-sm text-red-500">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            {/* Riepilogo slot */}
            <div className="flex flex-col gap-2">
              {SLOT_ORDER.map((slotKey) => (
                <SlotSummaryRow
                  key={slotKey}
                  label={SLOT_META[slotKey].label}
                  player={slots[slotKey]}
                  onSelect={() => openSlot(slotKey)}
                  onClear={() => clearSlot(slotKey)}
                  disabled={pending}
                />
              ))}
            </div>

            {/* Capitano */}
            {selectedPlayers.length > 0 && (
              <div>
                <div className="over-label mb-2">Capitano</div>
                <div className="flex flex-wrap gap-2">
                  {selectedPlayers.map((p) => (
                    <Button
                      key={p.id}
                      type="button"
                      unstyled
                      onClick={() => setCaptainId(p.id)}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                        captainId === p.id
                          ? "border-yellow-400 bg-yellow-400 text-[var(--text-primary)] shadow-[0_4px_12px_rgba(232,160,0,0.25)]"
                          : "border-[var(--border-soft)] bg-white text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
                      }`}
                    >
                      {captainId === p.id ? "★ " : ""}({getTeamCode(p)}){" "}
                      {p.name}
                    </Button>
                  ))}
                </div>
                {state?.success === false && state.errors?.captainPlayerId && (
                  <p className="mt-2 text-sm text-red-500">
                    {state.errors.captainPlayerId[0]}
                  </p>
                )}
              </div>
            )}

            {/* Badge validazione */}
            <div className="flex flex-wrap gap-2">
              <StatusBadge ok={validation.gkOk} label="1 Portiere" />
              <StatusBadge ok={validation.playerOk} label="4 Giocatori" />
              <StatusBadge ok={validation.teamsOk} label="5 squadre diverse" />
              <StatusBadge ok={validation.captainOk} label="Capitano scelto" />
            </div>

            {/* Conferma desktop */}
            <Button
              type="submit"
              label={pending ? "Salvo..." : "Conferma squadra"}
              disabled={!validation.isValid || pending}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Conferma mobile */}
      <div className="flex justify-center lg:hidden">
        <Button
          type="submit"
          label={pending ? "Salvo..." : "Conferma squadra"}
          disabled={!validation.isValid || pending}
          className="w-56"
        />
      </div>

      {/* Hidden inputs per il form */}
      <input type="hidden" name="name" value={teamName} />
      <input type="hidden" name="captainPlayerId" value={captainId ?? ""} />
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="playerIds" value={id} />
      ))}

      {/* Errore server */}
      {state?.success === false && state.message && (
        <p aria-live="polite" className="text-center text-sm text-red-500">
          {state.message}
        </p>
      )}

      {/* Menu contestuale slot pieno */}
      <Dialog
        visible={menuSlot !== null}
        onHide={() => setMenuSlot(null)}
        header={menuPlayer?.name ?? ""}
        style={{ width: "220px" }}
        modal
        draggable={false}
        resizable={false}
      >
        {menuSlot && menuPlayer && (
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              unstyled
              onClick={() => {
                setCaptainId(menuIsCaptain ? null : menuPlayer.id);
                setMenuSlot(null);
              }}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-yellow-50"
              style={{ color: "#92400E" }}
            >
              <span>★</span>
              <span className="font-semibold">
                {menuIsCaptain ? "Togli capitano" : "Nomina capitano"}
              </span>
            </Button>
            <Button
              type="button"
              unstyled
              onClick={() => openSlot(menuSlot)}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-1)]"
            >
              <span>↔</span>
              <span className="font-semibold">Cambia giocatore</span>
            </Button>
            <Button
              type="button"
              unstyled
              onClick={() => {
                clearSlot(menuSlot);
                setMenuSlot(null);
              }}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-red-500 transition-colors hover:bg-red-50"
            >
              <span>✕</span>
              <span className="font-semibold">Rimuovi</span>
            </Button>
          </div>
        )}
      </Dialog>

      {/* Sheet selezione giocatore */}
      <PlayerSheet
        visible={activeSlot !== null}
        slotLabel={
          activeSlot
            ? `Seleziona ${SLOT_META[activeSlot].label.toLowerCase()}`
            : ""
        }
        availableGroups={availableGroups}
        currentPlayerId={activeSlot ? (slots[activeSlot]?.id ?? null) : null}
        onSelect={assignPlayerToActiveSlot}
        onHide={() => setActiveSlot(null)}
        isMobile={isMobile ?? false}
      />
    </form>
  );
}

function SlotSummaryRow({
  label,
  player,
  onSelect,
  onClear,
  disabled,
}: {
  label: string;
  player: Player | null;
  onSelect: () => void;
  onClear: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-white px-3 py-2.5">
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          {label}
        </div>
        <div className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {player ? `(${getTeamCode(player)}) ${player.name}` : "Slot ancora libero"}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          label={player ? "Cambia" : "Scegli"}
          size="small"
          outlined
          disabled={disabled}
          onClick={onSelect}
        />
        {player && (
          <Button
            type="button"
            icon="pi pi-times"
            text
            rounded
            severity="secondary"
            aria-label={`Svuota ${label}`}
            disabled={disabled}
            onClick={onClear}
          />
        )}
      </div>
    </div>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        ok ? "" : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
      }`}
      style={ok ? { background: "rgba(50,215,75,0.12)", color: "#32D74B" } : undefined}
    >
      {ok ? "✓ " : "○ "}
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```
Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add app/(user)/squadra/crea/_form.tsx
git commit -m "feat(crea-squadra): rewrite form — mobile layout, context menu, player sheet"
```

---

### Task 6: Semplificazione `page.tsx`

**Files:**
- Modify: `app/(user)/squadra/crea/page.tsx`

La page rimuove il wrapper `admin-card`, il breadcrumb e la descrizione. Restituisce solo il form.

- [ ] **Step 1: Sovrascrivere `page.tsx`**

```tsx
// app/(user)/squadra/crea/page.tsx
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import CreaSquadraForm from "./_form";

export default async function CreaSquadraPage() {
  const user = await requireAuth();
  const userId = Number(user.id);

  const existing = await db.fantasyTeam.findUnique({ where: { userId } });
  if (existing) redirect("/squadra");

  const players = await db.player.findMany({
    orderBy: [
      { role: "asc" },
      { footballTeam: { name: "asc" } },
      { name: "asc" },
    ],
    select: {
      id: true,
      name: true,
      role: true,
      footballTeam: { select: { id: true, name: true, shortName: true } },
    },
  });

  return <CreaSquadraForm players={players} />;
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```
Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add app/(user)/squadra/crea/page.tsx
git commit -m "feat(crea-squadra): simplify page — remove wrappers and breadcrumb"
```

---

### Task 7: Build e verifica finale

**Files:** nessuno (solo verifica)

- [ ] **Step 1: Eseguire i test**

```bash
npm test
```
Expected: tutti i test passano (inclusi i 7 test `filterGroups`).

- [ ] **Step 2: Build di produzione**

```bash
npm run build
```
Expected: `✓ Compiled successfully`, nessun errore TypeScript o di compilazione.

- [ ] **Step 3: Verifica manuale su mobile**

Aprire `http://localhost:3000/squadra/crea` su viewport mobile (≤1023px) e verificare:
- Nome squadra centrato in cima
- Campo occupa tutto lo spazio disponibile tra nome e pulsante
- Slot vuoti: card con bordo tratteggiato e label GK/G1-G4
- Tocco su slot vuoto → bottom sheet si apre dal basso con search bar
- Tocco su slot pieno → menu contestuale a 3 voci
- "Nomina capitano" → badge ★ dorato appare sulla card
- "Togli capitano" → badge sparisce
- "Cambia giocatore" → apre il bottom sheet
- "Rimuovi" → slot torna vuoto, capitano resettato se era quel giocatore
- Pulsante Conferma disabilitato finché non tutti i vincoli sono soddisfatti
- Conferma invia correttamente (redirect su `/squadra` se successo)

- [ ] **Step 4: Verifica manuale su desktop**

Aprire su viewport ≥1024px e verificare:
- Layout a due colonne: campo a sinistra, sidebar a destra
- Sidebar contiene: nome squadra, riepilogo slot, capitano, badge validazione, conferma
- Tocco su slot pieno → menu contestuale Dialog centrato
- Tocco su slot vuoto → Dialog centrato (non bottom sheet)
- Il campo mantiene proporzioni `aspect-[5/6]`

- [ ] **Step 5: Commit finale**

```bash
git add .claude/ ai_context/.claude/
git commit -m "chore: update .claude context post crea-squadra redesign"
```
