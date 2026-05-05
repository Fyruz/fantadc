# Admin GreenVolley Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allineare la sezione admin GreenVolley allo stile DCup: dropdown desktop, switcher mobile a icone, tabelle lista con righe cliccabili, nessun `window.confirm()`.

**Architecture:** Modifica di 7 file esistenti — nessun nuovo file di route o componente. Si aggiungono 3 server actions FormData-compatibili a `volley.ts` per abilitare `ConfirmDeleteForm` nelle tabelle lista. La top bar riceve un nuovo stato `openGroup` per i dropdown desktop e shrinka il switcher su mobile con Tailwind responsive classes.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS, PrimeReact v10, Prisma, TypeScript strict

---

## File Map

| File | Tipo |
|---|---|
| `app/actions/admin/volley.ts` | Modify — aggiunta 3 FormData delete actions |
| `app/(admin)/admin/_top-bar.tsx` | Modify — dropdown desktop + switcher mobile icone |
| `app/(admin)/admin/greenvolley/squadre/_table.tsx` | Rewrite — DataTable → righe cliccabili |
| `app/(admin)/admin/greenvolley/giocatori/_table.tsx` | Rewrite — DataTable → righe cliccabili |
| `app/(admin)/admin/greenvolley/partite/_table.tsx` | Rewrite — DataTable → righe cliccabili con stato |
| `app/(admin)/admin/greenvolley/gironi/_group-card.tsx` | Modify — `window.confirm` → `confirmPopup` |
| `app/(admin)/admin/greenvolley/eliminazione/_rounds-client.tsx` | Modify — `window.confirm` → `confirmPopup` |

---

## Task 1: Aggiungi delete actions FormData-compatibili a volley.ts

`ConfirmDeleteForm` (`@/components/confirm-delete-form`) si interfaccia con server actions che accettano `FormData`. Le delete actions di GreenVolley attuali prendono `(id: number)`. Aggiungiamo 3 varianti FormData senza toccare le esistenti (che rimangono usate da gironi/eliminazione via transition).

**Files:**
- Modify: `app/actions/admin/volley.ts`

- [ ] **Step 1: Aggiungi le 3 actions in fondo al file**

Apri `app/actions/admin/volley.ts` e aggiungi in fondo, dopo l'ultima riga:

```ts
// ─── FORM DELETE VARIANTS (for ConfirmDeleteForm) ─────────────────────────────

export async function deleteVolleyTeamForm(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  await db.volleyTeam.delete({ where: { id } });
  revalidatePath("/admin/greenvolley/squadre");
}

export async function deleteVolleyPlayerForm(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  await db.volleyPlayer.delete({ where: { id } });
  revalidatePath("/admin/greenvolley/giocatori");
}

export async function deleteVolleyMatchForm(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  await db.volleyMatch.delete({ where: { id } });
  revalidatePath("/admin/greenvolley/partite");
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add app/actions/admin/volley.ts
git commit -m "feat(volley): add FormData delete actions for ConfirmDeleteForm"
```

---

## Task 2: Riscrivi _top-bar.tsx — dropdown desktop + switcher mobile a icone

**Modifiche:**
1. `open` → `avatarOpen` per chiarezza
2. Nuovo stato `openGroup: string | null` + `navRef` per dropdown nav
3. Gruppi con `label !== null` → pulsanti con `▾` che aprono dropdown
4. Switcher: `hidden md:inline` nasconde il testo su mobile, rimane solo l'emoji

**Files:**
- Modify: `app/(admin)/admin/_top-bar.tsx`

- [ ] **Step 1: Sostituisci l'intero contenuto del file**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";
import { logout } from "@/app/actions/auth";

const GV = "#3DD907";

const DCUP_GROUPS = [
  { label: null, items: [{ href: "/admin", label: "Dashboard" }] },
  {
    label: "Torneo",
    items: [
      { href: "/admin/squadre",      label: "Squadre"      },
      { href: "/admin/giocatori",    label: "Giocatori"    },
      { href: "/admin/partite",      label: "Partite"      },
      { href: "/admin/gironi",       label: "Gironi"       },
      { href: "/admin/eliminazione", label: "Eliminazione" },
      { href: "/admin/bonus-types",  label: "Tipi bonus"   },
    ],
  },
  {
    label: "Fanta",
    items: [{ href: "/admin/squadre-fantasy", label: "Squadre Fanta" }],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/utenti", label: "Utenti" },
      { href: "/admin/audit",  label: "Audit"  },
    ],
  },
];

const GV_GROUPS = [
  { label: null, items: [{ href: "/admin/greenvolley", label: "Dashboard" }] },
  {
    label: "GreenVolley",
    items: [
      { href: "/admin/greenvolley/squadre",      label: "Squadre"      },
      { href: "/admin/greenvolley/giocatori",    label: "Giocatori"    },
      { href: "/admin/greenvolley/partite",      label: "Partite"      },
      { href: "/admin/greenvolley/gironi",       label: "Gironi"       },
      { href: "/admin/greenvolley/eliminazione", label: "Eliminazione" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/utenti", label: "Utenti" },
      { href: "/admin/audit",  label: "Audit"  },
    ],
  },
];

export default function TopBar({
  initials,
  userName,
}: {
  initials: string;
  userName: string;
}) {
  const pathname = usePathname();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [logoutPending, startTransition] = useTransition();

  const isGV = pathname.startsWith("/admin/greenvolley");
  const GROUPS = isGV ? GV_GROUPS : DCUP_GROUPS;
  const primary = isGV ? GV : "var(--primary)";
  const primaryLight = isGV ? "#f0fde7" : "var(--primary-light)";

  const isActive = (href: string) => {
    if (href === "/admin" || href === "/admin/greenvolley") return pathname === href;
    return pathname.startsWith(href);
  };

  const isGroupActive = (group: (typeof GROUPS)[number]) =>
    group.items.some((item) => isActive(item.href));

  useEffect(() => {
    if (!avatarOpen) return;
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node))
        setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [avatarOpen]);

  useEffect(() => {
    if (!openGroup) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node))
        setOpenGroup(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openGroup]);

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6"
      style={{
        background: "#fff",
        borderBottom: "1px solid var(--border-soft)",
        boxShadow: "0 1px 8px rgba(1,7,163,0.06)",
      }}
    >
      <div className="flex items-center gap-3 w-full max-w-screen-xl mx-auto">
        {/* Logo */}
        <Link
          href={isGV ? "/admin/greenvolley" : "/admin"}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: primary }}
          >
            {isGV ? "🏐" : "⚽"}
          </div>
          <span
            className="font-display font-black text-[14px] uppercase tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {isGV ? (
              <>GREEN<span style={{ color: GV }}>VOLLEY</span></>
            ) : (
              <>FANTA<span style={{ color: "var(--primary)" }}>DC</span></>
            )}
            <span
              className="ml-1.5 text-[10px] font-semibold normal-case tracking-normal"
              style={{ color: "var(--text-muted)" }}
            >
              admin
            </span>
          </span>
        </Link>

        {/* Sport switcher — testo nascosto su mobile, visibile da md */}
        <div
          className="flex items-center gap-0.5 rounded-full p-1 flex-shrink-0"
          style={{ background: "var(--surface-1)" }}
        >
          <Link
            href="/admin"
            className="px-1.5 py-1 md:px-3 md:py-1 rounded-full text-[11px] font-black uppercase tracking-wide transition-colors"
            style={
              !isGV
                ? { background: "#fff", color: "var(--primary)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                : { color: "var(--text-muted)" }
            }
          >
            ⚽<span className="hidden md:inline"> DCup</span>
          </Link>
          <Link
            href="/admin/greenvolley"
            className="px-1.5 py-1 md:px-3 md:py-1 rounded-full text-[11px] font-black uppercase tracking-wide transition-colors"
            style={
              isGV
                ? { background: "#fff", color: GV, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                : { color: "var(--text-muted)" }
            }
          >
            🏐<span className="hidden md:inline"> GreenVolley</span>
          </Link>
        </div>

        {/* Desktop nav con dropdown */}
        <nav ref={navRef} className="hidden md:flex items-center gap-1 flex-1">
          {GROUPS.map((group) => {
            if (group.label === null) {
              const item = group.items[0];
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
                  style={
                    active
                      ? { background: primaryLight, color: primary }
                      : { color: "var(--text-muted)" }
                  }
                >
                  {item.label}
                </Link>
              );
            }

            const groupActive = isGroupActive(group);
            const isOpen = openGroup === group.label;

            return (
              <div key={group.label} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenGroup(isOpen ? null : group.label!)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
                  style={
                    groupActive || isOpen
                      ? { background: primaryLight, color: primary }
                      : { color: "var(--text-muted)" }
                  }
                >
                  {group.label}
                  <i
                    className={`pi pi-chevron-down text-[10px] inline-block transition-transform duration-150 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[160px] rounded-xl overflow-hidden"
                    style={{
                      background: "#fff",
                      border: "1px solid var(--border-soft)",
                      boxShadow: "0 8px 24px rgba(1,7,163,0.13)",
                    }}
                  >
                    {group.items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpenGroup(null)}
                          className="flex items-center px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--surface-1)]"
                          style={
                            active
                              ? { color: primary }
                              : { color: "var(--text-primary)" }
                          }
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Avatar + dropdown */}
        <div ref={avatarRef} className="ml-auto relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setAvatarOpen((v) => !v)}
            className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-black transition-opacity hover:opacity-80"
            style={{ background: primary }}
            aria-label="Menu utente"
            aria-expanded={avatarOpen}
          >
            {initials}
          </button>

          {avatarOpen && (
            <div
              className="absolute right-0 top-10 w-52 overflow-hidden rounded-2xl z-50"
              style={{
                background: "#fff",
                border: "1px solid var(--border-soft)",
                boxShadow: "0 8px 24px rgba(1,7,163,0.13)",
              }}
            >
              <div className="border-b border-[var(--border-soft)] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                    style={{ background: primary }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {userName}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                      Amministratore
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={logoutPending}
                onClick={() => {
                  setAvatarOpen(false);
                  startTransition(() => logout());
                }}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-[var(--surface-1)] disabled:opacity-50"
                style={{ color: "#991B1B" }}
              >
                <i className="pi pi-sign-out text-sm" />
                {logoutPending ? "Uscita in corso..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
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
git add "app/(admin)/admin/_top-bar.tsx"
git commit -m "feat(admin): dropdown nav desktop + icon-only switcher on mobile"
```

---

## Task 3: Riscrivi greenvolley/squadre/_table.tsx

Sostituisce DataTable con righe cliccabili stile DCup. Usa `deleteVolleyTeamForm` (aggiunta nel Task 1) con `ConfirmDeleteForm`.

**Files:**
- Modify: `app/(admin)/admin/greenvolley/squadre/_table.tsx`

- [ ] **Step 1: Sostituisci l'intero contenuto del file**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { deleteVolleyTeamForm } from "@/app/actions/admin/volley";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

type Row = { id: number; name: string; playerCount: number };

const PAGE_SIZE = 15;

export default function VolleyTeamsTable({ teams }: { teams: Row[] }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const total = teams.length;
  const start = page * PAGE_SIZE;
  const slice = teams.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="card overflow-hidden">
      {total === 0 ? (
        <p className="px-4 py-10 text-center over-label">Nessuna squadra.</p>
      ) : (
        <>
          {slice.map((row, idx) => (
            <div
              key={row.id}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-1)] transition-colors cursor-pointer"
              style={idx < slice.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
              onClick={() => router.push(`/admin/greenvolley/squadre/${row.id}/edit`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {row.name}
                  </span>
                  {row.playerCount === 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: "rgba(234,179,8,0.12)", color: "#854d0e", border: "1px solid rgba(234,179,8,0.3)" }}
                    >
                      ⚠ nessun giocatore
                    </span>
                  )}
                </div>
                <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                  <i className="pi pi-users text-[10px]" />
                  {row.playerCount} {row.playerCount === 1 ? "giocatore" : "giocatori"}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <ConfirmDeleteForm
                  action={deleteVolleyTeamForm}
                  hiddenInputs={{ id: row.id }}
                  confirmMessage={`Eliminare "${row.name}"?`}
                />
              </div>
              <i className="pi pi-chevron-right text-xs flex-shrink-0" style={{ color: "var(--text-disabled)" }} />
            </div>
          ))}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderTop: "1px solid var(--border-soft)", background: "var(--surface-1)" }}
            >
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {start + 1}–{Math.min(start + PAGE_SIZE, total)} di {total}
              </span>
              <div className="flex gap-1">
                <Button
                  icon="pi pi-chevron-left"
                  text
                  size="small"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Precedente"
                />
                <Button
                  icon="pi pi-chevron-right"
                  text
                  size="small"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Successiva"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
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
git add "app/(admin)/admin/greenvolley/squadre/_table.tsx"
git commit -m "feat(greenvolley): squadre table → DCup-style clickable rows"
```

---

## Task 4: Riscrivi greenvolley/giocatori/_table.tsx

Stesse regole di squadre. Nessun ruolo/posizione — solo nome e squadra di appartenenza.

**Files:**
- Modify: `app/(admin)/admin/greenvolley/giocatori/_table.tsx`

- [ ] **Step 1: Sostituisci l'intero contenuto del file**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { deleteVolleyPlayerForm } from "@/app/actions/admin/volley";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

type Row = { id: number; name: string; teamId: number; teamName: string };

const PAGE_SIZE = 15;

export default function VolleyPlayersTable({ players }: { players: Row[] }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const total = players.length;
  const start = page * PAGE_SIZE;
  const slice = players.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="card overflow-hidden">
      {total === 0 ? (
        <p className="px-4 py-10 text-center over-label">Nessun giocatore.</p>
      ) : (
        <>
          {slice.map((row, idx) => (
            <div
              key={row.id}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-1)] transition-colors cursor-pointer"
              style={idx < slice.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
              onClick={() => router.push(`/admin/greenvolley/giocatori/${row.id}/edit`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {row.name}
                  </span>
                </div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {row.teamName}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <ConfirmDeleteForm
                  action={deleteVolleyPlayerForm}
                  hiddenInputs={{ id: row.id }}
                  confirmMessage={`Eliminare "${row.name}"?`}
                />
              </div>
              <i className="pi pi-chevron-right text-xs flex-shrink-0" style={{ color: "var(--text-disabled)" }} />
            </div>
          ))}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderTop: "1px solid var(--border-soft)", background: "var(--surface-1)" }}
            >
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {start + 1}–{Math.min(start + PAGE_SIZE, total)} di {total}
              </span>
              <div className="flex gap-1">
                <Button
                  icon="pi pi-chevron-left"
                  text
                  size="small"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Precedente"
                />
                <Button
                  icon="pi pi-chevron-right"
                  text
                  size="small"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Successiva"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
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
git add "app/(admin)/admin/greenvolley/giocatori/_table.tsx"
git commit -m "feat(greenvolley): giocatori table → DCup-style clickable rows"
```

---

## Task 5: Riscrivi greenvolley/partite/_table.tsx

La riga mostra: titolo (Casa vs Ospite), score set, stato con colore. Click → pagina di gestione partita `/admin/greenvolley/partite/[id]` (non `/edit`).

**Files:**
- Modify: `app/(admin)/admin/greenvolley/partite/_table.tsx`

- [ ] **Step 1: Sostituisci l'intero contenuto del file**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { deleteVolleyMatchForm } from "@/app/actions/admin/volley";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

type Row = {
  id: number;
  homeTeamName: string;
  awayTeamName: string;
  status: string;
  date: string;
  result: string;
};

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  DRAFT:     { bg: "var(--surface-2)",          text: "var(--text-muted)"   },
  SCHEDULED: { bg: "rgba(245,158,11,0.12)",      text: "#92400e"             },
  CONCLUDED: { bg: "rgba(61,217,7,0.12)",        text: "#166534"             },
};

export default function VolleyMatchesTable({ matches }: { matches: Row[] }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const total = matches.length;
  const start = page * PAGE_SIZE;
  const slice = matches.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="card overflow-hidden">
      {total === 0 ? (
        <p className="px-4 py-10 text-center over-label">Nessuna partita.</p>
      ) : (
        <>
          {slice.map((row, idx) => {
            const statusColors = STATUS_COLOR[row.status] ?? STATUS_COLOR.DRAFT;
            return (
              <div
                key={row.id}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-1)] transition-colors cursor-pointer"
                style={idx < slice.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
                onClick={() => router.push(`/admin/greenvolley/partite/${row.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {row.homeTeamName} vs {row.awayTeamName}
                    </span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: statusColors.bg, color: statusColors.text }}
                    >
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    {row.date !== "—" && <span>{row.date}</span>}
                    {row.result !== "—" && (
                      <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
                        {row.result} set
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <ConfirmDeleteForm
                    action={deleteVolleyMatchForm}
                    hiddenInputs={{ id: row.id }}
                    confirmMessage="Eliminare questa partita?"
                  />
                </div>
                <i className="pi pi-chevron-right text-xs flex-shrink-0" style={{ color: "var(--text-disabled)" }} />
              </div>
            );
          })}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderTop: "1px solid var(--border-soft)", background: "var(--surface-1)" }}
            >
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {start + 1}–{Math.min(start + PAGE_SIZE, total)} di {total}
              </span>
              <div className="flex gap-1">
                <Button
                  icon="pi pi-chevron-left"
                  text
                  size="small"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Precedente"
                />
                <Button
                  icon="pi pi-chevron-right"
                  text
                  size="small"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Successiva"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
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
git add "app/(admin)/admin/greenvolley/partite/_table.tsx"
git commit -m "feat(greenvolley): partite table → DCup-style clickable rows"
```

---

## Task 6: Sostituisci window.confirm in gironi/_group-card.tsx

Il componente usa `startTransition` per le delete (non un form). Si usa `confirmPopup` direttamente (stesso meccanismo interno di `ConfirmDeleteForm`).

**Files:**
- Modify: `app/(admin)/admin/greenvolley/gironi/_group-card.tsx`

- [ ] **Step 1: Aggiungi import di confirmPopup e ConfirmPopup**

In testa al file, aggiungi al blocco degli import PrimeReact esistente:

```tsx
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
```

La riga esistente `import { Dropdown } from "primereact/dropdown";` rimane invariata.

- [ ] **Step 2: Aggiungi `<ConfirmPopup />` nel JSX**

Dentro il `return(...)`, immediatamente dopo `<div className="admin-card p-4 flex flex-col gap-4">`, aggiungi:

```tsx
<ConfirmPopup />
```

- [ ] **Step 3: Sostituisci il Button delete del girone**

Trova il Button con `aria-label="Elimina girone"` (attuale):

```tsx
<Button
  icon="pi pi-trash"
  text
  size="small"
  severity="danger"
  onClick={() => {
    if (confirm(`Eliminare il girone "${group.name}"?`)) {
      startTransition(async () => {
        await deleteVolleyGroup(group.id);
        router.refresh();
      });
    }
  }}
  loading={isPending}
  aria-label="Elimina girone"
/>
```

Sostituiscilo con:

```tsx
<Button
  icon="pi pi-trash"
  text
  size="small"
  severity="danger"
  onClick={(e) =>
    confirmPopup({
      target: e.currentTarget,
      message: `Eliminare il girone "${group.name}"?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì",
      rejectLabel: "No",
      accept: () =>
        startTransition(async () => {
          await deleteVolleyGroup(group.id);
          router.refresh();
        }),
    })
  }
  loading={isPending}
  aria-label="Elimina girone"
/>
```

- [ ] **Step 4: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 5: Commit**

```bash
git add "app/(admin)/admin/greenvolley/gironi/_group-card.tsx"
git commit -m "fix(greenvolley): replace window.confirm with confirmPopup in gironi"
```

---

## Task 7: Sostituisci window.confirm in eliminazione/_rounds-client.tsx

Stesso approccio del Task 6. Il DataTable dei turni rimane invariato.

**Files:**
- Modify: `app/(admin)/admin/greenvolley/eliminazione/_rounds-client.tsx`

- [ ] **Step 1: Aggiungi import di confirmPopup e ConfirmPopup**

In testa al file, aggiungi alla lista degli import PrimeReact:

```tsx
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
```

- [ ] **Step 2: Aggiungi `<ConfirmPopup />` nel JSX**

Dentro il `return(...)`, dopo `<div className="flex flex-col gap-5">`, aggiungi:

```tsx
<ConfirmPopup />
```

- [ ] **Step 3: Sostituisci la onClick del Button elimina nel body della Column**

Trova (dentro il `body` della Column delete):

```tsx
onClick={() => {
  if (confirm(`Eliminare "${row.name}"?`)) {
    startTransition(async () => {
      await deleteVolleyKnockoutRound(row.id);
      router.refresh();
    });
  }
}}
```

Sostituiscilo con:

```tsx
onClick={(e) =>
  confirmPopup({
    target: e.currentTarget,
    message: `Eliminare "${row.name}"?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Sì",
    rejectLabel: "No",
    accept: () =>
      startTransition(async () => {
        await deleteVolleyKnockoutRound(row.id);
        router.refresh();
      }),
  })
}
```

- [ ] **Step 4: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 5: Commit**

```bash
git add "app/(admin)/admin/greenvolley/eliminazione/_rounds-client.tsx"
git commit -m "fix(greenvolley): replace window.confirm with confirmPopup in eliminazione"
```

---

## Task 8: Verifica finale e commit

- [ ] **Step 1: TypeScript full check**

```bash
npx tsc --noEmit
```

Expected: 0 errori.

- [ ] **Step 2: Build produzione**

```bash
npm run build
```

Expected: build completata senza errori. Pagine compilate senza warning di tipo.

- [ ] **Step 3: Commit .claude/ e ai_context/**

```bash
git add .claude/ ai_context/
git status
```

Se ci sono file modificati:

```bash
git commit -m "chore: update claude context after admin redesign"
```

---

## Checklist spec coverage

| Requisito spec | Task |
|---|---|
| Dropdown desktop per gruppo | Task 2 |
| Switcher mobile icone (no testo) | Task 2 |
| squadre: DataTable → righe cliccabili | Task 3 |
| giocatori: DataTable → righe cliccabili, no ruoli | Task 4 |
| partite: DataTable → righe cliccabili con stato | Task 5 |
| gironi: no window.confirm | Task 6 |
| eliminazione: no window.confirm | Task 7 |
| FormData actions per ConfirmDeleteForm | Task 1 |
| tsc + build | Task 8 |
