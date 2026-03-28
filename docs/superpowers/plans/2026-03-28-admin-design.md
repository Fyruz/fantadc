# Admin UI Redesign — Sports Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all admin pages with a premium, mobile-first sports dashboard aesthetic — light theme, top bar + mobile bottom nav, new shared components, and a PlayerRole enum migration from GK/PLAYER to P/A.

**Architecture:** New shared components (`StatusBadge`, `RoleBadge`, `StatCard`, `AdminPageHeader`) replace inline styles and PrimeReact `<Tag>`. Admin layout splits into a server layout + two client nav components (`_top-bar.tsx`, `_bottom-nav.tsx`). All DataTable pages get CSS-level overrides via `globals.css`.

**Tech Stack:** Next.js 15 App Router, TypeScript, Prisma, PrimeReact 10, Tailwind CSS v4, PostgreSQL

---

## File Map

**New files:**
- `components/status-badge.tsx` — match status badge (dot + label)
- `components/role-badge.tsx` — player role badge (P / A)
- `components/stat-card.tsx` — dashboard stat card with icon
- `components/admin-page-header.tsx` — page title + optional CTA + back link
- `app/(admin)/admin/_top-bar.tsx` — sticky top bar (client, uses usePathname)
- `app/(admin)/admin/_bottom-nav.tsx` — mobile bottom nav + More drawer (client)
- `prisma/migrations/20260328000000_rename_player_role_p_a/migration.sql`

**Modified files:**
- `prisma/schema.prisma` — PlayerRole enum: GK→P, PLAYER→A
- `prisma/seed-tournament.ts` — update PlayerRole.GK/PLAYER refs
- `app/globals.css` — design tokens + PrimeReact DataTable overrides
- `app/(admin)/admin/layout.tsx` — full redesign (server, wires nav components)
- `app/(admin)/admin/page.tsx` — dashboard redesign
- `app/(admin)/admin/partite/_table.tsx` — StatusBadge, responsive columns
- `app/(admin)/admin/giocatori/_table.tsx` — RoleBadge, responsive columns
- `app/(admin)/admin/squadre/_table.tsx` — responsive columns
- `app/(admin)/admin/utenti/_table.tsx` — responsive columns
- `app/(admin)/admin/bonus-types/_table.tsx` — minor updates
- `app/(admin)/admin/squadre-fantasy/_table.tsx` — minor updates
- `app/(admin)/admin/partite/[id]/page.tsx` — header card + layout
- `app/(admin)/admin/partite/[id]/_status-actions.tsx` — StatusBadge, pill buttons
- `app/(admin)/admin/partite/[id]/_player-bonus-card.tsx` — full redesign
- `app/(admin)/admin/partite/new/_form.tsx` — card wrapper
- `app/(admin)/admin/partite/new/page.tsx` — AdminPageHeader
- `app/(admin)/admin/giocatori/new/_form.tsx` — card wrapper + role options P/A
- `app/(admin)/admin/giocatori/new/page.tsx` — AdminPageHeader
- `app/(admin)/admin/giocatori/[id]/edit/_form.tsx` — card wrapper + role options P/A
- `app/(admin)/admin/giocatori/[id]/edit/page.tsx` — AdminPageHeader (if exists)
- `app/(admin)/admin/squadre/new/page.tsx` — card wrapper + AdminPageHeader
- `app/(admin)/admin/squadre/[id]/edit/_form.tsx` — card wrapper
- `app/(admin)/admin/squadre/[id]/edit/page.tsx` — AdminPageHeader (if exists)
- `app/(admin)/admin/squadre-fantasy/[id]/_roster-form.tsx` — update GK/PLAYER label
- `app/(public)/squadre-fantasy/[id]/page.tsx` — GK→P
- `app/(public)/giocatori/page.tsx` — GK→P
- `app/(user)/squadra/page.tsx` — GK→P, PLAYER→A
- `app/(user)/squadra/crea/_form.tsx` — type + comparisons GK→P, PLAYER→A

---

## Task 1: PlayerRole enum migration (GK→P, PLAYER→A)

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260328000000_rename_player_role_p_a/migration.sql`
- Modify: `prisma/seed-tournament.ts`
- Modify: `app/(admin)/admin/giocatori/new/_form.tsx`
- Modify: `app/(admin)/admin/giocatori/[id]/edit/_form.tsx`
- Modify: `app/(admin)/admin/squadre-fantasy/[id]/_roster-form.tsx`
- Modify: `app/(public)/squadre-fantasy/[id]/page.tsx`
- Modify: `app/(public)/giocatori/page.tsx`
- Modify: `app/(user)/squadra/page.tsx`
- Modify: `app/(user)/squadra/crea/_form.tsx`

- [ ] **Step 1: Update prisma/schema.prisma enum**

In `prisma/schema.prisma`, find and replace the `PlayerRole` enum:

```prisma
enum PlayerRole {
  P
  A
}
```

- [ ] **Step 2: Create migration directory and SQL file**

Create directory `prisma/migrations/20260328000000_rename_player_role_p_a/` and file `migration.sql` with content:

```sql
-- Rename PlayerRole enum values GK→P and PLAYER→A
ALTER TYPE "PlayerRole" RENAME VALUE 'GK' TO 'P';
ALTER TYPE "PlayerRole" RENAME VALUE 'PLAYER' TO 'A';
```

- [ ] **Step 3: Apply migration and regenerate Prisma client**

```bash
npx prisma migrate resolve --applied 20260328000000_rename_player_role_p_a
npx prisma generate
```

Expected output: `✔ Generated Prisma Client`

If the DB already has data with the old values, run instead:
```bash
npx prisma migrate dev --name rename-player-role-p-a --create-only
```
Then replace the generated migration file content with just the two ALTER TYPE lines, then:
```bash
npx prisma migrate dev
npx prisma generate
```

- [ ] **Step 4: Update prisma/seed-tournament.ts**

Replace all `PlayerRole.GK` with `PlayerRole.P` and `PlayerRole.PLAYER` with `PlayerRole.A`:

```typescript
// Before:
{ name: "Portiere Alpha", role: PlayerRole.GK },
{ name: "Giocatore A1",   role: PlayerRole.PLAYER },
// After:
{ name: "Portiere Alpha", role: PlayerRole.P },
{ name: "Giocatore A1",   role: PlayerRole.A },
```

Apply same replacement to all 8 teams (every `.GK` → `.P`, every `.PLAYER` → `.A`).

- [ ] **Step 5: Update giocatori new form role options**

In `app/(admin)/admin/giocatori/new/_form.tsx`, replace ROLE_OPTIONS:

```typescript
const ROLE_OPTIONS = [
  { label: "Portiere", value: "P" },
  { label: "Giocatore", value: "A" },
];
```

- [ ] **Step 6: Update giocatori edit form role options**

In `app/(admin)/admin/giocatori/[id]/edit/_form.tsx`, replace ROLE_OPTIONS:

```typescript
const ROLE_OPTIONS = [
  { label: "Portiere", value: "P" },
  { label: "Giocatore", value: "A" },
];
```

- [ ] **Step 7: Update roster-form label**

In `app/(admin)/admin/squadre-fantasy/[id]/_roster-form.tsx`, replace the label text:

```tsx
<label className="block text-sm font-medium mb-2">Seleziona 5 giocatori (1 P + 4 A, squadre diverse)</label>
```

- [ ] **Step 8: Update public squadre-fantasy page**

In `app/(public)/squadre-fantasy/[id]/page.tsx`, replace `=== "GK"` with `=== "P"`:

```typescript
// Before:
backgroundColor: player.role === "GK" ? "#ca8a04" : "var(--primary)"
// After:
backgroundColor: player.role === "P" ? "#ca8a04" : "var(--primary)"
```

- [ ] **Step 9: Update public giocatori page**

In `app/(public)/giocatori/page.tsx`, replace `=== "GK"` with `=== "P"`:

```typescript
// Before:
style={{ backgroundColor: p.role === "GK" ? "#ca8a04" : "var(--primary)" }}
// After:
style={{ backgroundColor: p.role === "P" ? "#ca8a04" : "var(--primary)" }}
```

- [ ] **Step 10: Update user squadra page**

In `app/(user)/squadra/page.tsx`, replace:

```typescript
// Before:
const gk = fantasyTeam.players.find((p) => p.player.role === "GK");
const outfield = fantasyTeam.players.filter((p) => p.player.role === "PLAYER");
// After:
const gk = fantasyTeam.players.find((p) => p.player.role === "P");
const outfield = fantasyTeam.players.filter((p) => p.player.role === "A");
```

- [ ] **Step 11: Update crea squadra form**

In `app/(user)/squadra/crea/_form.tsx`, replace all occurrences:

```typescript
// Type annotation (line 9):
role: "P" | "A";

// Filter functions — replace all "GK" → "P" and "PLAYER" → "A":
const gks = players.filter((p) => p.role === "P");
const outfield = players.filter((p) => p.role === "A");

// In validation useMemo:
const gkCount = selectedPlayers.filter((p) => p.role === "P").length;
const playerCount = selectedPlayers.filter((p) => p.role === "A").length;

// In togglePlayer:
function togglePlayer(id: number, role: "P" | "A") {
  setSelectedIds((prev) => {
    if (prev.includes(id)) {
      if (captainId === id) setCaptainId(null);
      return prev.filter((x) => x !== id);
    }
    const gkCount = players.filter((p) => prev.includes(p.id) && p.role === "P").length;
    const playerCount = players.filter((p) => prev.includes(p.id) && p.role === "A").length;
    if (prev.length >= 5) return prev;
    if (role === "P" && gkCount >= 1) return prev;
    if (role === "A" && playerCount >= 4) return prev;
    return [...prev, id];
  });
}

// In renderPlayerList blocking logic:
const gkBlock =
  !selected &&
  p.role === "P" &&
  selectedPlayers.some((sp) => sp.role === "P");
const playerBlock =
  !selected &&
  p.role === "A" &&
  selectedPlayers.filter((sp) => sp.role === "A").length >= 4;
```

- [ ] **Step 12: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. Fix any remaining `GK`/`PLAYER` string literals if found.

- [ ] **Step 13: Commit**

```bash
git add prisma/ app/
git commit -m "feat: rename PlayerRole enum GK→P, PLAYER→A"
```

---

## Task 2: Design tokens + PrimeReact CSS overrides

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace globals.css content**

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #0107A3;
  --primary-hover: #0106c4;
  --primary-dark: #000b8a;
  --primary-light: #E8E9F8;
  --gold: #F5C518;
  --bg: #F8F9FC;
  --surface: #FFFFFF;
  --border: #E5E7EB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

@layer components {
  .btn-primary {
    @apply text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
    background-color: var(--primary);
  }
  .btn-primary:hover:not(:disabled) {
    background-color: var(--primary-hover);
  }
  .btn-danger {
    @apply bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors;
  }
  .btn-secondary {
    @apply bg-white text-zinc-700 px-4 py-2 rounded text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 transition-colors border border-zinc-300;
  }
  .btn-outline-primary {
    @apply bg-transparent text-white px-4 py-2 rounded text-sm font-medium transition-colors border border-white hover:bg-white/10;
  }
  .input {
    @apply border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400;
  }
  .badge-draft     { @apply text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-500; }
  .badge-scheduled { @apply text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700; }
  .badge-concluded { @apply text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700; }
  .badge-published { @apply text-xs px-2 py-0.5 rounded bg-green-100 text-green-700; }

  /* Admin card base */
  .admin-card {
    @apply bg-white rounded-2xl shadow-sm border border-[#E5E7EB];
  }
}

/* ─── PrimeReact DataTable overrides ─────────────────────────────────── */

/* Header row */
.p-datatable .p-datatable-thead > tr > th {
  background: #F8F9FC !important;
  color: #6B7280 !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  border-bottom: 1px solid #E5E7EB !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  padding: 12px 16px !important;
}

/* Body rows */
.p-datatable .p-datatable-tbody > tr > td {
  padding: 0 16px !important;
  height: 52px !important;
  border-bottom: 1px solid #F3F4F6 !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
}

/* Striped even rows */
.p-datatable.p-datatable-striped .p-datatable-tbody > tr:nth-child(even) > td {
  background: #FAFAFA !important;
}

/* Hover */
.p-datatable .p-datatable-tbody > tr:hover > td {
  background: #F0F1FC !important;
}

/* Remove outer table border */
.p-datatable .p-datatable-table {
  border-collapse: collapse !important;
}

/* Paginator */
.p-paginator {
  background: white !important;
  border: none !important;
  padding: 8px 16px !important;
  border-top: 1px solid #F3F4F6 !important;
}

.p-paginator .p-paginator-page.p-highlight {
  background: #0107A3 !important;
  color: white !important;
  border-color: #0107A3 !important;
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
}

/* Sort icon color */
.p-datatable .p-sortable-column .p-sortable-column-icon {
  color: #9CA3AF !important;
}
.p-datatable .p-sortable-column:hover .p-sortable-column-icon {
  color: #0107A3 !important;
}

/* ─── Bottom nav safe area ────────────────────────────────────────────── */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add design tokens and PrimeReact DataTable CSS overrides"
```

---

## Task 3: StatusBadge and RoleBadge components

**Files:**
- Create: `components/status-badge.tsx`
- Create: `components/role-badge.tsx`

- [ ] **Step 1: Create components/status-badge.tsx**

```tsx
type MatchStatus = "DRAFT" | "SCHEDULED" | "CONCLUDED" | "PUBLISHED";

const CONFIG: Record<MatchStatus, { label: string; dot: string; bg: string; text: string }> = {
  DRAFT:     { label: "Bozza",        dot: "bg-gray-400",    bg: "bg-gray-100",   text: "text-gray-600"   },
  SCHEDULED: { label: "Programmata",  dot: "bg-blue-500",    bg: "bg-blue-50",    text: "text-blue-700"   },
  CONCLUDED: { label: "Conclusa",     dot: "bg-amber-500",   bg: "bg-amber-50",   text: "text-amber-700"  },
  PUBLISHED: { label: "Pubblicata",   dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = CONFIG[status as MatchStatus] ?? CONFIG.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
```

- [ ] **Step 2: Create components/role-badge.tsx**

```tsx
const CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  P: { label: "P", bg: "bg-green-100", text: "text-green-700" },
  A: { label: "A", bg: "bg-blue-100",  text: "text-blue-700"  },
};

export default function RoleBadge({ role }: { role: string }) {
  const cfg = CONFIG[role] ?? { label: role, bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/status-badge.tsx components/role-badge.tsx
git commit -m "feat: add StatusBadge and RoleBadge shared components"
```

---

## Task 4: StatCard and AdminPageHeader components

**Files:**
- Create: `components/stat-card.tsx`
- Create: `components/admin-page-header.tsx`

- [ ] **Step 1: Create components/stat-card.tsx**

```tsx
import Link from "next/link";

interface Props {
  value: number;
  label: string;
  href: string;
  icon: string;
}

export default function StatCard({ value, label, href, icon }: Props) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-4 flex items-start justify-between hover:shadow-md hover:-translate-y-px transition-all duration-150"
    >
      <div>
        <div className="text-3xl font-bold text-[#0107A3]">{value}</div>
        <div className="text-xs font-medium text-[#6B7280] mt-1">{label}</div>
      </div>
      <div className="w-10 h-10 rounded-full bg-[#E8E9F8] flex items-center justify-center flex-shrink-0">
        <i className={`pi ${icon} text-[#0107A3] text-base`} />
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create components/admin-page-header.tsx**

```tsx
import Link from "next/link";

interface Props {
  title: string;
  cta?: { href: string; label: string };
  backHref?: string;
}

export default function AdminPageHeader({ title, cta, backHref }: Props) {
  return (
    <div className="mb-6">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] mb-3 transition-colors"
        >
          <i className="pi pi-arrow-left text-xs" />
          Torna indietro
        </Link>
      )}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[22px] font-bold text-[#111827]">{title}</h1>
        {cta && (
          <Link
            href={cta.href}
            className="bg-[#0107A3] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#0106c4] transition-colors flex items-center min-h-[36px] flex-shrink-0"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/stat-card.tsx components/admin-page-header.tsx
git commit -m "feat: add StatCard and AdminPageHeader shared components"
```

---

## Task 5: TopBar client component

**Files:**
- Create: `app/(admin)/admin/_top-bar.tsx`

- [ ] **Step 1: Create app/(admin)/admin/_top-bar.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin",             label: "Dashboard" },
  { href: "/admin/squadre",     label: "Squadre" },
  { href: "/admin/giocatori",   label: "Giocatori" },
  { href: "/admin/partite",     label: "Partite" },
  { href: "/admin/bonus-types", label: "Tipi bonus" },
  { href: "/admin/utenti",      label: "Utenti" },
  { href: "/admin/squadre-fantasy", label: "Squadre fantasy" },
  { href: "/admin/audit",       label: "Audit" },
];

export default function TopBar({ initials }: { initials: string }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] shadow-sm h-14 flex items-center px-4 md:px-6">
      <div className="flex items-center gap-4 w-full max-w-screen-xl mx-auto">
        {/* Logo */}
        <Link
          href="/admin"
          className="font-bold text-[#0107A3] text-sm tracking-wide flex-shrink-0 flex items-center gap-1.5"
        >
          <i className="pi pi-circle-fill text-xs" />
          fantadc admin
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-[#E8E9F8] text-[#0107A3]"
                    : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8F9FC]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Avatar */}
        <div className="ml-auto w-8 h-8 rounded-full bg-[#0107A3] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {initials}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(admin)/admin/_top-bar.tsx"
git commit -m "feat: add admin TopBar client component"
```

---

## Task 6: BottomNav client component

**Files:**
- Create: `app/(admin)/admin/_bottom-nav.tsx`

- [ ] **Step 1: Create app/(admin)/admin/_bottom-nav.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const MAIN_NAV = [
  { href: "/admin",           label: "Dashboard", icon: "pi-home"     },
  { href: "/admin/partite",   label: "Partite",   icon: "pi-calendar" },
  { href: "/admin/giocatori", label: "Giocatori", icon: "pi-users"    },
  { href: "/admin/squadre",   label: "Squadre",   icon: "pi-shield"   },
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
      {/* Overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More drawer */}
      {moreOpen && (
        <div className="fixed bottom-[64px] left-0 right-0 bg-white rounded-t-2xl shadow-lg border-t border-[#E5E7EB] z-50 md:hidden pb-safe">
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-sm font-semibold text-[#111827]">Altro</span>
            <button
              onClick={() => setMoreOpen(false)}
              className="text-[#6B7280] p-1"
              aria-label="Chiudi"
            >
              <i className="pi pi-times text-sm" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1 px-3 pb-4">
            {MORE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-[#E8E9F8] text-[#0107A3]"
                    : "text-[#374151] hover:bg-[#F8F9FC]"
                }`}
              >
                <i className={`pi ${item.icon} text-base`} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] z-40 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex h-16">
          {MAIN_NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <div className="relative flex flex-col items-center">
                  {active && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#0107A3]" />
                  )}
                  <i
                    className={`pi ${item.icon} text-xl ${
                      active ? "text-[#0107A3]" : "text-[#9CA3AF]"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    active ? "text-[#0107A3]" : "text-[#9CA3AF]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Altro */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
          >
            <i
              className={`pi pi-ellipsis-h text-xl ${
                moreIsActive || moreOpen ? "text-[#0107A3]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[10px] font-medium ${
                moreIsActive || moreOpen ? "text-[#0107A3]" : "text-[#9CA3AF]"
              }`}
            >
              Altro
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(admin)/admin/_bottom-nav.tsx"
git commit -m "feat: add admin BottomNav client component with More drawer"
```

---

## Task 7: Admin layout.tsx redesign

**Files:**
- Modify: `app/(admin)/admin/layout.tsx`

- [ ] **Step 1: Replace app/(admin)/admin/layout.tsx**

```tsx
import { requireAdmin } from "@/lib/session";
import TopBar from "./_top-bar";
import BottomNav from "./_bottom-nav";

export default async function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const initials = ((user.name ?? user.email) || "A").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <TopBar initials={initials} />
      <main className="max-w-screen-xl mx-auto w-full px-4 md:px-6 py-4 md:py-6 pb-24 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Quick smoke test**

Run the dev server and open `http://localhost:3000/admin`. Verify:
- Top bar appears with logo and nav links on desktop
- Page background is `#F8F9FC` (light gray-blue)
- Bottom nav appears on mobile viewport (375px width in DevTools)

- [ ] **Step 4: Commit**

```bash
git add "app/(admin)/admin/layout.tsx"
git commit -m "feat: redesign admin layout with TopBar and BottomNav"
```

---

## Task 8: Dashboard page redesign

**Files:**
- Modify: `app/(admin)/admin/page.tsx`

- [ ] **Step 1: Replace app/(admin)/admin/page.tsx**

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import StatCard from "@/components/stat-card";

export default async function AdminDashboardPage() {
  const [teams, players, matches, users, fantasyTeams, concludedNoPlayers, usersNoTeam] =
    await Promise.all([
      db.footballTeam.count(),
      db.player.count(),
      db.match.count(),
      db.user.count(),
      db.fantasyTeam.count(),
      db.match.findMany({
        where: {
          status: { in: ["CONCLUDED", "PUBLISHED"] },
          players: { none: {} },
        },
        select: {
          id: true,
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
          status: true,
        },
        orderBy: { startsAt: "desc" },
      }),
      db.user.count({ where: { fantasyTeam: null } }),
    ]);

  const stats = [
    { label: "Squadre reali",    value: teams,        href: "/admin/squadre",          icon: "pi-shield"   },
    { label: "Giocatori",        value: players,      href: "/admin/giocatori",         icon: "pi-users"    },
    { label: "Partite",          value: matches,      href: "/admin/partite",           icon: "pi-calendar" },
    { label: "Utenti",           value: users,        href: "/admin/utenti",            icon: "pi-id-card"  },
    { label: "Squadre fantasy",  value: fantasyTeams, href: "/admin/squadre-fantasy",   icon: "pi-trophy"   },
  ];

  const hasAnomalies = concludedNoPlayers.length > 0 || usersNoTeam > 0;

  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-[#111827]">Dashboard</h1>
        <span className="text-sm text-[#6B7280] capitalize hidden sm:block">{today}</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <StatCard key={s.href} value={s.value} label={s.label} href={s.href} icon={s.icon} />
        ))}
      </div>

      {/* Anomalie / Tutto ok */}
      {hasAnomalies ? (
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#111827] mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Da verificare
          </h2>
          <div className="flex flex-col gap-3">
            {concludedNoPlayers.map((m) => (
              <div
                key={m.id}
                className="bg-[#FFFBEB] border border-amber-200 border-l-[3px] border-l-amber-500 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-medium text-[#111827]">
                    {m.homeTeam.name} vs {m.awayTeam.name}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {m.status === "CONCLUDED"
                      ? "Partita conclusa senza giocatori — aggiungi i partecipanti prima di pubblicare"
                      : "Partita pubblicata senza giocatori — i punteggi non saranno calcolati"}
                  </p>
                </div>
                <Link
                  href={`/admin/partite/${m.id}`}
                  className="text-xs font-medium text-[#0107A3] hover:underline flex-shrink-0"
                >
                  Gestisci →
                </Link>
              </div>
            ))}

            {usersNoTeam > 0 && (
              <div className="bg-[#EFF6FF] border border-blue-200 border-l-[3px] border-l-blue-500 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                <p className="text-sm text-[#111827]">
                  <span className="font-bold">{usersNoTeam}</span>{" "}
                  {usersNoTeam === 1
                    ? "utente registrato senza squadra fantasy"
                    : "utenti registrati senza squadra fantasy"}
                </p>
                <Link
                  href="/admin/utenti"
                  className="text-xs font-medium text-[#0107A3] hover:underline flex-shrink-0"
                >
                  Vedi utenti →
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5 text-sm font-medium w-fit">
          <i className="pi pi-check-circle text-sm" />
          Tutto ok
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(admin)/admin/page.tsx"
git commit -m "feat: redesign admin dashboard with StatCard components"
```

---

## Task 9: Partite table

**Files:**
- Modify: `app/(admin)/admin/partite/_table.tsx`

- [ ] **Step 1: Replace app/(admin)/admin/partite/_table.tsx**

```tsx
"use client";

import Link from "next/link";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { deleteMatch } from "@/app/actions/admin/matches";
import ConfirmDeleteForm from "@/components/confirm-delete-form";
import StatusBadge from "@/components/status-badge";

type Row = {
  id: number;
  status: string;
  startsAt: Date;
  homeTeam: { name: string };
  awayTeam: { name: string };
  _count: { players: number };
};

export default function PartiteTable({ rows }: { rows: Row[] }) {
  return (
    <div className="admin-card overflow-hidden">
      <DataTable
        value={rows}
        stripedRows
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
      >
        <Column
          header="Partita"
          body={(row: Row) => {
            const isAnomaly =
              (row.status === "CONCLUDED" || row.status === "PUBLISHED") &&
              row._count.players === 0;
            return (
              <span className="font-medium text-[#111827]">
                {row.homeTeam.name} vs {row.awayTeam.name}
                {isAnomaly && (
                  <span className="ml-2 text-xs text-amber-600">⚠ no giocatori</span>
                )}
              </span>
            );
          }}
          sortable
          sortField="homeTeam.name"
        />
        <Column
          header="Data"
          body={(row: Row) => (
            <span className="text-[#6B7280]">
              {new Date(row.startsAt).toLocaleDateString("it-IT")}
            </span>
          )}
          sortable
          sortField="startsAt"
          className="hidden md:table-cell"
          headerClassName="hidden md:table-cell"
        />
        <Column
          header="Stato"
          body={(row: Row) => <StatusBadge status={row.status} />}
          sortable
          sortField="status"
        />
        <Column
          header="Gioc."
          body={(row: Row) => (
            <span className="text-[#6B7280] tabular-nums">{row._count.players}</span>
          )}
          sortable
          sortField="_count.players"
          className="hidden md:table-cell text-right"
          headerClassName="hidden md:table-cell"
        />
        <Column
          header=""
          body={(row: Row) => (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/partite/${row.id}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#0107A3] hover:bg-[#E8E9F8] transition-colors"
                title="Gestisci"
              >
                <i className="pi pi-pencil text-sm" />
              </Link>
              <ConfirmDeleteForm
                action={deleteMatch}
                hiddenInputs={{ id: row.id }}
                confirmMessage="Eliminare la partita? L'operazione è irreversibile."
              />
            </div>
          )}
        />
      </DataTable>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(admin)/admin/partite/_table.tsx"
git commit -m "style: redesign partite table with StatusBadge and responsive columns"
```

---

## Task 10: Giocatori table

**Files:**
- Modify: `app/(admin)/admin/giocatori/_table.tsx`

- [ ] **Step 1: Replace app/(admin)/admin/giocatori/_table.tsx**

```tsx
"use client";

import Link from "next/link";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { deletePlayer } from "@/app/actions/admin/players";
import ConfirmDeleteForm from "@/components/confirm-delete-form";
import RoleBadge from "@/components/role-badge";

type Row = { id: number; name: string; role: string; footballTeam: { name: string } };

export default function GiocatoriTable({ rows }: { rows: Row[] }) {
  return (
    <div className="admin-card overflow-hidden">
      <DataTable value={rows} stripedRows paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
        <Column
          header="Nome"
          body={(row: Row) => (
            <span className="font-medium text-[#111827]">{row.name}</span>
          )}
          field="name"
          sortable
        />
        <Column
          header="Ruolo"
          body={(row: Row) => <RoleBadge role={row.role} />}
          sortable
          sortField="role"
          className="hidden md:table-cell"
          headerClassName="hidden md:table-cell"
        />
        <Column
          header="Squadra"
          body={(row: Row) => (
            <span className="text-[#6B7280]">{row.footballTeam.name}</span>
          )}
          sortable
          sortField="footballTeam.name"
        />
        <Column
          header=""
          body={(row: Row) => (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/giocatori/${row.id}/edit`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#0107A3] hover:bg-[#E8E9F8] transition-colors"
                title="Modifica"
              >
                <i className="pi pi-pencil text-sm" />
              </Link>
              <ConfirmDeleteForm
                action={deletePlayer}
                hiddenInputs={{ id: row.id }}
                confirmMessage="Eliminare il giocatore?"
              />
            </div>
          )}
        />
      </DataTable>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(admin)/admin/giocatori/_table.tsx"
git commit -m "style: redesign giocatori table with RoleBadge and responsive columns"
```

---

## Task 11: Remaining tables

**Files:**
- Modify: `app/(admin)/admin/squadre/_table.tsx`
- Modify: `app/(admin)/admin/utenti/_table.tsx`
- Modify: `app/(admin)/admin/bonus-types/_table.tsx`
- Modify: `app/(admin)/admin/squadre-fantasy/_table.tsx`

- [ ] **Step 1: Read current content of each table**

Read all four files to understand their current columns before modifying.

- [ ] **Step 2: Update squadre/_table.tsx — wrap in admin-card**

Replace the top-level `<DataTable>` with a wrapped version. Add `admin-card overflow-hidden` wrapper div. Change action column to use icon button like in Task 9:

```tsx
"use client";

import Link from "next/link";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { deleteFootballTeam } from "@/app/actions/admin/football-teams";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

type Row = { id: number; name: string; shortName: string | null };

export default function SquadreTable({ rows }: { rows: Row[] }) {
  return (
    <div className="admin-card overflow-hidden">
      <DataTable value={rows} stripedRows paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
        <Column
          field="name"
          header="Nome"
          sortable
          body={(row: Row) => (
            <span className="font-medium text-[#111827]">{row.name}</span>
          )}
        />
        <Column
          field="shortName"
          header="Abbrev."
          sortable
          body={(row: Row) => (
            <span className="text-[#6B7280]">{row.shortName ?? "—"}</span>
          )}
          className="hidden md:table-cell"
          headerClassName="hidden md:table-cell"
        />
        <Column
          header=""
          body={(row: Row) => (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/squadre/${row.id}/edit`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#0107A3] hover:bg-[#E8E9F8] transition-colors"
                title="Modifica"
              >
                <i className="pi pi-pencil text-sm" />
              </Link>
              <ConfirmDeleteForm
                action={deleteFootballTeam}
                hiddenInputs={{ id: row.id }}
                confirmMessage="Eliminare la squadra?"
              />
            </div>
          )}
        />
      </DataTable>
    </div>
  );
}
```

- [ ] **Step 3: Update utenti/_table.tsx — read first, then wrap in admin-card**

Read `app/(admin)/admin/utenti/_table.tsx`, then replace only the outer wrapper to add `admin-card overflow-hidden` div and update action column buttons to icon style (same pattern as above). Keep all existing columns.

- [ ] **Step 4: Update bonus-types/_table.tsx — wrap in admin-card**

Read `app/(admin)/admin/bonus-types/_table.tsx`, then replace outer wrapper to add `admin-card overflow-hidden` div. Keep all existing columns.

- [ ] **Step 5: Update squadre-fantasy/_table.tsx — wrap in admin-card**

Read `app/(admin)/admin/squadre-fantasy/_table.tsx`, then replace outer wrapper to add `admin-card overflow-hidden` div. Keep all existing columns.

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add "app/(admin)/admin/squadre/_table.tsx" "app/(admin)/admin/utenti/_table.tsx" "app/(admin)/admin/bonus-types/_table.tsx" "app/(admin)/admin/squadre-fantasy/_table.tsx"
git commit -m "style: wrap remaining admin tables in admin-card"
```

---

## Task 12: List page headers

**Files:**
- Modify: `app/(admin)/admin/partite/page.tsx`
- Modify: `app/(admin)/admin/giocatori/page.tsx`
- Modify: `app/(admin)/admin/squadre/page.tsx`
- Modify: `app/(admin)/admin/bonus-types/page.tsx`
- Modify: `app/(admin)/admin/utenti/page.tsx`
- Modify: `app/(admin)/admin/squadre-fantasy/page.tsx`

- [ ] **Step 1: Update partite/page.tsx**

Replace the header div with `AdminPageHeader`. Keep the data fetching identical:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import PartiteTable from "./_table";
import AdminPageHeader from "@/components/admin-page-header";

export default async function PartitePage() {
  const matches = await db.match.findMany({
    orderBy: { startsAt: "desc" },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      _count: { select: { players: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader
        title="Partite"
        cta={{ href: "/admin/partite/new", label: "+ Nuova partita" }}
      />
      <PartiteTable rows={matches} />
    </div>
  );
}
```

- [ ] **Step 2: Update giocatori/page.tsx**

```tsx
import { db } from "@/lib/db";
import GiocatoriTable from "./_table";
import AdminPageHeader from "@/components/admin-page-header";

export default async function GiocatoriPage() {
  const players = await db.player.findMany({
    orderBy: [{ footballTeam: { name: "asc" } }, { name: "asc" }],
    include: { footballTeam: { select: { name: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="Giocatori"
        cta={{ href: "/admin/giocatori/new", label: "+ Nuovo giocatore" }}
      />
      <GiocatoriTable rows={players} />
    </div>
  );
}
```

- [ ] **Step 3: Update squadre/page.tsx**

```tsx
import { db } from "@/lib/db";
import SquadreTable from "./_table";
import AdminPageHeader from "@/components/admin-page-header";

export default async function SquadrePage() {
  const teams = await db.footballTeam.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <AdminPageHeader
        title="Squadre reali"
        cta={{ href: "/admin/squadre/new", label: "+ Nuova squadra" }}
      />
      <SquadreTable rows={teams} />
    </div>
  );
}
```

- [ ] **Step 4: Update bonus-types/page.tsx, utenti/page.tsx, squadre-fantasy/page.tsx**

Read each file, then replace the `<h1>` and outer wrapper with `AdminPageHeader` (no CTA for bonus-types since it has inline form). Keep all existing data-fetching and sub-components.

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add "app/(admin)/admin/partite/page.tsx" "app/(admin)/admin/giocatori/page.tsx" "app/(admin)/admin/squadre/page.tsx" "app/(admin)/admin/bonus-types/page.tsx" "app/(admin)/admin/utenti/page.tsx" "app/(admin)/admin/squadre-fantasy/page.tsx"
git commit -m "style: use AdminPageHeader in all list pages"
```

---

## Task 13: Match detail page — header card + status section

**Files:**
- Modify: `app/(admin)/admin/partite/[id]/page.tsx`
- Modify: `app/(admin)/admin/partite/[id]/_status-actions.tsx`

- [ ] **Step 1: Update _status-actions.tsx — replace Tag with StatusBadge, style buttons as pills**

```tsx
"use client";

import { useRef } from "react";
import { useActionState } from "react";
import { Button } from "primereact/button";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import StatusBadge from "@/components/status-badge";
import { advanceMatchStatus } from "@/app/actions/admin/matches";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
  PUBLISHED: "Pubblicata",
};

type NextAction = {
  label: string;
  newStatus: string;
  severity: "info" | "warning" | "success" | "secondary";
  confirmMsg: string;
};

const NEXT_ACTIONS: Record<string, NextAction[]> = {
  DRAFT: [
    { label: "Pianifica →", newStatus: "SCHEDULED", severity: "info",
      confirmMsg: "Segnare la partita come programmata?" },
  ],
  SCHEDULED: [
    { label: "Concludi partita", newStatus: "CONCLUDED", severity: "warning",
      confirmMsg: "Segnare la partita come conclusa? Si aprirà la finestra di voto MVP (1 ora)." },
  ],
  CONCLUDED: [
    { label: "Pubblica risultati", newStatus: "PUBLISHED", severity: "success",
      confirmMsg: "Pubblicare i risultati? I punteggi diventeranno visibili a tutti." },
  ],
  PUBLISHED: [],
};

const BACK_ACTIONS: Record<string, { label: string; newStatus: string }> = {
  SCHEDULED: { label: "← Bozza",       newStatus: "DRAFT"      },
  CONCLUDED: { label: "← Programmata", newStatus: "SCHEDULED"  },
  PUBLISHED: { label: "← Conclusa",    newStatus: "CONCLUDED"  },
};

export default function StatusActions({
  matchId,
  status,
  playerCount,
}: {
  matchId: number;
  status: string;
  playerCount: number;
}) {
  const [state, action, pending] = useActionState(advanceMatchStatus, undefined);
  const formRefs = useRef<Map<string, HTMLFormElement>>(new Map());

  const nextActions = NEXT_ACTIONS[status] ?? [];
  const backAction = BACK_ACTIONS[status];

  const handleNextAction = (e: React.MouseEvent<HTMLButtonElement>, act: NextAction) => {
    confirmPopup({
      target: e.currentTarget,
      message: act.confirmMsg,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì",
      rejectLabel: "No",
      accept: () => formRefs.current.get(act.newStatus)?.requestSubmit(),
    });
  };

  const handleBackAction = (e: React.MouseEvent<HTMLButtonElement>, newStatus: string) => {
    confirmPopup({
      target: e.currentTarget,
      message: `Ripristinare lo stato a "${STATUS_LABEL[newStatus] ?? newStatus}"?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì",
      rejectLabel: "No",
      accept: () => formRefs.current.get(`back_${newStatus}`)?.requestSubmit(),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <ConfirmPopup />
      <div className="flex items-center gap-2 flex-wrap overflow-x-auto">
        <StatusBadge status={status} />

        {nextActions.map((act) => (
          <form
            key={act.newStatus}
            action={action}
            ref={(el) => { if (el) formRefs.current.set(act.newStatus, el); }}
          >
            <input type="hidden" name="matchId" value={matchId} />
            <input type="hidden" name="newStatus" value={act.newStatus} />
            <Button
              type="button"
              label={pending ? "..." : act.label}
              severity={act.severity}
              size="small"
              disabled={pending}
              onClick={(e) => handleNextAction(e, act)}
            />
          </form>
        ))}

        {backAction && (
          <form
            action={action}
            ref={(el) => { if (el) formRefs.current.set(`back_${backAction.newStatus}`, el); }}
          >
            <input type="hidden" name="matchId" value={matchId} />
            <input type="hidden" name="newStatus" value={backAction.newStatus} />
            <Button
              type="button"
              label={backAction.label}
              severity="secondary"
              text
              size="small"
              disabled={pending}
              onClick={(e) => handleBackAction(e, backAction.newStatus)}
            />
          </form>
        )}
      </div>

      {state?.message && (
        <p className="text-red-500 text-sm">{state.message}</p>
      )}

      {status === "CONCLUDED" && playerCount === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm text-amber-700">
          ⚠ Nessun giocatore aggiunto — aggiungi i partecipanti prima di pubblicare.
        </div>
      )}

      {status === "PUBLISHED" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700">
          ℹ I punteggi sono pubblici. Qualsiasi modifica si rifletterà immediatamente sulla classifica.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update partite/[id]/page.tsx — add header card, AdminPageHeader, layout**

```tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { addAllMatchPlayers } from "@/app/actions/admin/match-players";
import { Button } from "primereact/button";
import AdminPageHeader from "@/components/admin-page-header";
import EditMatchForm from "./_edit-form";
import AddMatchPlayerForm from "./_add-player-form";
import PlayerBonusCard from "./_player-bonus-card";
import StatusActions from "./_status-actions";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
  PUBLISHED: "Pubblicata",
};

export default async function PartitaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matchId = Number(id);

  const [match, teams, bonusTypes, allPlayers, matchBonuses] = await Promise.all([
    db.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        players: {
          include: {
            player: { include: { footballTeam: { select: { name: true } } } },
          },
        },
      },
    }),
    db.footballTeam.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.bonusType.findMany({ orderBy: { code: "asc" } }),
    db.player.findMany({ orderBy: { name: "asc" }, include: { footballTeam: { select: { name: true } } } }),
    db.playerMatchBonus.findMany({
      where: { matchId },
      include: { bonusType: true },
      orderBy: { id: "asc" },
    }),
  ]);

  if (!match) notFound();

  const participantIds = new Set(match.players.map((mp) => mp.playerId));
  const eligibleTeamIds = new Set([match.homeTeamId, match.awayTeamId]);
  const availablePlayers = allPlayers.filter(
    (p) => eligibleTeamIds.has(p.footballTeamId) && !participantIds.has(p.id)
  );
  const allEligibleCount = allPlayers.filter((p) => eligibleTeamIds.has(p.footballTeamId)).length;

  const bonusesByPlayer = new Map<number, typeof matchBonuses>();
  for (const b of matchBonuses) {
    const arr = bonusesByPlayer.get(b.playerId) ?? [];
    arr.push(b);
    bonusesByPlayer.set(b.playerId, arr);
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Dettaglio partita" backHref="/admin/partite" />

      {/* Header card — navy gradient */}
      <div
        className="rounded-2xl overflow-hidden p-5 flex items-start justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #0107A3 0%, #0106c4 100%)" }}
      >
        <div>
          <h2 className="text-xl font-bold text-white">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </h2>
          <p className="text-sm text-white/70 mt-1">
            {match.startsAt.toLocaleString("it-IT")}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#F5C518] text-[#111827] flex-shrink-0 mt-0.5">
          {STATUS_LABEL[match.status] ?? match.status}
        </span>
      </div>

      {/* Status actions */}
      <div className="admin-card p-4">
        <StatusActions
          matchId={matchId}
          status={match.status}
          playerCount={match.players.length}
        />
      </div>

      {/* Edit form — collapsible */}
      <details className="admin-card overflow-hidden">
        <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-medium text-[#6B7280] hover:text-[#111827] select-none list-none border-b border-[#E5E7EB] [&::-webkit-details-marker]:hidden">
          <i className="pi pi-pencil text-xs" />
          Modifica dati partita
          <i className="pi pi-chevron-down text-xs ml-auto" />
        </summary>
        <div className="p-4">
          <EditMatchForm match={match} teams={teams} />
        </div>
      </details>

      {/* Participants */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#111827]">
            Partecipanti ({match.players.length}
            {allEligibleCount > 0 ? `/${allEligibleCount}` : ""})
          </h2>
          {availablePlayers.length > 0 && (
            <form action={addAllMatchPlayers as unknown as (fd: FormData) => void}>
              <input type="hidden" name="matchId" value={matchId} />
              <button
                type="submit"
                className="text-xs font-medium text-[#0107A3] hover:underline"
              >
                + Aggiungi tutti ({availablePlayers.length})
              </button>
            </form>
          )}
        </div>

        {match.players.length === 0 && (
          <p className="text-sm text-[#9CA3AF] mb-4">Nessun partecipante aggiunto.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          {match.players.map(({ player }) => (
            <PlayerBonusCard
              key={player.id}
              matchId={matchId}
              player={player}
              bonuses={(bonusesByPlayer.get(player.id) ?? []).map((b) => ({
                ...b,
                points: Number(b.points),
              }))}
              bonusTypes={bonusTypes.map((bt) => ({ ...bt, points: Number(bt.points) }))}
            />
          ))}
        </div>

        {availablePlayers.length > 0 && (
          <AddMatchPlayerForm matchId={matchId} availablePlayers={availablePlayers} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(admin)/admin/partite/[id]/page.tsx" "app/(admin)/admin/partite/[id]/_status-actions.tsx"
git commit -m "feat: redesign match detail page with navy header card"
```

---

## Task 14: Player bonus card redesign

**Files:**
- Modify: `app/(admin)/admin/partite/[id]/_player-bonus-card.tsx`

- [ ] **Step 1: Replace _player-bonus-card.tsx**

```tsx
"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { assignBonus, deleteBonus } from "@/app/actions/admin/bonuses";
import { removeMatchPlayer } from "@/app/actions/admin/match-players";
import RoleBadge from "@/components/role-badge";

type Bonus = { id: number; bonusType: { code: string }; quantity: number; points: number };
type BonusType = { id: number; code: string; name: string; points: number };

interface Props {
  matchId: number;
  player: { id: number; name: string; role: string; footballTeam: { name: string } };
  bonuses: Bonus[];
  bonusTypes: BonusType[];
}

export default function PlayerBonusCard({ matchId, player, bonuses, bonusTypes }: Props) {
  const [visible, setVisible] = useState(false);
  const [selectedBonusType, setSelectedBonusType] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [state, action, pending] = useActionState(assignBonus, undefined);
  const removeFormRef = useRef<HTMLFormElement>(null);

  const roleColor = player.role === "P" ? "#10B981" : "#3B82F6";

  const bonusTypeOptions = bonusTypes.map((bt) => ({
    label: `${bt.code} — ${bt.name} (${bt.points > 0 ? "+" : ""}${bt.points}pt)`,
    value: String(bt.id),
  }));

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    confirmPopup({
      target: e.currentTarget,
      message: `Rimuovere ${player.name} dalla partita?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì",
      rejectLabel: "No",
      accept: () => removeFormRef.current?.requestSubmit(),
    });
  };

  return (
    <>
      <ConfirmPopup />

      {/* Hidden remove form */}
      <form
        ref={removeFormRef}
        action={removeMatchPlayer as unknown as (fd: FormData) => void}
        className="hidden"
      >
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="playerId" value={player.id} />
      </form>

      {/* Card */}
      <div
        className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-3 relative cursor-pointer hover:shadow-md hover:-translate-y-px transition-all duration-150 select-none"
        style={{ borderLeft: `3px solid ${roleColor}` }}
        onClick={() => setVisible(true)}
      >
        {/* Remove button */}
        <button
          type="button"
          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
          onClick={handleRemoveClick}
          title="Rimuovi dalla partita"
        >
          <i className="pi pi-times text-xs" />
        </button>

        {/* Name + role badge */}
        <div className="flex items-center gap-1.5 mb-1 pr-5">
          <RoleBadge role={player.role} />
          <span className="text-sm font-semibold text-[#111827] truncate">{player.name}</span>
        </div>
        <p className="text-xs text-[#6B7280]">{player.footballTeam.name}</p>

        {/* Bonus chips */}
        {bonuses.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {bonuses.map((b) => (
              <span
                key={b.id}
                className="bg-[#F3F4F6] text-[#374151] rounded-full px-2 py-0.5 text-xs"
              >
                {b.bonusType.code}
                {b.quantity > 1 ? ` ×${b.quantity}` : ""}{" "}
                {b.points > 0 ? "+" : ""}{b.points}pt
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#9CA3AF] mt-1 flex items-center gap-1">
            <i className="pi pi-plus-circle text-xs" />
            Tocca per bonus
          </p>
        )}
      </div>

      {/* Dialog */}
      <Dialog
        visible={visible}
        onHide={() => setVisible(false)}
        header={
          <div className="flex items-center gap-2">
            <RoleBadge role={player.role} />
            <span className="text-base font-semibold">{player.name}</span>
          </div>
        }
        style={{ width: "min(24rem, 95vw)" }}
        modal
        draggable={false}
      >
        <p className="text-xs text-[#6B7280] mb-4">{player.footballTeam.name}</p>

        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="matchId" value={matchId} />
          <input type="hidden" name="playerId" value={player.id} />
          <div>
            <label className="block text-xs font-medium mb-1 text-[#6B7280]">Tipo bonus</label>
            <input type="hidden" name="bonusTypeId" value={selectedBonusType} />
            <Dropdown
              value={selectedBonusType}
              onChange={(e) => setSelectedBonusType(e.value)}
              options={bonusTypeOptions}
              placeholder="Seleziona..."
              className="w-full"
            />
            {state?.errors?.bonusTypeId && (
              <p className="text-red-500 text-xs mt-1">{state.errors.bonusTypeId[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[#6B7280]">Quantità</label>
            <input type="hidden" name="quantity" value={qty} />
            <InputNumber
              value={qty}
              onValueChange={(e) => setQty(e.value ?? 1)}
              min={1}
              max={10}
              showButtons
              className="w-full"
            />
          </div>
          {state?.message && <p className="text-red-500 text-xs">{state.message}</p>}
          <div className="flex gap-2 justify-end mt-1">
            <Button
              type="button"
              label="Chiudi"
              severity="secondary"
              size="small"
              onClick={() => setVisible(false)}
            />
            <Button
              type="submit"
              label={pending ? "..." : "+ Assegna"}
              size="small"
              disabled={pending}
            />
          </div>
        </form>

        {bonuses.length > 0 && (
          <div className="mt-4 border-t border-[#E5E7EB] pt-3">
            <p className="text-xs font-medium text-[#6B7280] mb-2">Bonus assegnati</p>
            <ul className="flex flex-col gap-1">
              {bonuses.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between text-xs bg-[#F8F9FC] px-2 py-1.5 rounded-lg"
                >
                  <span className="text-[#111827]">
                    {b.bonusType.code}
                    {b.quantity > 1 ? ` ×${b.quantity}` : ""}{" "}
                    <span className="text-[#6B7280]">
                      ({b.points > 0 ? "+" : ""}{b.points}pt)
                    </span>
                  </span>
                  <form
                    action={deleteBonus as unknown as (fd: FormData) => void}
                    className="inline"
                  >
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="matchId" value={matchId} />
                    <Button
                      type="submit"
                      icon="pi pi-times"
                      severity="danger"
                      text
                      size="small"
                      title="Rimuovi"
                    />
                  </form>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Dialog>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(admin)/admin/partite/[id]/_player-bonus-card.tsx"
git commit -m "feat: redesign player bonus card with role color, tap-to-open"
```

---

## Task 15: Form pages — card wrapper + AdminPageHeader + back link

**Files:**
- Modify: `app/(admin)/admin/giocatori/new/page.tsx`
- Modify: `app/(admin)/admin/giocatori/new/_form.tsx`
- Modify: `app/(admin)/admin/giocatori/[id]/edit/page.tsx`
- Modify: `app/(admin)/admin/giocatori/[id]/edit/_form.tsx`
- Modify: `app/(admin)/admin/squadre/new/page.tsx`
- Modify: `app/(admin)/admin/squadre/[id]/edit/page.tsx`
- Modify: `app/(admin)/admin/squadre/[id]/edit/_form.tsx`
- Modify: `app/(admin)/admin/partite/new/page.tsx`

- [ ] **Step 1: Read all form page files**

Read each file listed above to understand their current structure before modifying.

- [ ] **Step 2: Update giocatori/new/page.tsx**

```tsx
import { db } from "@/lib/db";
import NuovoGiocatoreForm from "./_form";
import AdminPageHeader from "@/components/admin-page-header";

export default async function NuovoGiocatorePage() {
  const teams = await db.footballTeam.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <AdminPageHeader title="Nuovo giocatore" backHref="/admin/giocatori" />
      <div className="admin-card p-5 max-w-lg">
        <NuovoGiocatoreForm teams={teams} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update giocatori/new/_form.tsx — remove inner title and max-w wrapper**

Remove the `<div className="max-w-md">` wrapper and the `<h1>` title (now handled by `AdminPageHeader`). Keep form contents identical.

- [ ] **Step 4: Update giocatori/[id]/edit/page.tsx**

Read the file first. It should be a server component that fetches player + teams data. Wrap with `AdminPageHeader` + card:

```tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import EditGiocatoreForm from "./_form";
import AdminPageHeader from "@/components/admin-page-header";

export default async function EditGiocatorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [player, teams] = await Promise.all([
    db.player.findUnique({ where: { id: Number(id) } }),
    db.footballTeam.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!player) notFound();
  return (
    <div>
      <AdminPageHeader title="Modifica giocatore" backHref="/admin/giocatori" />
      <div className="admin-card p-5 max-w-lg">
        <EditGiocatoreForm player={player} teams={teams} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update giocatori/[id]/edit/_form.tsx — remove inner title and max-w wrapper**

Remove `<div className="max-w-md">` and `<h1>` from the form component.

- [ ] **Step 6: Update squadre/new/page.tsx**

```tsx
import AdminPageHeader from "@/components/admin-page-header";
import NuovaSquadraForm from "./_form";

export default function NuovaSquadraPage() {
  return (
    <div>
      <AdminPageHeader title="Nuova squadra reale" backHref="/admin/squadre" />
      <div className="admin-card p-5 max-w-lg">
        <NuovaSquadraForm />
      </div>
    </div>
  );
}
```

Note: `squadre/new/page.tsx` is currently a `"use client"` component with the form inline. Extract the form to a `_form.tsx` client component first, then make the page a server component. See Step 7 below.

- [ ] **Step 7: Extract squadre/new into page.tsx (server) + _form.tsx (client)**

Create `app/(admin)/admin/squadre/new/_form.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { createFootballTeam } from "@/app/actions/admin/football-teams";

export default function NuovaSquadraForm() {
  const [state, action, pending] = useActionState(createFootballTeam, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1">Nome *</label>
        <InputText name="name" className="w-full" required />
        {state?.errors?.name && (
          <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>
        )}
      </div>
      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1">Abbreviazione</label>
        <InputText name="shortName" className="w-full" maxLength={5} />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1">Logo URL</label>
        <InputText name="logoUrl" type="url" className="w-full" />
        {state?.errors?.logoUrl && (
          <p className="text-red-500 text-xs mt-1">{state.errors.logoUrl[0]}</p>
        )}
      </div>
      {state?.message && <p className="text-red-500 text-xs">{state.message}</p>}
      <Button
        type="submit"
        label={pending ? "Salvo..." : "Crea squadra"}
        disabled={pending}
        className="w-full md:w-auto"
      />
    </form>
  );
}
```

Replace `app/(admin)/admin/squadre/new/page.tsx` with:

```tsx
import AdminPageHeader from "@/components/admin-page-header";
import NuovaSquadraForm from "./_form";

export default function NuovaSquadraPage() {
  return (
    <div>
      <AdminPageHeader title="Nuova squadra reale" backHref="/admin/squadre" />
      <div className="admin-card p-5 max-w-lg">
        <NuovaSquadraForm />
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Update squadre/[id]/edit with AdminPageHeader + card wrapper**

Read `app/(admin)/admin/squadre/[id]/edit/page.tsx` and `_form.tsx`. Wrap with `AdminPageHeader` + card. Remove inner title from `_form.tsx`.

- [ ] **Step 9: Update partite/new with AdminPageHeader + card wrapper**

Read `app/(admin)/admin/partite/new/page.tsx`. Add `AdminPageHeader` with `backHref="/admin/partite"`. Wrap form in `admin-card p-5`.

- [ ] **Step 10: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 11: Commit**

```bash
git add "app/(admin)/admin/"
git commit -m "style: add card wrapper and back link to all admin form pages"
```

---

## Task 16: Final verification and build

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 2: Production build**

```bash
npm run build
```

Expected: build completes successfully, no errors. Warnings about `img` elements or similar are acceptable.

- [ ] **Step 3: Visual check list**

Run `npm run dev`, open `http://localhost:3000/admin` and verify each page:

- [ ] Dashboard: stat cards in 2-col mobile grid, anomalie section with colored borders
- [ ] `/admin/partite`: table with StatusBadge dots, icon-only action buttons, responsive
- [ ] `/admin/giocatori`: table with RoleBadge circles, responsive
- [ ] `/admin/partite/[id]`: navy gradient header card, gold status badge, player grid 2-col mobile
- [ ] Mobile (375px in DevTools): bottom nav visible, 4 items + Altro, More drawer opens
- [ ] Desktop: bottom nav hidden, top bar shows all nav links with active highlight
- [ ] `/admin/giocatori/new`: card wrapper visible, back link works
- [ ] Player card: tap opens bonus dialog, X button removes with confirm

- [ ] **Step 4: Final commit**

```bash
git add .claude/ ai_context/.claude/
git commit -m "chore: update Claude session files after admin redesign"
```
