# Fantadc Premium Football Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire il dark theme attuale con un light theme "Blue Sport" premium, tipografia bold/condensed, mobile-first.

**Architecture:** Token swap in `globals.css` + cambio font/tema in `layout.tsx` → aggiornamento componenti nav condivisi → riscrittura pagine principali in ordine di priorità. Zero modifiche a business logic, API o database.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, PrimeReact v10 (`lara-light-blue`), Barlow Condensed (Google Fonts via `next/font/google`), Prisma, Geist (body font)

**Spec di riferimento:** `docs/superpowers/specs/2026-04-04-fantadc-redesign-design.md`

---

## Palette di riferimento rapido

| Token | Valore |
|---|---|
| `--primary` | `#0107A3` |
| `--primary-dark` | `#000669` |
| `--gold` | `#E8A000` |
| `--bg-base` | `#FFFFFF` |
| `--surface-1` | `#F0F2FF` |
| `--surface-2` | `#E4E7FF` |
| `--border-soft` | `rgba(1,7,163,0.07)` |
| `--border-medium` | `#DDE1F7` |
| `--text-primary` | `#06073D` |
| `--text-muted` | `#6466A3` |

---

## Task 1 — Font + tema PrimeReact (`app/layout.tsx`)

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Sostituisci il contenuto di `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Barlow_Condensed } from "next/font/google";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./globals.css";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  weight: ["700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
});

export const metadata: Metadata = {
  title: "Fantadc",
  description: "Fantacalcio del torneo di paese",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```
Atteso: 0 errori

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(design): add Barlow Condensed font, switch to lara-light-blue theme"
```

---

## Task 2 — Design tokens + component classes + PrimeReact overrides (`app/globals.css`)

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Sostituisci l'intero contenuto di `app/globals.css`**

```css
@import "tailwindcss";

:root {
  /* ── Brand ─────────────────────────────── */
  --primary: #0107A3;
  --primary-hover: #0A14B8;
  --primary-dark: #000669;
  --primary-light: rgba(1,7,163,0.08);
  --primary-glow: rgba(1,7,163,0.20);
  --gold: #E8A000;
  --gold-shadow: rgba(232,160,0,0.40);

  /* ── Backgrounds ────────────────────────── */
  --bg-base: #FFFFFF;
  --bg-secondary: #F5F6FF;
  --surface-1: #F0F2FF;
  --surface-2: #E4E7FF;
  --panel: rgba(1,7,163,0.03);
  --glass: rgba(1,7,163,0.05);

  /* ── Borders ────────────────────────────── */
  --border-soft: rgba(1,7,163,0.07);
  --border-medium: #DDE1F7;
  --border-active: #0107A3;

  /* ── Text ───────────────────────────────── */
  --text-primary: #06073D;
  --text-secondary: #2D2F7A;
  --text-muted: #6466A3;
  --text-disabled: #9A9CC4;

  /* ── Semantic ───────────────────────────── */
  --live: #22C55E;
  --ended: #EF4444;
  --success: #065F46;
  --warning: #92400E;
  --info: #1E40AF;

  /* ── Legacy aliases (PrimeReact + body) ─── */
  --background: var(--bg-base);
  --foreground: var(--text-primary);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-display: var(--font-barlow-condensed);
}

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif;
}

/* ─── Scrollbar ─────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(1,7,163,0.15); border-radius: 9999px; }
::-webkit-scrollbar-thumb:hover { background: rgba(1,7,163,0.25); }

/* ─── Component classes ─────────────────────────────────── */
@layer components {

  /* Display font utility */
  .font-display {
    font-family: var(--font-barlow-condensed), 'Arial Black', Arial, sans-serif;
  }

  /* Over-label (caption sopra titoli) */
  .over-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--text-muted);
  }

  /* ── Buttons ──────────────────────────────── */
  .btn-primary {
    @apply inline-flex items-center justify-center text-white px-5 py-2.5 rounded-full text-sm font-black uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
    font-family: var(--font-barlow-condensed), 'Arial Black', Arial, sans-serif;
    background-color: var(--primary);
  }
  .btn-primary:hover:not(:disabled) { background-color: var(--primary-hover); }

  .btn-gold {
    @apply inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-black uppercase tracking-wide disabled:opacity-50 transition-colors;
    font-family: var(--font-barlow-condensed), 'Arial Black', Arial, sans-serif;
    background: var(--gold);
    color: var(--text-primary);
    box-shadow: 0 2px 8px var(--gold-shadow);
  }
  .btn-gold:hover:not(:disabled) { background: #D49200; }

  .btn-danger {
    @apply inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-bold uppercase disabled:opacity-50 transition-colors;
    background: #EF4444;
    color: #fff;
  }
  .btn-danger:hover:not(:disabled) { background: #DC2626; }

  .btn-secondary {
    @apply inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold disabled:opacity-50 transition-colors;
    background: var(--surface-1);
    color: var(--text-primary);
    border: 1px solid var(--border-medium);
  }
  .btn-secondary:hover:not(:disabled) { background: var(--surface-2); }

  .btn-outline-primary {
    @apply inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-black uppercase tracking-wide transition-colors;
    font-family: var(--font-barlow-condensed), 'Arial Black', Arial, sans-serif;
    background: transparent;
    color: var(--primary);
    border: 2px solid var(--primary);
  }
  .btn-outline-primary:hover { background: var(--primary-light); }

  /* ── Input ────────────────────────────────── */
  .input {
    @apply w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none;
    background: #fff;
    color: var(--text-primary);
    border: 1px solid var(--border-medium);
  }
  .input::placeholder { color: var(--text-muted); }
  .input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
  }

  /* ── Cards ────────────────────────────────── */
  .card {
    background: #fff;
    border: 1px solid var(--border-soft);
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(1,7,163,0.08);
  }

  /* alias usato dal codice esistente */
  .admin-card {
    background: #fff;
    border: 1px solid var(--border-soft);
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(1,7,163,0.08);
  }

  .surface-card {
    background: var(--surface-1);
    border: 1px solid var(--border-medium);
    border-radius: 14px;
  }

  /* Card premium (gradiente blu, per squadra / podio / hero) */
  .card-premium {
    background: linear-gradient(145deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-radius: 18px;
    box-shadow: 0 6px 24px rgba(1,7,163,0.30);
    overflow: hidden;
    position: relative;
  }

  /* ── Badges stato partita ─────────────────── */
  .badge-draft {
    @apply inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide;
    background: #F9FAFB; color: #6466A3; border: 1px solid var(--surface-2);
  }
  .badge-scheduled {
    @apply inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide;
    background: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE;
  }
  .badge-concluded {
    @apply inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide;
    background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A;
  }
  .badge-published {
    @apply inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide;
    background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0;
  }

  /* ── Bottom nav safe area ────────────────── */
  .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
}

/* ─── PrimeReact DataTable overrides (light) ────────────── */
.p-datatable .p-datatable-thead > tr > th {
  background: var(--surface-1) !important;
  color: var(--text-muted) !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 1.5px !important;
  border-bottom: 1px solid var(--border-medium) !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  padding: 12px 16px !important;
}
.p-datatable .p-datatable-tbody > tr > td {
  padding: 0 16px !important;
  height: 52px !important;
  background: transparent !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-soft) !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
}
.p-datatable .p-datatable-tbody > tr:hover > td {
  background: var(--surface-1) !important;
}
.p-datatable .p-datatable-table { border-collapse: collapse !important; }
.p-datatable .p-datatable-emptymessage > td { color: var(--text-muted) !important; }

/* Paginator */
.p-paginator {
  background: #fff !important;
  border: none !important;
  padding: 8px 16px !important;
  border-top: 1px solid var(--border-soft) !important;
}
.p-paginator .p-paginator-page.p-highlight {
  background: var(--primary) !important;
  color: white !important;
  border-color: var(--primary) !important;
  border-radius: 50% !important;
}
.p-paginator .p-paginator-page,
.p-paginator .p-paginator-prev,
.p-paginator .p-paginator-next,
.p-paginator .p-paginator-first,
.p-paginator .p-paginator-last {
  border-radius: 50% !important;
  min-width: 32px !important;
  height: 32px !important;
  color: var(--text-secondary) !important;
  background: transparent !important;
}
.p-paginator .p-paginator-page:hover,
.p-paginator .p-paginator-prev:hover,
.p-paginator .p-paginator-next:hover {
  background: var(--surface-1) !important;
}
.p-datatable .p-sortable-column .p-sortable-column-icon { color: var(--text-muted) !important; }
.p-datatable .p-sortable-column:hover .p-sortable-column-icon { color: var(--primary) !important; }

/* ─── PrimeReact InputText / Dropdown / Calendar (light) ── */
.p-inputtext {
  background: #fff !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-medium) !important;
  border-radius: 12px !important;
}
.p-inputtext::placeholder { color: var(--text-muted) !important; }
.p-inputtext:enabled:focus {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 3px var(--primary-light) !important;
}

.p-dropdown {
  background: #fff !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-medium) !important;
  border-radius: 12px !important;
}
.p-dropdown:not(.p-disabled):hover { border-color: var(--primary) !important; }
.p-dropdown:not(.p-disabled).p-focus {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 3px var(--primary-light) !important;
}
.p-dropdown-panel {
  background: #fff !important;
  border: 1px solid var(--border-medium) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 24px rgba(1,7,163,0.12) !important;
}
.p-dropdown-panel .p-dropdown-items .p-dropdown-item { color: var(--text-primary) !important; }
.p-dropdown-panel .p-dropdown-items .p-dropdown-item:hover { background: var(--surface-1) !important; }
.p-dropdown-panel .p-dropdown-items .p-dropdown-item.p-highlight {
  background: var(--primary-light) !important;
  color: var(--primary) !important;
}
.p-dropdown .p-dropdown-label { color: var(--text-primary) !important; }
.p-dropdown .p-dropdown-label.p-placeholder { color: var(--text-muted) !important; }
.p-dropdown .p-dropdown-trigger { color: var(--text-muted) !important; }

.p-calendar .p-inputtext { border-radius: 12px !important; }
.p-password-input {
  background: #fff !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-medium) !important;
  border-radius: 12px !important;
}

/* ─── PrimeReact Button (light) ─────────────────────────── */
.p-button { border-radius: 9999px !important; }
.p-button:not(.p-button-outlined):not(.p-button-text):not(.p-button-link) {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
}
.p-button:not(.p-button-outlined):not(.p-button-text):not(.p-button-link):hover {
  background: var(--primary-hover) !important;
  border-color: var(--primary-hover) !important;
}
.p-button.p-button-outlined {
  color: var(--primary) !important;
  border-color: var(--primary) !important;
  background: transparent !important;
}
.p-button.p-button-outlined:hover { background: var(--primary-light) !important; }
.p-button.p-button-text {
  color: var(--text-secondary) !important;
  background: transparent !important;
}
.p-button.p-button-text:hover { background: var(--surface-1) !important; }
.p-button.p-button-secondary {
  background: var(--surface-1) !important;
  border-color: var(--border-medium) !important;
  color: var(--text-primary) !important;
}
.p-button.p-button-secondary:hover { background: var(--surface-2) !important; }
.p-button.p-button-danger {
  background: #EF4444 !important;
  border-color: #EF4444 !important;
}
.p-button.p-button-danger:hover {
  background: #DC2626 !important;
  border-color: #DC2626 !important;
}

/* ─── PrimeReact InputNumber (light) ────────────────────── */
.p-inputnumber .p-inputtext { border-radius: 12px !important; }
.p-inputnumber-button {
  background: var(--surface-1) !important;
  color: var(--text-secondary) !important;
  border-color: var(--border-medium) !important;
}

/* ─── PrimeReact Tag ─────────────────────────────────────── */
.p-tag { border-radius: 9999px !important; }

/* ─── PrimeReact Dialog (light) ─────────────────────────── */
.p-dialog {
  background: #fff !important;
  border: 1px solid var(--border-medium) !important;
  border-radius: 20px !important;
  box-shadow: 0 8px 40px rgba(1,7,163,0.15) !important;
}
.p-dialog .p-dialog-header {
  background: transparent !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-soft) !important;
}
.p-dialog .p-dialog-content {
  background: transparent !important;
  color: var(--text-primary) !important;
}
.p-dialog .p-dialog-footer {
  background: transparent !important;
  border-top: 1px solid var(--border-soft) !important;
}

/* ─── PrimeReact ConfirmPopup (light) ───────────────────── */
.p-confirmpopup {
  background: #fff !important;
  border: 1px solid var(--border-medium) !important;
  border-radius: 14px !important;
  box-shadow: 0 4px 20px rgba(1,7,163,0.12) !important;
}
.p-confirmpopup .p-confirmpopup-content { color: var(--text-primary) !important; }
```

- [ ] **Step 2: Verifica TypeScript + build rapido**

```bash
npx tsc --noEmit
```
Atteso: 0 errori. Se compaiono errori relativi a variabili CSS non trovate, ignorali — sono warning di Tailwind, non errori TS.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(design): replace dark tokens with Blue Sport light theme + update PrimeReact overrides"
```

---

## Task 3 — StatusBadge e RoleBadge (`components/`)

**Files:**
- Modify: `components/status-badge.tsx`
- Modify: `components/role-badge.tsx`

- [ ] **Step 1: Aggiorna `components/status-badge.tsx`**

```tsx
type MatchStatus = "DRAFT" | "SCHEDULED" | "CONCLUDED" | "PUBLISHED";

const CONFIG: Record<MatchStatus, { label: string; className: string }> = {
  DRAFT:     { label: "Bozza",       className: "badge-draft"     },
  SCHEDULED: { label: "Programmata", className: "badge-scheduled" },
  CONCLUDED: { label: "Conclusa",    className: "badge-concluded" },
  PUBLISHED: { label: "Pubblicata",  className: "badge-published" },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = CONFIG[status as MatchStatus] ?? CONFIG.DRAFT;
  return <span className={cfg.className}>{cfg.label}</span>;
}
```

- [ ] **Step 2: Aggiorna `components/role-badge.tsx`**

```tsx
const CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  P: { label: "P", bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
  A: { label: "A", bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE" },
};

export default function RoleBadge({ role }: { role: string }) {
  const cfg = CONFIG[role] ?? { label: role, bg: "var(--surface-1)", color: "var(--text-muted)", border: "var(--border-medium)" };
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}
```

- [ ] **Step 3: Verifica TypeScript**

```bash
npx tsc --noEmit
```
Atteso: 0 errori

- [ ] **Step 4: Commit**

```bash
git add components/status-badge.tsx components/role-badge.tsx
git commit -m "feat(design): update StatusBadge and RoleBadge for light theme"
```

---

## Task 4 — Public nav (`components/public-nav.tsx`)

**Files:**
- Modify: `components/public-nav.tsx`

- [ ] **Step 1: Sostituisci `components/public-nav.tsx`**

```tsx
import Link from "next/link";
import { Button } from "primereact/button";
import { getCurrentUser } from "@/lib/session";
import { signOut } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/partite",         label: "Partite"   },
  { href: "/squadre",         label: "Squadre"   },
  { href: "/giocatori",       label: "Giocatori" },
  { href: "/squadre-fantasy", label: "Fantasy"   },
  { href: "/classifica",      label: "Classifica"},
  { href: "/regolamento",     label: "Regolamento"},
];

export default async function PublicNav() {
  const user = await getCurrentUser();

  return (
    <header
      className="sticky top-0 z-30"
      style={{ background: "#fff", borderBottom: "1px solid var(--border-soft)", boxShadow: "0 1px 8px rgba(1,7,163,0.06)" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: "var(--primary)" }}
          >
            ⚽
          </div>
          <span
            className="font-display font-black text-[15px] uppercase tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            FANTA<span style={{ color: "var(--primary)" }}>DC</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 px-4">
          {NAV_LINKS.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors hover:bg-[var(--surface-1)]"
              style={{ color: "var(--text-muted)" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm font-semibold transition-colors px-2 hover:text-[var(--primary)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="text-sm font-semibold transition-colors px-2 hover:text-[var(--primary)]"
                style={{ color: "var(--text-muted)" }}
              >
                Dashboard
              </Link>
              <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                <Button
                  type="submit"
                  unstyled
                  className="text-xs px-3 py-1.5 rounded-full font-bold border uppercase tracking-wide transition-colors hover:bg-[var(--surface-1)]"
                  style={{ borderColor: "var(--border-medium)", color: "var(--text-secondary)" }}
                  label="ESCI"
                />
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold transition-colors px-2 hover:text-[var(--primary)]"
                style={{ color: "var(--text-muted)" }}
              >
                Accedi
              </Link>
              <Link
                href="/register"
                className="text-xs px-4 py-2 rounded-full font-black uppercase tracking-wide transition-colors hover:opacity-90"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                REGISTRATI
              </Link>
            </>
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

- [ ] **Step 3: Commit**

```bash
git add components/public-nav.tsx
git commit -m "feat(design): redesign public top nav with light theme and logomark"
```

---

## Task 5 — Public bottom nav (`components/public-bottom-nav.tsx`)

**Files:**
- Modify: `components/public-bottom-nav.tsx`

- [ ] **Step 1: Sostituisci `components/public-bottom-nav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "primereact/button";

type MainNavItem = {
  href: string;
  label: string;
  icon: string;
  matchers?: readonly string[];
};

const MAIN_NAV: readonly MainNavItem[] = [
  { href: "/partite",   label: "PARTITE",   icon: "pi-calendar" },
  { href: "/classifica",label: "CLASS.",    icon: "pi-list"     },
  { href: "/squadre-fantasy", label: "FANTASY", icon: "pi-shield" },
  {
    href: "/dashboard",
    label: "IL MIO",
    icon: "pi-user",
    matchers: ["/dashboard", "/squadra", "/vota"],
  },
] as const;

const MORE_NAV = [
  { href: "/giocatori",  label: "Giocatori",    icon: "pi-users" },
  { href: "/squadre",    label: "Squadre reali", icon: "pi-shield" },
  { href: "/regolamento",label: "Regolamento",  icon: "pi-book"  },
] as const;

export default function PublicBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string, matchers?: readonly string[]) => {
    if (matchers) return matchers.some((m) => pathname.startsWith(m));
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  const moreIsActive = MORE_NAV.some((item) => isActive(item.href));

  return (
    <>
      {/* Overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(6,7,61,0.3)" }}
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More drawer */}
      {moreOpen && (
        <div
          className="fixed bottom-[64px] left-0 right-0 z-50 rounded-t-2xl md:hidden pb-safe"
          style={{ background: "#fff", borderTop: "2px solid var(--border-medium)", boxShadow: "0 -4px 24px rgba(1,7,163,0.12)" }}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              ALTRO
            </span>
            <Button
              icon="pi pi-times"
              text
              type="button"
              onClick={() => setMoreOpen(false)}
              className="!p-1"
              style={{ color: "var(--text-muted)" }}
              aria-label="Chiudi"
            />
          </div>
          <div className="flex flex-col gap-1 px-3 pb-4">
            {MORE_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={
                    active
                      ? { background: "var(--surface-1)", color: "var(--primary)" }
                      : { color: "var(--text-secondary)" }
                  }
                >
                  <i className={`pi ${item.icon} text-base`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        style={{
          background: "#fff",
          borderTop: "1px solid var(--border-soft)",
          boxShadow: "0 -2px 12px rgba(1,7,163,0.06)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex h-16">
          {MAIN_NAV.map((item) => {
            const active = isActive(item.href, item.matchers);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <div className="relative flex flex-col items-center">
                  {active && (
                    <span
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-b-full"
                      style={{ background: "var(--primary)" }}
                    />
                  )}
                  <i
                    className={`pi ${item.icon} text-xl`}
                    style={{ color: active ? "var(--primary)" : "var(--text-disabled)" }}
                  />
                </div>
                <span
                  className="text-[8px] font-black uppercase tracking-wide"
                  style={{ color: active ? "var(--primary)" : "var(--text-disabled)" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Altro */}
          <Button
            unstyled
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
          >
            <i
              className="pi pi-ellipsis-h text-xl"
              style={{ color: moreIsActive || moreOpen ? "var(--primary)" : "var(--text-disabled)" }}
            />
            <span
              className="text-[8px] font-black uppercase tracking-wide"
              style={{ color: moreIsActive || moreOpen ? "var(--primary)" : "var(--text-disabled)" }}
            >
              ALTRO
            </span>
          </Button>
        </div>
      </nav>
    </>
  );
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/public-bottom-nav.tsx
git commit -m "feat(design): redesign public bottom nav with light theme, blue indicator, uppercase labels"
```

---

## Task 6 — Admin top bar (`app/(admin)/admin/_top-bar.tsx`)

**Files:**
- Modify: `app/(admin)/admin/_top-bar.tsx`

- [ ] **Step 1: Sostituisci il file**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin",                 label: "Dashboard"       },
  { href: "/admin/squadre",         label: "Squadre"         },
  { href: "/admin/giocatori",       label: "Giocatori"       },
  { href: "/admin/partite",         label: "Partite"         },
  { href: "/admin/bonus-types",     label: "Tipi bonus"      },
  { href: "/admin/utenti",          label: "Utenti"          },
  { href: "/admin/squadre-fantasy", label: "Squadre fantasy" },
  { href: "/admin/audit",           label: "Audit"           },
];

export default function TopBar({ initials }: { initials: string }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6"
      style={{ background: "#fff", borderBottom: "1px solid var(--border-soft)", boxShadow: "0 1px 8px rgba(1,7,163,0.06)" }}
    >
      <div className="flex items-center gap-4 w-full max-w-screen-xl mx-auto">
        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: "var(--primary)" }}
          >
            ⚽
          </div>
          <span
            className="font-display font-black text-[14px] uppercase tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            FANTA<span style={{ color: "var(--primary)" }}>DC</span>
            <span className="ml-1.5 text-[10px] font-semibold normal-case tracking-normal" style={{ color: "var(--text-muted)" }}>
              admin
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
                style={
                  active
                    ? { background: "var(--primary-light)", color: "var(--primary)" }
                    : { color: "var(--text-muted)" }
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Avatar */}
        <div
          className="ml-auto w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-black flex-shrink-0"
          style={{ background: "var(--primary)" }}
        >
          {initials}
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

- [ ] **Step 3: Commit**

```bash
git add app/\(admin\)/admin/_top-bar.tsx
git commit -m "feat(design): redesign admin top bar with light theme and logomark"
```

---

## Task 7 — Admin bottom nav (`app/(admin)/admin/_bottom-nav.tsx`)

**Files:**
- Modify: `app/(admin)/admin/_bottom-nav.tsx`

- [ ] **Step 1: Sostituisci il file**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "primereact/button";

const MAIN_NAV = [
  { href: "/admin",           label: "DASHBOARD", icon: "pi-home"     },
  { href: "/admin/partite",   label: "PARTITE",   icon: "pi-calendar" },
  { href: "/admin/giocatori", label: "GIOCATORI", icon: "pi-users"    },
  { href: "/admin/squadre",   label: "SQUADRE",   icon: "pi-shield"   },
];

const MORE_NAV = [
  { href: "/admin/utenti",           label: "Utenti",          icon: "pi-id-card" },
  { href: "/admin/bonus-types",      label: "Tipi bonus",      icon: "pi-star"    },
  { href: "/admin/squadre-fantasy",  label: "Squadre fantasy", icon: "pi-trophy"  },
  { href: "/admin/audit",            label: "Audit log",       icon: "pi-history" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const moreIsActive = MORE_NAV.some((item) => isActive(item.href));

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(6,7,61,0.3)" }}
          onClick={() => setMoreOpen(false)}
        />
      )}

      {moreOpen && (
        <div
          className="fixed bottom-[64px] left-0 right-0 z-50 rounded-t-2xl md:hidden pb-safe"
          style={{ background: "#fff", borderTop: "2px solid var(--border-medium)", boxShadow: "0 -4px 24px rgba(1,7,163,0.12)" }}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              ALTRO
            </span>
            <Button
              icon="pi pi-times"
              text
              onClick={() => setMoreOpen(false)}
              className="!p-1"
              style={{ color: "var(--text-muted)" }}
              aria-label="Chiudi"
            />
          </div>
          <div className="grid grid-cols-2 gap-1 px-3 pb-4">
            {MORE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                style={
                  isActive(item.href)
                    ? { background: "var(--surface-1)", color: "var(--primary)" }
                    : { color: "var(--text-secondary)" }
                }
              >
                <i className={`pi ${item.icon} text-base`} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        style={{
          background: "#fff",
          borderTop: "1px solid var(--border-soft)",
          boxShadow: "0 -2px 12px rgba(1,7,163,0.06)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex h-16">
          {MAIN_NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <div className="relative flex flex-col items-center">
                  {active && (
                    <span
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-b-full"
                      style={{ background: "var(--primary)" }}
                    />
                  )}
                  <i
                    className={`pi ${item.icon} text-xl`}
                    style={{ color: active ? "var(--primary)" : "var(--text-disabled)" }}
                  />
                </div>
                <span
                  className="text-[8px] font-black uppercase tracking-wide"
                  style={{ color: active ? "var(--primary)" : "var(--text-disabled)" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          <Button
            unstyled
            onClick={() => setMoreOpen((v) => !v)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5"
          >
            <i
              className="pi pi-ellipsis-h text-xl"
              style={{ color: moreIsActive || moreOpen ? "var(--primary)" : "var(--text-disabled)" }}
            />
            <span
              className="text-[8px] font-black uppercase tracking-wide"
              style={{ color: moreIsActive || moreOpen ? "var(--primary)" : "var(--text-disabled)" }}
            >
              ALTRO
            </span>
          </Button>
        </div>
      </nav>
    </>
  );
}
```

- [ ] **Step 2: Verifica TypeScript + build**

```bash
npx tsc --noEmit && npm run build
```
Atteso: build OK. Questo è il primo checkpoint completo: foundation + nav funzionano.

- [ ] **Step 3: Commit**

```bash
git add app/\(admin\)/admin/_bottom-nav.tsx
git commit -m "feat(design): redesign admin bottom nav with light theme"
```

---

## Task 8 — Home page (`app/page.tsx`)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Sostituisci `app/page.tsx`**

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import PublicBottomNav from "@/components/public-bottom-nav";
import PublicNav from "@/components/public-nav";
import StatusBadge from "@/components/status-badge";

export default async function HomePage() {
  const [user, teamCount, playerCount, fantasyCount, recentMatches] = await Promise.all([
    getCurrentUser(),
    db.footballTeam.count(),
    db.player.count(),
    db.fantasyTeam.count(),
    db.match.findMany({
      where: { status: { in: ["SCHEDULED", "CONCLUDED", "PUBLISHED"] } },
      orderBy: { startsAt: "desc" },
      take: 4,
      include: {
        homeTeam: { select: { name: true, shortName: true } },
        awayTeam: { select: { name: true, shortName: true } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      <PublicNav />

      <main className="flex-1 pb-24 md:pb-8">
        {/* ── Hero ── */}
        <section
          className="px-4 py-16 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #0107A3 0%, #000560 55%, #000338 100%)" }}
        >
          {/* Decorative circles */}
          <div className="absolute right-[-40px] top-[-40px] w-48 h-48 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute right-[-10px] top-[-10px] w-28 h-28 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute left-[-20px] bottom-[-20px] w-36 h-36 rounded-full border border-white/[0.03] pointer-events-none" />

          <div className="relative max-w-2xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: "rgba(232,160,0,0.15)", border: "1px solid rgba(232,160,0,0.30)", color: "#E8A000" }}
            >
              TORNEO DI PAESE · 2025
            </div>

            <h1 className="font-display font-black text-5xl md:text-6xl uppercase leading-none tracking-tight mb-4">
              FANTA<span style={{ color: "#E8A000" }}>DC</span>
            </h1>

            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "#E8A000" }} />

            <p className="text-base text-white/70 mb-8 leading-relaxed">
              Scegli i tuoi 5 campioni, vota l&apos;MVP e scala la classifica.
            </p>

            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full font-black text-sm uppercase tracking-wide px-8 py-3.5 transition-opacity hover:opacity-90"
                style={{ background: "#E8A000", color: "#06073D", boxShadow: "0 4px 16px rgba(232,160,0,0.45)" }}
              >
                VAI ALLA DASHBOARD →
              </Link>
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-full font-black text-sm uppercase tracking-wide px-8 py-3.5 transition-opacity hover:opacity-90"
                  style={{ background: "#E8A000", color: "#06073D", boxShadow: "0 4px 16px rgba(232,160,0,0.45)" }}
                >
                  PARTECIPA ORA →
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-full font-bold text-sm uppercase tracking-wide px-8 py-3.5 transition-colors"
                  style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  ACCEDI
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── Stats strip ── */}
        {(teamCount > 0 || playerCount > 0 || fantasyCount > 0) && (
          <section
            className="px-4 py-4"
            style={{ background: "#fff", borderBottom: "1px solid var(--border-soft)" }}
          >
            <div className="max-w-3xl mx-auto flex justify-around divide-x divide-[var(--border-soft)]">
              {teamCount > 0 && (
                <div className="flex-1 text-center py-1">
                  <div className="font-display font-black text-2xl" style={{ color: "var(--primary)" }}>{teamCount}</div>
                  <div className="over-label mt-0.5">Squadre</div>
                </div>
              )}
              {playerCount > 0 && (
                <div className="flex-1 text-center py-1">
                  <div className="font-display font-black text-2xl" style={{ color: "var(--primary)" }}>{playerCount}</div>
                  <div className="over-label mt-0.5">Giocatori</div>
                </div>
              )}
              {fantasyCount > 0 && (
                <div className="flex-1 text-center py-1">
                  <div className="font-display font-black text-2xl" style={{ color: "var(--primary)" }}>{fantasyCount}</div>
                  <div className="over-label mt-0.5">Fantasy</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Ultime partite ── */}
        {recentMatches.length > 0 && (
          <section className="max-w-3xl mx-auto w-full px-4 py-8">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="over-label mb-0.5">Calendario</div>
                <h2 className="font-display font-black text-xl uppercase" style={{ color: "var(--text-primary)" }}>
                  ULTIME PARTITE
                </h2>
              </div>
              <Link href="/partite" className="text-xs font-bold uppercase tracking-wide transition-colors hover:opacity-80" style={{ color: "var(--primary)" }}>
                VEDI TUTTO →
              </Link>
            </div>

            <div className="card overflow-hidden">
              {recentMatches.map((m, index) => (
                <Link
                  key={m.id}
                  href={`/partite/${m.id}`}
                  className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-[var(--surface-1)]"
                  style={index < recentMatches.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
                >
                  <div>
                    <span className="font-display font-black text-[13px] uppercase" style={{ color: "var(--text-primary)" }}>
                      {m.homeTeam.shortName ?? m.homeTeam.name}
                      <span className="mx-1.5 font-normal text-[11px]" style={{ color: "var(--text-disabled)" }}>vs</span>
                      {m.awayTeam.shortName ?? m.awayTeam.name}
                    </span>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {m.startsAt.toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <StatusBadge status={m.status} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Quick links ── */}
        <section className="max-w-3xl mx-auto w-full px-4 pb-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { href: "/classifica",  label: "CLASSIFICA", icon: "🏆" },
              { href: "/partite",     label: "PARTITE",    icon: "📅" },
              { href: "/squadre",     label: "SQUADRE",    icon: "🛡️" },
              { href: "/regolamento", label: "REGOLAMENTO",icon: "📋" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-2.5 rounded-2xl p-5 text-center transition-colors hover:bg-[var(--surface-2)]"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border-medium)" }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-display font-black text-[11px] uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer
        className="hidden md:block py-4 text-center text-[11px]"
        style={{ borderTop: "1px solid var(--border-soft)", color: "var(--text-disabled)" }}
      >
        Fantadc — Torneo di paese
      </footer>
      <PublicBottomNav />
    </div>
  );
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(design): redesign home page with premium hero, stats strip, match list"
```

---

## Task 9 — Classifica (`app/(public)/classifica/`)

**Files:**
- Modify: `app/(public)/classifica/page.tsx`
- Modify: `app/(public)/classifica/_table.tsx`

- [ ] **Step 1: Sostituisci `app/(public)/classifica/page.tsx`**

```tsx
import { computeRankings } from "@/lib/scoring";
import ClassificaTable from "./_table";

export const dynamic = "force-dynamic";

export default async function ClassificaPublicPage() {
  const rankings = await computeRankings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">Stagione 2025</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          CLASSIFICA
        </h1>
      </div>

      {rankings.length === 0 ? (
        <div className="card p-10 text-center over-label">Nessun risultato ancora pubblicato.</div>
      ) : (
        <ClassificaTable rows={rankings} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Sostituisci `app/(public)/classifica/_table.tsx`**

```tsx
"use client";

import Link from "next/link";

type RankRow = {
  rank: number;
  fantasyTeamId: number;
  fantasyTeamName: string;
  userEmail: string;
  userName: string | null;
  totalPoints: number;
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div
        className="w-8 h-8 rounded-[9px] flex items-center justify-center font-display font-black text-sm text-white flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #E8A000, #C87800)",
          boxShadow: "0 3px 10px rgba(232,160,0,0.5)",
        }}
      >
        1
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div
        className="w-8 h-8 rounded-[9px] flex items-center justify-center font-display font-black text-sm flex-shrink-0"
        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
      >
        2
      </div>
    );
  }
  return (
    <div
      className="w-8 h-8 rounded-[9px] flex items-center justify-center font-display font-black text-sm flex-shrink-0"
      style={{ background: "var(--surface-1)", color: "var(--text-muted)" }}
    >
      {rank}
    </div>
  );
}

export default function ClassificaTable({ rows }: { rows: RankRow[] }) {
  const top2 = rows.filter((r) => r.rank <= 2);
  const rest = rows.filter((r) => r.rank > 2);

  return (
    <div className="flex flex-col gap-3">
      {/* Podio top-2 */}
      {top2.length > 0 && (
        <div
          className="rounded-[18px] p-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)",
            boxShadow: "0 6px 24px rgba(1,7,163,0.30)",
          }}
        >
          {/* Decorative */}
          <div className="absolute right-[-20px] top-[-20px] w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute right-[10px] top-[10px] w-16 h-16 rounded-full border border-white/5 pointer-events-none" />

          {top2.map((row, idx) => (
            <div key={row.fantasyTeamId}>
              {idx > 0 && <div className="my-3" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }} />}
              <div className="flex items-center gap-3 relative">
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center font-display font-black text-base flex-shrink-0"
                  style={
                    idx === 0
                      ? {
                          background: "linear-gradient(135deg, #E8A000, #C87800)",
                          boxShadow: "0 3px 10px rgba(232,160,0,0.5)",
                          color: "#fff",
                        }
                      : { background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }
                  }
                >
                  {row.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/squadre-fantasy/${row.fantasyTeamId}`} className="hover:underline">
                    <div
                      className="font-display font-black text-[14px] uppercase truncate"
                      style={{ color: idx === 0 ? "#fff" : "rgba(255,255,255,0.85)" }}
                    >
                      {row.fantasyTeamName}
                    </div>
                  </Link>
                  <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {row.userName ?? row.userEmail}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className="font-display font-black text-2xl leading-none"
                    style={{ color: idx === 0 ? "#E8A000" : "rgba(255,255,255,0.55)" }}
                  >
                    {row.totalPoints.toFixed(1)}
                  </div>
                  <div className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>pt</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dal 3° in poi */}
      {rest.length > 0 && (
        <div className="card overflow-hidden">
          {rest.map((row, idx) => (
            <div
              key={row.fantasyTeamId}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-1)]"
              style={idx < rest.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
            >
              <RankBadge rank={row.rank} />
              <div className="flex-1 min-w-0">
                <Link href={`/squadre-fantasy/${row.fantasyTeamId}`} className="hover:underline">
                  <div className="font-display font-black text-[13px] uppercase truncate" style={{ color: "var(--text-primary)" }}>
                    {row.fantasyTeamName}
                  </div>
                </Link>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {row.userName ?? row.userEmail}
                </div>
              </div>
              <div className="font-display font-black text-lg flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
                {row.totalPoints.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verifica TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/\(public\)/classifica/
git commit -m "feat(design): redesign classifica with premium podium card and ranked list"
```

---

## Task 10 — Partite list (`app/(public)/partite/page.tsx`)

**Files:**
- Modify: `app/(public)/partite/page.tsx`

- [ ] **Step 1: Sostituisci il file**

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import StatusBadge from "@/components/status-badge";

export default async function PartitePublicPage() {
  const matches = await db.match.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { startsAt: "asc" },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">Stagione 2025</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          PARTITE
        </h1>
      </div>

      {matches.length === 0 ? (
        <div className="card p-10 text-center over-label">Nessuna partita disponibile.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((m) => (
            <Link
              key={m.id}
              href={`/partite/${m.id}`}
              className="card px-5 py-4 flex flex-col gap-3 hover:bg-[var(--surface-1)] transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={m.status} />
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {m.startsAt.toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-center">
                <span
                  className="font-display font-black text-[15px] uppercase flex-1 text-right"
                  style={{ color: "var(--text-primary)" }}
                >
                  {m.homeTeam.name}
                </span>
                <span className="text-[11px] font-bold flex-shrink-0" style={{ color: "var(--text-disabled)" }}>
                  VS
                </span>
                <span
                  className="font-display font-black text-[15px] uppercase flex-1 text-left"
                  style={{ color: "var(--text-primary)" }}
                >
                  {m.awayTeam.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/partite/page.tsx
git commit -m "feat(design): redesign partite list with centered vs layout and card style"
```

---

## Task 11 — Partita detail (`app/(public)/partite/[id]/page.tsx`)

**Files:**
- Modify: `app/(public)/partite/[id]/page.tsx`

- [ ] **Step 1: Sostituisci il file**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { isMvpWindowOpen } from "@/lib/domain/vote";
import StatusBadge from "@/components/status-badge";
import RoleBadge from "@/components/role-badge";

export default async function PartitaPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = Number(id);
  if (Number.isNaN(matchId)) notFound();

  const match = await db.match.findUnique({
    where: { id: matchId, status: { not: "DRAFT" } },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      players: {
        include: { player: { include: { footballTeam: { select: { name: true } } } } },
        orderBy: { player: { name: "asc" } },
      },
      bonuses: {
        include: { bonusType: true, player: { select: { name: true } } },
        orderBy: { id: "asc" },
      },
    },
  });
  if (!match) notFound();

  const windowOpen = isMvpWindowOpen(match.concludedAt);

  let mvpPlayer: { name: string; footballTeam: { name: string } } | null = null;
  if (!windowOpen && match.status === "PUBLISHED") {
    const topVote = await db.vote.groupBy({
      by: ["playerId"],
      where: { matchId: match.id },
      _count: { playerId: true },
      orderBy: { _count: { playerId: "desc" } },
      take: 1,
    });
    if (topVote[0]) {
      const mp = match.players.find((p) => p.playerId === topVote[0].playerId);
      if (mp) mvpPlayer = mp.player;
    }
  }

  const bonusByPlayer = new Map<string, typeof match.bonuses>();
  for (const b of match.bonuses) {
    const arr = bonusByPlayer.get(b.player.name) ?? [];
    arr.push(b);
    bonusByPlayer.set(b.player.name, arr);
  }

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/partite"
        className="flex items-center gap-1.5 text-xs font-semibold w-fit transition-colors hover:opacity-70"
        style={{ color: "var(--text-muted)" }}
      >
        <i className="pi pi-arrow-left text-[10px]" /> Tutte le partite
      </Link>

      {/* Header partita */}
      <div
        className="rounded-[18px] p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)", boxShadow: "0 6px 24px rgba(1,7,163,0.30)" }}
      >
        <div className="absolute right-[-20px] top-[-20px] w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute right-[10px] top-[10px] w-16 h-16 rounded-full border border-white/5 pointer-events-none" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="font-display font-black text-xl uppercase text-white leading-tight">
              {match.homeTeam.name}
              <span className="mx-2 text-sm font-normal text-white/40">vs</span>
              {match.awayTeam.name}
            </div>
            <div className="text-[12px] text-white/55 mt-1.5">
              {match.startsAt.toLocaleString("it-IT", { dateStyle: "full", timeStyle: "short" })}
            </div>
          </div>
          <div className="flex-shrink-0 mt-0.5">
            <StatusBadge status={match.status} />
          </div>
        </div>
      </div>

      {/* MVP */}
      {mvpPlayer && (
        <div className="card p-5 text-center" style={{ borderLeft: "3px solid #E8A000" }}>
          <div className="over-label mb-1">MVP della partita</div>
          <div className="font-display font-black text-2xl uppercase" style={{ color: "var(--text-primary)" }}>
            ★ {mvpPlayer.name}
          </div>
          <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{mvpPlayer.footballTeam.name}</div>
        </div>
      )}

      {/* Finestra voto aperta */}
      {windowOpen && (
        <div
          className="rounded-xl p-3.5 text-center text-sm font-semibold"
          style={{ background: "var(--primary-light)", color: "var(--primary)", border: "1px solid var(--border-medium)" }}
        >
          🗳️ Finestra di voto MVP aperta —{" "}
          <Link href="/login" className="font-black underline">
            accedi per votare
          </Link>
        </div>
      )}

      {/* Giocatori in campo */}
      {match.players.length > 0 && (
        <div>
          <div className="over-label mb-3">
            Giocatori in campo ({match.players.length})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {match.players.map(({ player }) => (
              <div
                key={player.id}
                className="card p-3 flex items-center gap-2.5"
              >
                <RoleBadge role={player.role} />
                <div className="min-w-0">
                  <div className="font-display font-black text-[12px] uppercase truncate" style={{ color: "var(--text-primary)" }}>
                    {player.name}
                  </div>
                  <div className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                    {player.footballTeam.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bonus */}
      {match.status === "PUBLISHED" && match.bonuses.length > 0 && (
        <div>
          <div className="over-label mb-3">Bonus assegnati</div>
          <div className="card overflow-hidden">
            {[...bonusByPlayer.entries()].map(([playerName, bonuses], index, entries) => (
              <div
                key={playerName}
                className="px-4 py-3"
                style={index < entries.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
              >
                <div className="font-display font-black text-[13px] uppercase mb-2" style={{ color: "var(--text-primary)" }}>
                  {playerName}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bonuses.map((b) => (
                    <span
                      key={b.id}
                      className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                      style={
                        Number(b.points) >= 0
                          ? { background: "#ECFDF5", color: "#065F46" }
                          : { background: "#FEF2F2", color: "#991B1B" }
                      }
                    >
                      {b.bonusType.code}
                      {b.quantity > 1 && ` ×${b.quantity}`} {Number(b.points) > 0 ? "+" : ""}
                      {Number(b.points)}pt
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/partite/\[id\]/page.tsx
git commit -m "feat(design): redesign partita detail page with premium header card"
```

---

## Task 12 — Dashboard utente (`app/(user)/dashboard/page.tsx`)

**Files:**
- Modify: `app/(user)/dashboard/page.tsx`

- [ ] **Step 1: Sostituisci il file**

```tsx
import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { Button } from "primereact/button";

export default async function DashboardPage() {
  const user = await requireAuth();
  const userId = Number(user.id);

  const fantasyTeam = await db.fantasyTeam.findUnique({
    where: { userId },
    include: {
      players: { include: { player: { select: { name: true, role: true } } } },
    },
  });

  const openMatches = await db.match.findMany({
    where: { status: "CONCLUDED" },
    orderBy: { concludedAt: "desc" },
    take: 3,
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
    },
  });

  const hasVoted = fantasyTeam
    ? await db.vote.findMany({
        where: { userId, matchId: { in: openMatches.map((m) => m.id) } },
        select: { matchId: true },
      })
    : [];
  const votedMatchIds = new Set(hasVoted.map((v) => v.matchId));

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <div className="over-label mb-0.5">Bentornato</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          {user.name ? user.name.toUpperCase() : user.email.split("@")[0].toUpperCase()}
        </h1>
      </div>

      {/* Admin CTA */}
      {user.role === "ADMIN" && (
        <div className="card p-4 flex items-center justify-between gap-4">
          <div>
            <div className="font-display font-black text-[13px] uppercase" style={{ color: "var(--text-primary)" }}>
              ACCESSO AMMINISTRATORE
            </div>
            <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              Gestisci partite, bonus e dati del campionato.
            </div>
          </div>
          <Link href="/admin">
            <Button label="Admin →" size="small" />
          </Link>
        </div>
      )}

      {/* Squadra */}
      {!fantasyTeam ? (
        <div
          className="rounded-[18px] p-6 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)", boxShadow: "0 6px 24px rgba(1,7,163,0.30)" }}
        >
          <div className="absolute right-[-20px] top-[-20px] w-28 h-28 rounded-full border border-white/5 pointer-events-none" />
          <div className="text-white/60 text-sm mb-4">Non hai ancora creato la tua squadra fantasy.</div>
          <Link href="/squadra/crea">
            <button
              className="rounded-full font-black text-sm uppercase tracking-wide px-6 py-2.5"
              style={{ background: "#E8A000", color: "#06073D", boxShadow: "0 2px 8px rgba(232,160,0,0.4)" }}
            >
              CREA LA TUA SQUADRA →
            </button>
          </Link>
        </div>
      ) : (
        <div
          className="rounded-[18px] p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)", boxShadow: "0 6px 24px rgba(1,7,163,0.30)" }}
        >
          <div className="absolute right-[-20px] bottom-[-20px] w-28 h-28 rounded-full border border-white/5 pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">La mia squadra</div>
                <div className="font-display font-black text-xl uppercase text-white">{fantasyTeam.name}</div>
              </div>
              <Link href="/squadra" className="text-[10px] font-bold uppercase tracking-wide text-white/60 hover:text-white transition-colors mt-1">
                VEDI →
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {fantasyTeam.players.map(({ player }) => (
                <span
                  key={player.name}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.9)" }}
                >
                  {player.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vota MVP */}
      {openMatches.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-soft)" }}>
            <div className="over-label">Vota MVP</div>
            <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: "#E8A000" }}>
              {openMatches.filter((m) => !votedMatchIds.has(m.id)).length} aperti
            </span>
          </div>
          {openMatches.map((m, index) => {
            const voted = votedMatchIds.has(m.id);
            return (
              <div
                key={m.id}
                className="flex items-center justify-between px-4 py-3"
                style={index < openMatches.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
              >
                <div>
                  <div className="font-display font-black text-[12px] uppercase" style={{ color: "var(--text-primary)" }}>
                    {m.homeTeam.name} <span style={{ color: "var(--text-disabled)", fontFamily: "inherit", fontWeight: 400, fontSize: "10px" }}>vs</span> {m.awayTeam.name}
                  </div>
                </div>
                {voted ? (
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" }}
                  >
                    ✓ Votato
                  </span>
                ) : (
                  <Link href={`/vota/${m.id}`}>
                    <button
                      className="rounded-full font-black text-[10px] uppercase tracking-wide px-3 py-1.5"
                      style={{ background: "#E8A000", color: "#06073D", boxShadow: "0 2px 6px rgba(232,160,0,0.35)" }}
                    >
                      VOTA
                    </button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick links */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/classifica">
          <Button label="Classifica" outlined size="small" />
        </Link>
        <Link href="/partite">
          <Button label="Partite" outlined size="small" />
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/\(user\)/dashboard/page.tsx
git commit -m "feat(design): redesign user dashboard with premium squad card and MVP voting section"
```

---

## Task 13 — Squadra utente (`app/(user)/squadra/page.tsx`)

**Files:**
- Modify: `app/(user)/squadra/page.tsx`

- [ ] **Step 1: Sostituisci la funzione `PlayerCard` e la sezione di layout in `app/(user)/squadra/page.tsx`**

Sostituisci l'intero file:

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { computeTeamHistory } from "@/lib/scoring";
import { Button } from "primereact/button";
import RosterTable from "./_roster-table";
import ScoreTable from "./_score-table";

export default async function SquadraPage() {
  const user = await requireAuth();
  const userId = Number(user.id);

  const fantasyTeam = await db.fantasyTeam.findUnique({
    where: { userId },
    include: {
      players: {
        include: {
          player: {
            include: { footballTeam: { select: { name: true, shortName: true } } },
          },
        },
      },
      captain: { select: { id: true, name: true } },
    },
  });

  if (!fantasyTeam) redirect("/squadra/crea");

  const history = await computeTeamHistory(fantasyTeam.id);
  const totalPoints = history.reduce((s, m) => s + m.total, 0);

  const gk = fantasyTeam.players.find((p) => p.player.role === "P");
  const outfield = fantasyTeam.players.filter((p) => p.player.role === "A");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="over-label mb-0.5">La mia squadra</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          {fantasyTeam.name.toUpperCase()}
        </h1>
        {history.length > 0 && (
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-display font-black text-2xl" style={{ color: "var(--primary)" }}>
              {totalPoints.toFixed(1)}
            </span>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>punti totali</span>
          </div>
        )}
      </div>

      {/* Card premium squadra */}
      <div
        className="rounded-[18px] p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)", boxShadow: "0 6px 24px rgba(1,7,163,0.30)" }}
      >
        <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
        <div className="relative">
          <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-3">
            Capitano: <span className="text-[#E8A000]">★ {fantasyTeam.captain.name}</span>
          </div>
          {/* Attaccanti */}
          <div className="flex flex-wrap gap-2 mb-2 justify-center">
            {outfield.map(({ player }) => (
              <PlayerChip
                key={player.id}
                name={player.name}
                team={player.footballTeam.shortName ?? player.footballTeam.name}
                isCaptain={player.id === fantasyTeam.captainPlayerId}
              />
            ))}
          </div>
          {/* Portiere */}
          {gk && (
            <div className="flex justify-center">
              <PlayerChip
                name={gk.player.name}
                team={gk.player.footballTeam.shortName ?? gk.player.footballTeam.name}
                isCaptain={gk.player.id === fantasyTeam.captainPlayerId}
                isGk
              />
            </div>
          )}
        </div>
      </div>

      {/* Rosa */}
      <div>
        <div className="over-label mb-3">Rosa</div>
        <RosterTable
          rows={fantasyTeam.players.map(({ player }) => ({
            id: player.id,
            name: player.name,
            role: player.role,
            footballTeamName: player.footballTeam.name,
            isCaptain: player.id === fantasyTeam.captainPlayerId,
          }))}
        />
      </div>

      <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
        La rosa è bloccata. Solo un admin può modificarla.
      </p>

      {/* Storico punteggi */}
      {history.length > 0 && (
        <div>
          <div className="over-label mb-3">Storico punteggi</div>
          <div className="flex flex-col gap-2">
            {history.map((ms) => (
              <details key={ms.matchId} className="card overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--surface-1)] transition-colors">
                  <span className="font-display font-black text-[13px] uppercase" style={{ color: "var(--text-primary)" }}>
                    {ms.label}
                  </span>
                  <span className="font-display font-black text-base" style={{ color: "var(--primary)" }}>
                    {ms.total.toFixed(1)} pt
                  </span>
                </summary>
                <div className="px-4 pb-3">
                  <ScoreTable rows={ms.playerScores} />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      <div>
        <Link href="/dashboard">
          <Button label="← Dashboard" outlined size="small" />
        </Link>
      </div>
    </div>
  );
}

function PlayerChip({
  name,
  team,
  isCaptain,
  isGk = false,
}: {
  name: string;
  team: string;
  isCaptain: boolean;
  isGk?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center rounded-xl px-3 py-2 text-center"
      style={
        isGk
          ? { background: "rgba(232,160,0,0.20)", border: "1px solid rgba(232,160,0,0.35)" }
          : { background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.16)" }
      }
    >
      {isCaptain && (
        <span className="text-[9px] font-black uppercase tracking-wide mb-0.5" style={{ color: "#E8A000" }}>
          ★ CAP
        </span>
      )}
      <span className="font-display font-black text-[11px] uppercase text-white leading-tight">{name}</span>
      <span className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{team}</span>
    </div>
  );
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/\(user\)/squadra/page.tsx
git commit -m "feat(design): redesign squadra page with premium player card on blue gradient"
```

---

## Task 14 — Vota MVP (`app/(user)/vota/[id]/`)

**Files:**
- Modify: `app/(user)/vota/[id]/page.tsx`
- Modify: `app/(user)/vota/[id]/_vote-form.tsx`

- [ ] **Step 1: Sostituisci `app/(user)/vota/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { isMvpWindowOpen } from "@/lib/domain/vote";
import { Button } from "primereact/button";
import VoteForm from "./_vote-form";

export default async function VotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = Number(id);
  const user = await requireAuth();
  const userId = Number(user.id);

  const match = await db.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      players: {
        include: { player: { include: { footballTeam: { select: { name: true } } } } },
      },
    },
  });
  if (!match) notFound();

  const windowOpen = isMvpWindowOpen(match.concludedAt);
  const userVote = await db.vote.findUnique({
    where: { userId_matchId: { userId, matchId } },
    include: { player: { select: { name: true } } },
  });

  const voteCounts = await db.vote.groupBy({
    by: ["playerId"],
    where: { matchId },
    _count: { playerId: true },
    orderBy: { _count: { playerId: "desc" } },
  });
  const topVotedId = voteCounts[0]?.playerId ?? null;
  const topPlayer = topVotedId
    ? match.players.find((mp) => mp.playerId === topVotedId)?.player
    : null;

  const title = `${match.homeTeam.name} vs ${match.awayTeam.name}`;

  if (match.status === "DRAFT" || match.status === "SCHEDULED") {
    return (
      <div className="flex flex-col gap-4 items-center py-12 max-w-sm mx-auto text-center">
        <h1 className="font-display font-black text-2xl uppercase" style={{ color: "var(--text-primary)" }}>
          {title}
        </h1>
        <p style={{ color: "var(--text-muted)" }}>La partita non è ancora conclusa.</p>
        <Link href="/dashboard">
          <Button label="← Dashboard" outlined size="small" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-sm mx-auto">
      {/* Header partita */}
      <div
        className="rounded-[18px] p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)", boxShadow: "0 6px 24px rgba(1,7,163,0.30)" }}
      >
        <div className="absolute right-[-20px] top-[-20px] w-28 h-28 rounded-full border border-white/5 pointer-events-none" />
        <div className="relative">
          <div className="over-label mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Vota MVP</div>
          <div className="font-display font-black text-xl uppercase text-white leading-tight">{title}</div>
          <div className="mt-2">
            {windowOpen ? (
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                style={{ background: "rgba(34,197,94,0.2)", color: "#86efac", border: "1px solid rgba(34,197,94,0.3)" }}
              >
                ● FINESTRA APERTA
              </span>
            ) : (
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
              >
                VOTAZIONE CHIUSA
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hai già votato */}
      {userVote && (
        <div
          className="card p-4 text-center"
          style={{ borderLeft: "3px solid #22C55E" }}
        >
          <div className="font-black text-sm" style={{ color: "#065F46" }}>✓ Hai votato</div>
          <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Il tuo MVP: <span className="font-display font-black uppercase" style={{ color: "var(--text-primary)" }}>{userVote.player.name}</span>
          </div>
        </div>
      )}

      {/* Form di voto */}
      {windowOpen && !userVote && (
        <>
          <div className="over-label">Scegli il giocatore MVP</div>
          <VoteForm
            matchId={matchId}
            players={match.players.map((mp) => ({
              id: mp.player.id,
              name: mp.player.name,
              footballTeam: mp.player.footballTeam,
            }))}
          />
        </>
      )}

      {/* Favorito provvisorio */}
      {windowOpen && topPlayer && (userVote || voteCounts.length > 0) && (
        <div className="card p-4 text-center">
          <div className="over-label mb-1">Favorito provvisorio</div>
          <div className="font-display font-black text-xl uppercase" style={{ color: "var(--primary)" }}>
            {topPlayer.name}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{topPlayer.footballTeam.name}</div>
        </div>
      )}

      {/* MVP finale */}
      {!windowOpen && topPlayer && (
        <div className="card p-5 text-center" style={{ borderLeft: "3px solid #E8A000" }}>
          <div className="over-label mb-1">MVP della partita</div>
          <div className="font-display font-black text-2xl uppercase" style={{ color: "var(--text-primary)" }}>
            ★ {topPlayer.name}
          </div>
          <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{topPlayer.footballTeam.name}</div>
        </div>
      )}

      {!windowOpen && !topPlayer && (
        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>Nessun voto registrato per questa partita.</p>
      )}

      <Link href="/dashboard">
        <Button label="← Dashboard" outlined size="small" />
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Sostituisci `app/(user)/vota/[id]/_vote-form.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { castVote } from "@/app/actions/user/vote";

type Player = { id: number; name: string; footballTeam: { name: string } };

export default function VoteForm({ matchId, players }: { matchId: number; players: Player[] }) {
  const [state, action, pending] = useActionState(castVote, undefined);

  if (state?.success) {
    return (
      <div className="card p-8 text-center">
        <div className="text-3xl mb-2">✓</div>
        <div className="font-display font-black text-lg uppercase" style={{ color: "#065F46" }}>
          VOTO REGISTRATO!
        </div>
        <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Il risultato sarà visibile alla chiusura della finestra di voto.
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="matchId" value={matchId} />
      {players.map((p) => (
        <button
          key={p.id}
          type="submit"
          name="playerId"
          value={p.id}
          disabled={pending}
          className="card px-4 py-3.5 flex items-center justify-between text-left w-full transition-colors hover:bg-[var(--surface-1)] active:bg-[var(--surface-2)] disabled:opacity-50"
        >
          <span className="font-display font-black text-[13px] uppercase" style={{ color: "var(--text-primary)" }}>
            {p.name}
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{p.footballTeam.name}</span>
        </button>
      ))}
      {state?.success === false && (
        <p className="text-sm text-center" style={{ color: "#EF4444" }}>{state.message}</p>
      )}
    </form>
  );
}
```

- [ ] **Step 3: Verifica TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/\(user\)/vota/
git commit -m "feat(design): redesign vota MVP page with premium match header and vote form"
```

---

## Task 15 — Pagine auth: login e register

**Files:**
- Modify: `app/(public)/login/page.tsx`
- Modify: `app/(public)/login/_form.tsx`
- Modify: `app/(public)/register/page.tsx`

- [ ] **Step 1: Leggi i file correnti di login e register**

```bash
cat app/\(public\)/login/page.tsx
cat app/\(public\)/login/_form.tsx
cat app/\(public\)/register/page.tsx
```

- [ ] **Step 2: Applica il pattern auth-card a `app/(public)/login/page.tsx`**

Avvolgi il contenuto in un layout centrato con card premium:

```tsx
// Struttura da applicare — adatta al contenuto esistente del file
// Il layout wrapper è:
export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mx-auto mb-3"
            style={{ background: "var(--primary)" }}
          >
            ⚽
          </div>
          <h1 className="font-display font-black text-2xl uppercase" style={{ color: "var(--text-primary)" }}>
            FANTA<span style={{ color: "var(--primary)" }}>DC</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Accedi al tuo account</p>
        </div>

        <div className="card p-6">
          {/* Inserire qui il <LoginForm /> o il contenuto esistente */}
        </div>

        <p className="text-center text-sm mt-4" style={{ color: "var(--text-muted)" }}>
          Non hai un account?{" "}
          <a href="/register" className="font-bold" style={{ color: "var(--primary)" }}>Registrati</a>
        </p>
      </div>
    </div>
  );
}
```

**Nota:** Leggi il file esistente prima di riscriverlo — mantieni la stessa logica server (redirect, session check), cambia solo il markup.

- [ ] **Step 3: Applica lo stesso pattern a `app/(public)/register/page.tsx`**

Stesso wrapper della login, con titolo "CREA ACCOUNT" e link a "/login".

- [ ] **Step 4: Verifica TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add app/\(public\)/login/ app/\(public\)/register/
git commit -m "feat(design): redesign login and register pages with centered card layout"
```

---

## Task 16 — Altre pagine pubbliche

**Files:**
- Modify: `app/(public)/squadre-fantasy/page.tsx`
- Modify: `app/(public)/squadre-fantasy/[id]/page.tsx`
- Modify: `app/(public)/squadre/page.tsx`
- Modify: `app/(public)/giocatori/page.tsx`
- Modify: `app/(public)/regolamento/page.tsx`

- [ ] **Step 1: Per ogni pagina, applica il pattern heading standard**

Sostituisci le intestazioni `<h1 className="text-[22px] font-bold text-[var(--text-primary)]">` con:

```tsx
<div>
  <div className="over-label mb-1">Stagione 2025</div>
  <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
    TITOLO PAGINA
  </h1>
</div>
```

- [ ] **Step 2: Sostituisci `admin-card` con `card` nelle pagine pubbliche**

Le pagine pubbliche usano `admin-card` — il CSS le rende identiche, ma per chiarezza semantica usa `card`. Sostituisci in ogni file pubblico:

```bash
# Non eseguire questo comando — fallo manualmente file per file per controllare il contesto
```

- [ ] **Step 3: Per le liste (squadre-fantasy, squadre, giocatori) applica card con ombra**

Pattern lista per `squadre-fantasy/page.tsx`:

```tsx
// Ogni row di lista diventa:
<Link
  href={`/squadre-fantasy/${item.id}`}
  className="card px-5 py-4 flex items-center justify-between hover:bg-[var(--surface-1)] transition-colors"
>
  <div>
    <div className="font-display font-black text-[14px] uppercase" style={{ color: "var(--text-primary)" }}>
      {item.name}
    </div>
    <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{item.userLabel}</div>
  </div>
  <i className="pi pi-chevron-right text-xs" style={{ color: "var(--text-disabled)" }} />
</Link>
```

- [ ] **Step 4: Per la pagina regolamento, applica card con sezioni**

```tsx
// Struttura base regolamento:
<div className="card p-6 prose-sm max-w-none">
  {/* contenuto regolamento invariato, solo il wrapper cambia */}
</div>
```

- [ ] **Step 5: Verifica TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add app/\(public\)/squadre-fantasy/ app/\(public\)/squadre/ app/\(public\)/giocatori/ app/\(public\)/regolamento/
git commit -m "feat(design): update remaining public pages with light theme headings and card pattern"
```

---

## Task 17 — Pagina admin dashboard (`app/(admin)/admin/page.tsx`)

**Files:**
- Modify: `app/(admin)/admin/page.tsx`

- [ ] **Step 1: Leggi il file corrente**

```bash
cat app/\(admin\)/admin/page.tsx
```

- [ ] **Step 2: Applica heading standard e sostituisci card dark**

Pattern heading admin:

```tsx
<div>
  <div className="over-label mb-1">Area admin</div>
  <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
    DASHBOARD
  </h1>
</div>
```

Le statistiche admin e le card di riepilogo usano `.admin-card` — il token aggiornato le rende già white con ombra blu. Se ci sono stili hardcoded dark (es. `#070B14`, `rgba(255,255,255,0.04)`), sostituiscili con `var(--surface-1)` e `var(--border-soft)`.

- [ ] **Step 3: Verifica TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/\(admin\)/admin/page.tsx
git commit -m "feat(design): update admin dashboard page heading and card styles"
```

---

## Task 18 — Build finale + cleanup

- [ ] **Step 1: Cerca stili hardcoded dark residui**

```bash
grep -r "#070B14\|#0A1020\|#0F1728\|#131D31\|rgba(255,255,255,0.04)\|rgba(255,255,255,0.06)" app/ components/ --include="*.tsx" -l
```

Per ogni file trovato, sostituisci con i token light equivalenti:
- `#070B14` → `var(--bg-base)`
- `#0A1020` → `var(--bg-secondary)`
- `#0F1728` → `var(--surface-1)`
- `rgba(255,255,255,0.04)` → `var(--border-soft)`
- `rgba(255,255,255,0.06)` → `var(--glass)`

- [ ] **Step 2: Cerca riferimenti a colori dark nel testo**

```bash
grep -r "lara-dark-blue\|bg-zinc\|bg-gray-900\|bg-slate-900\|text-white" app/ components/ --include="*.tsx" -l
```

Rimuovi o adatta i riferimenti al dark theme che non siano dentro sezioni volutamente scure (es. hero gradient).

- [ ] **Step 3: Build di produzione**

```bash
npm run build
```

Atteso: build completata senza errori. Se compaiono errori TypeScript, risolvili prima di procedere.

- [ ] **Step 4: TypeScript check finale**

```bash
npx tsc --noEmit
```

Atteso: 0 errori

- [ ] **Step 5: Commit finale**

```bash
git add -A
git commit -m "feat(design): complete premium football light theme redesign

- Blue Sport palette: white backgrounds, #0107A3 primary, #E8A000 gold
- Barlow Condensed bold/uppercase typography for headings and team names
- Premium gradient cards for hero, squad, classifica podium
- Updated all shared components, nav, and main pages
- PrimeReact light theme (lara-light-blue) with full overrides

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Self-Review — Copertura spec

| Requisito spec | Task |
|---|---|
| Token palette Blue Sport (bg, surface, primary, gold, text) | Task 2 |
| Font Barlow Condensed | Task 1 |
| PrimeReact lara-light-blue | Task 1 |
| PrimeReact overrides light (DataTable, Input, Button, Dialog) | Task 2 |
| StatusBadge e RoleBadge light | Task 3 |
| PublicNav con logomark | Task 4 |
| PublicBottomNav con indicator blu | Task 5 |
| Admin TopBar con logomark | Task 6 |
| Admin BottomNav | Task 7 |
| Home hero + stats + partite + quick links | Task 8 |
| Classifica podio premium + lista | Task 9 |
| Partite lista "vs" centrato | Task 10 |
| Partita detail header premium | Task 11 |
| Dashboard utente card squadra premium + MVP | Task 12 |
| Squadra page con chip giocatori su blu | Task 13 |
| Vota MVP con header partita premium | Task 14 |
| Auth pages (login, register) | Task 15 |
| Altre pagine pubbliche (squadre, giocatori, ecc.) | Task 16 |
| Admin dashboard | Task 17 |
| Cleanup stili dark residui + build finale | Task 18 |
