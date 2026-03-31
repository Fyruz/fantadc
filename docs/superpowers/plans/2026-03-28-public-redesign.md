# Public & User UI Redesign — Sports Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the same premium, mobile-first sports dashboard aesthetic from the admin redesign to all public (`/`) and user (`/dashboard`, `/squadra`, `/vota`) pages.

**Architecture:** New shared `PublicBottomNav` client component mirrors the admin bottom nav pattern. Existing `StatusBadge` and `RoleBadge` components replace inline badge styling. Design tokens from `globals.css` (already set) replace hardcoded colors. PrimeReact `Button` and `InputText` replace raw HTML elements in forms.

**Tech Stack:** Next.js 15 App Router, TypeScript, PrimeReact 10, Tailwind CSS v4

**Design Tokens (already in globals.css):**
- `--primary: #0107A3` (navy)
- `--primary-light: #E8E9F8`
- `--gold: #F5C518`
- `--bg: #F8F9FC`
- `--border: #E5E7EB`
- `--text-secondary: #6B7280`
- `.admin-card` = `bg-white rounded-2xl shadow-sm border border-[#E5E7EB]`

---

## File Map

**New files:**
- `components/public-bottom-nav.tsx` — mobile bottom nav for public/user layouts (client)

**Modified files:**
- `components/public-nav.tsx` — hide nav links on mobile (md:hidden)
- `app/(public)/layout.tsx` — add bottom nav + pb-20 mobile clearance
- `app/(user)/layout.tsx` — add bottom nav + pb-20 mobile clearance
- `app/(public)/login/page.tsx` — card wrapper + label styling
- `app/(public)/register/page.tsx` — card wrapper + label styling
- `app/(public)/classifica/page.tsx` — styled table with design tokens
- `app/(public)/partite/page.tsx` — StatusBadge + admin-card wrapper
- `app/(public)/partite/[id]/page.tsx` — navy header card + StatusBadge + card sections
- `app/(public)/giocatori/page.tsx` — RoleBadge + card pattern
- `app/(public)/squadre/page.tsx` — admin-card wrapper
- `app/(public)/squadre-fantasy/page.tsx` — admin-card wrapper
- `app/(public)/squadre-fantasy/[id]/page.tsx` — role-colored player card borders
- `app/(public)/regolamento/page.tsx` — card wrapper + section headers
- `app/(user)/dashboard/page.tsx` — admin-card sections
- `app/(user)/squadra/page.tsx` — admin-card sections + PlayerCard improvement
- `app/(user)/squadra/crea/_form.tsx` — InputText + PrimeReact Button for submit
- `app/(user)/vota/[id]/page.tsx` — card sections
- `app/(user)/vota/[id]/_vote-form.tsx` — updated button styling

---

## Task 1: Public mobile bottom nav + layout updates

**Files:**
- Create: `components/public-bottom-nav.tsx`
- Modify: `components/public-nav.tsx`
- Modify: `app/(public)/layout.tsx`
- Modify: `app/(user)/layout.tsx`

- [ ] **Step 1: Create `components/public-bottom-nav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const MAIN_NAV = [
  { href: "/partite", label: "Partite", icon: "pi-calendar" },
  { href: "/classifica", label: "Classifica", icon: "pi-list" },
  { href: "/squadre-fantasy", label: "Fantasy", icon: "pi-shield" },
  { href: "/dashboard", label: "Il mio", icon: "pi-user" },
];

const MORE_NAV = [
  { href: "/giocatori", label: "Giocatori" },
  { href: "/squadre", label: "Squadre reali" },
  { href: "/regolamento", label: "Regolamento" },
];

export default function PublicBottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Bottom nav bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] pb-safe">
        <div className="flex items-stretch h-16">
          {MAIN_NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                  active ? "text-[#0107A3]" : "text-[#9CA3AF]"
                }`}
              >
                <i
                  className={`pi ${item.icon} text-base`}
                  style={{ color: active ? "#0107A3" : undefined }}
                />
                {item.label}
                {active && (
                  <span className="absolute top-0 left-0 right-0 h-0.5 bg-[#0107A3]" />
                )}
              </Link>
            );
          })}

          {/* Altro button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-[#9CA3AF]"
          >
            <i className="pi pi-ellipsis-h text-base" />
            Altro
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl transition-transform duration-300 pb-safe ${
          drawerOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
        </div>
        <div className="px-4 pb-6 flex flex-col gap-1">
          {MORE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F8F9FC] text-sm font-medium text-[#111827]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Update `components/public-nav.tsx` — hide nav links on mobile**

Find the `<nav>` or `<div>` containing the NAV_LINKS map. Add `hidden md:flex` to that element so links are invisible on mobile (bottom nav takes over).

The links section currently renders like:
```tsx
<div className="flex gap-1 flex-wrap">
  {NAV_LINKS.map(...)}
</div>
```

Change to:
```tsx
<div className="hidden md:flex gap-1 flex-wrap">
  {NAV_LINKS.map(...)}
</div>
```

- [ ] **Step 3: Update `app/(public)/layout.tsx`**

```tsx
import PublicNav from "@/components/public-nav";
import PublicBottomNav from "@/components/public-bottom-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC]">
      <PublicNav />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24 md:pb-8">{children}</main>
      <footer className="hidden md:block border-t py-4 text-center text-xs text-zinc-400">
        Fantadc — Torneo di paese
      </footer>
      <PublicBottomNav />
    </div>
  );
}
```

- [ ] **Step 4: Update `app/(user)/layout.tsx`**

```tsx
import PublicNav from "@/components/public-nav";
import PublicBottomNav from "@/components/public-bottom-nav";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC]">
      <PublicNav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-24 md:pb-8">{children}</main>
      <PublicBottomNav />
    </div>
  );
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/public-bottom-nav.tsx components/public-nav.tsx "app/(public)/layout.tsx" "app/(user)/layout.tsx"
git commit -m "feat: add mobile bottom nav to public and user layouts"
```

---

## Task 2: Login + Register card styling

**Files:**
- Modify: `app/(public)/login/page.tsx`
- Modify: `app/(public)/register/page.tsx`

- [ ] **Step 1: Read both files**

Read `app/(public)/login/page.tsx` and `app/(public)/register/page.tsx`.

- [ ] **Step 2: Update login page**

The login page renders a centered container. The form is in a `_form.tsx` component. Wrap the outer container with the card style:

```tsx
// app/(public)/login/page.tsx (server component)
import { Suspense } from "react";
import LoginForm from "./_form";

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#0107A3]">⚽ Fantadc</h1>
          <p className="text-[#6B7280] text-sm mt-1">Accedi al tuo account</p>
        </div>
        <div className="admin-card p-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="text-center text-sm text-[#6B7280] mt-4">
          Non hai un account?{" "}
          <a href="/register" className="font-medium text-[#0107A3] hover:underline">
            Registrati
          </a>
        </p>
      </div>
    </div>
  );
}
```

Also update label styling in `app/(public)/login/_form.tsx`: change `className="block text-sm font-medium mb-1"` → `className="block text-xs font-medium text-[#6B7280] mb-1"` for both label elements.

- [ ] **Step 3: Update register page**

The register page is currently a `"use client"` page that renders itself. Keep it client but update the wrapper:

```tsx
// Replace the outer wrapper div (lines 16-97) with:
<div className="min-h-[70vh] flex items-center justify-center px-4">
  <div className="w-full max-w-sm">
    <div className="text-center mb-8">
      <Link href="/" className="text-2xl font-extrabold text-[#0107A3]">
        ⚽ Fantadc
      </Link>
      <p className="text-[#6B7280] text-sm mt-1">Crea il tuo account</p>
    </div>
    <div className="admin-card p-6">
      <form action={action} className="flex flex-col gap-4">
        {/* same form fields but with updated label className */}
        ...
      </form>
    </div>
    <p className="text-center text-sm text-[#6B7280] mt-4">
      Hai già un account?{" "}
      <Link href="/login" className="font-medium text-[#0107A3] hover:underline">
        Accedi
      </Link>
    </p>
  </div>
</div>
```

Update all label `className` from `"block text-sm font-medium mb-1"` → `"block text-xs font-medium text-[#6B7280] mb-1"`.

Remove `style={{ color: "var(--primary)" }}` inline styles on links — use `text-[#0107A3]` Tailwind instead.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add "app/(public)/login/" "app/(public)/register/"
git commit -m "style: card wrapper and updated labels on login and register pages"
```

---

## Task 3: Partite list — StatusBadge + card wrapper

**Files:**
- Modify: `app/(public)/partite/page.tsx`

- [ ] **Step 1: Read the file**

Read `app/(public)/partite/page.tsx`.

- [ ] **Step 2: Replace `.badge-*` classes with StatusBadge, wrap list in card**

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import StatusBadge from "@/components/status-badge";

export default async function PartitePage() {
  const matches = await db.match.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { startsAt: "asc" },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Calendario partite</h1>
      {matches.length === 0 ? (
        <div className="admin-card p-8 text-center text-[#6B7280] text-sm">
          Nessuna partita disponibile.
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          {matches.map((m, i) => (
            <Link
              key={m.id}
              href={`/partite/${m.id}`}
              className={`flex items-center justify-between px-4 py-3 hover:bg-[#F0F1FC] transition-colors ${
                i < matches.length - 1 ? "border-b border-[#F3F4F6]" : ""
              }`}
            >
              <div>
                <p className="font-medium text-sm text-[#111827]">
                  {m.homeTeam.name}{" "}
                  <span className="text-[#9CA3AF] font-normal">vs</span>{" "}
                  {m.awayTeam.name}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {m.startsAt.toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <StatusBadge status={m.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/partite/page.tsx"
git commit -m "style: StatusBadge and card wrapper on partite list page"
```

---

## Task 4: Giocatori — RoleBadge + card sections

**Files:**
- Modify: `app/(public)/giocatori/page.tsx`

- [ ] **Step 1: Read the file**

Read `app/(public)/giocatori/page.tsx`.

- [ ] **Step 2: Replace inline role badge styles with RoleBadge, wrap in cards**

The current page groups players by team with a section header and a grid. Replace the inline badge styling with `<RoleBadge>` and apply admin-card per team section:

```tsx
import { db } from "@/lib/db";
import RoleBadge from "@/components/role-badge";

export default async function GiocatoriPage() {
  const players = await db.player.findMany({
    orderBy: [{ footballTeam: { name: "asc" } }, { name: "asc" }],
    include: { footballTeam: { select: { name: true } } },
  });

  // Group by team
  const byTeam = new Map<string, typeof players>();
  for (const p of players) {
    const arr = byTeam.get(p.footballTeam.name) ?? [];
    arr.push(p);
    byTeam.set(p.footballTeam.name, arr);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Giocatori</h1>
      {[...byTeam.entries()].map(([teamName, teamPlayers]) => (
        <div key={teamName} className="admin-card overflow-hidden">
          <div className="px-4 py-2 border-b border-[#F3F4F6] bg-[#F8F9FC]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              {teamName}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-0">
            {teamPlayers.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm ${
                  i % 2 === 0 ? "" : "bg-[#FAFAFA]"
                } border-b border-[#F3F4F6] last:border-0`}
              >
                <RoleBadge role={p.role} />
                <span className="font-medium text-[#111827] truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/giocatori/page.tsx"
git commit -m "style: RoleBadge and card sections on giocatori page"
```

---

## Task 5: Classifica — styled table with design tokens

**Files:**
- Modify: `app/(public)/classifica/page.tsx`

- [ ] **Step 1: Read the file**

Read `app/(public)/classifica/page.tsx`.

- [ ] **Step 2: Apply design tokens to the table**

Keep as server component (no PrimeReact DataTable needed — it's static). Wrap in admin-card and apply the same styling patterns as the admin DataTable overrides:

```tsx
import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClassificaPage() {
  const teams = await db.fantasyTeam.findMany({
    orderBy: { totalPoints: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Classifica</h1>
      {teams.length === 0 ? (
        <div className="admin-card p-8 text-center text-[#6B7280] text-sm">
          Nessuna squadra fantasy registrata.
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F8F9FC]">
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">#</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">Squadra</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">Proprietario</th>
                <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">Punti</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, i) => (
                <tr
                  key={team.id}
                  className={`border-b border-[#F3F4F6] last:border-0 hover:bg-[#F0F1FC] transition-colors ${
                    i % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-mono text-[#9CA3AF] w-10">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/squadre-fantasy/${team.id}`}
                      className="font-medium text-sm text-[#0107A3] hover:underline"
                    >
                      {team.name}
                    </Link>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#6B7280]">
                    {team.user.name ?? team.user.email}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-sm text-[#111827]">
                    {Number(team.totalPoints).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/classifica/page.tsx"
git commit -m "style: design token table styling on classifica page"
```

---

## Task 6: Squadre reali + Squadre Fantasy list — card pattern

**Files:**
- Modify: `app/(public)/squadre/page.tsx`
- Modify: `app/(public)/squadre-fantasy/page.tsx`

- [ ] **Step 1: Read both files**

Read `app/(public)/squadre/page.tsx` and `app/(public)/squadre-fantasy/page.tsx`.

- [ ] **Step 2: Update squadre/page.tsx**

Apply admin-card to each team card. Update colors to use design tokens:

```tsx
import { db } from "@/lib/db";

export default async function SquadrePage() {
  const teams = await db.footballTeam.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { players: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Squadre reali</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {teams.map((team) => (
          <div key={team.id} className="admin-card p-4 flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-px transition-all duration-150">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="w-12 h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#0107A3] flex items-center justify-center text-white font-bold text-sm">
                {team.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <p className="font-semibold text-sm text-[#111827]">{team.name}</p>
            <p className="text-xs text-[#6B7280]">{team._count.players} giocatori</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update squadre-fantasy/page.tsx**

Apply admin-card to each fantasy team card. Replace hardcoded inline styles with design tokens:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SquadreFanasyPage() {
  const teams = await db.fantasyTeam.findMany({
    orderBy: { totalPoints: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Squadre Fantasy</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {teams.map((team, i) => (
          <Link
            key={team.id}
            href={`/squadre-fantasy/${team.id}`}
            className="admin-card p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-px transition-all duration-150 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-sm text-[#0107A3] group-hover:underline">{team.name}</p>
                <p className="text-xs text-[#6B7280]">{team.user.name ?? team.user.email}</p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full text-white bg-[#0107A3] flex-shrink-0">
                #{i + 1}
              </span>
            </div>
            <div className="mt-1">
              <p className="text-2xl font-bold text-[#111827]">{Number(team.totalPoints).toFixed(1)}</p>
              <p className="text-xs text-[#6B7280]">punti</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add "app/(public)/squadre/page.tsx" "app/(public)/squadre-fantasy/page.tsx"
git commit -m "style: admin-card pattern on squadre and squadre-fantasy list pages"
```

---

## Task 7: Partita detail — navy header card + card sections

**Files:**
- Modify: `app/(public)/partite/[id]/page.tsx`

- [ ] **Step 1: Read the file**

Read `app/(public)/partite/[id]/page.tsx`.

- [ ] **Step 2: Replace header + sections with design tokens**

Apply the same navy gradient header card as the admin match detail, plus card sections for players and bonuses. Use `StatusBadge` instead of `.badge-*` classes:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { isMvpWindowOpen } from "@/lib/domain/vote";
import StatusBadge from "@/components/status-badge";
import RoleBadge from "@/components/role-badge";

export default async function PartitaPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (isNaN(Number(id))) notFound();
  const match = await db.match.findUnique({
    where: { id: Number(id), status: { not: "DRAFT" } },
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
    <div className="flex flex-col gap-4">
      <Link href="/partite" className="text-sm text-[#6B7280] hover:text-[#111827] flex items-center gap-1">
        <i className="pi pi-arrow-left text-xs" /> Tutte le partite
      </Link>

      {/* Navy header card */}
      <div
        className="rounded-2xl overflow-hidden p-5 flex items-start justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #0107A3 0%, #0106c4 100%)" }}
      >
        <div>
          <h1 className="text-xl font-bold text-white">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </h1>
          <p className="text-[13px] text-white/80 mt-1">
            {match.startsAt.toLocaleString("it-IT", { dateStyle: "full", timeStyle: "short" })}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#F5C518] text-[#111827] flex-shrink-0 mt-0.5">
          <StatusBadge status={match.status} />
        </span>
      </div>

      {/* MVP */}
      {mvpPlayer && (
        <div className="admin-card p-4 text-center">
          <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">MVP della partita</p>
          <p className="text-xl font-bold text-[#111827]">★ {mvpPlayer.name}</p>
          <p className="text-sm text-[#6B7280]">{mvpPlayer.footballTeam.name}</p>
        </div>
      )}

      {windowOpen && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center text-sm text-blue-700">
          🗳️ Finestra di voto MVP aperta —{" "}
          <a href="/login" className="font-medium underline">accedi per votare</a>
        </div>
      )}

      {/* Players */}
      {match.players.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[#111827] mb-3">
            Giocatori in campo ({match.players.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {match.players.map(({ player }) => (
              <div
                key={player.id}
                className="admin-card p-3 flex items-center gap-2"
                style={{ borderLeft: `3px solid ${player.role === "P" ? "#10B981" : "#3B82F6"}` }}
              >
                <RoleBadge role={player.role} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#111827] truncate">{player.name}</p>
                  <p className="text-xs text-[#6B7280] truncate">{player.footballTeam.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bonuses */}
      {match.status === "PUBLISHED" && match.bonuses.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[#111827] mb-3">Bonus assegnati</h2>
          <div className="admin-card overflow-hidden">
            {[...bonusByPlayer.entries()].map(([playerName, bonuses], i, arr) => (
              <div
                key={playerName}
                className={`px-4 py-3 ${i < arr.length - 1 ? "border-b border-[#F3F4F6]" : ""}`}
              >
                <p className="font-medium text-sm text-[#111827] mb-1">{playerName}</p>
                <div className="flex flex-wrap gap-1">
                  {bonuses.map((b) => (
                    <span
                      key={b.id}
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        Number(b.points) >= 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {b.bonusType.code}
                      {b.quantity > 1 && ` ×${b.quantity}`}{" "}
                      {Number(b.points) > 0 ? "+" : ""}{Number(b.points)}pt
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

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/partite/[id]/page.tsx"
git commit -m "style: navy header card and card sections on partita detail page"
```

---

## Task 8: Squadra fantasy detail — role-colored player cards

**Files:**
- Modify: `app/(public)/squadre-fantasy/[id]/page.tsx`

- [ ] **Step 1: Read the file**

Read `app/(public)/squadre-fantasy/[id]/page.tsx`.

- [ ] **Step 2: Apply admin-card sections and role-colored player card borders**

Key changes:
- Wrap player cards in admin-card with role-colored left border (green for P, blue for A)
- Use RoleBadge component
- Wrap history `<details>` in admin-card
- Apply page title styling (22px/700)

For the player grid section, replace:
```tsx
<div key={fp.id} className="border rounded-lg px-3 py-2.5 flex items-center gap-2 text-sm ...">
```
with:
```tsx
<div
  key={fp.id}
  className={`admin-card p-3 flex items-center gap-2 text-sm ${
    fp.player.id === fantasyTeam.captainPlayerId ? "bg-[#FFFBEB] border-amber-300" : ""
  }`}
  style={{ borderLeft: `3px solid ${fp.player.role === "P" ? "#10B981" : "#3B82F6"}` }}
>
```

Also add `<RoleBadge role={fp.player.role} />` to each player card.

For the history details elements, change:
```tsx
<details className="border rounded-lg">
```
to:
```tsx
<details className="admin-card overflow-hidden">
```

Add h1 page title: `<h1 className="text-[22px] font-bold text-[#111827]">{fantasyTeam.name}</h1>`

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/squadre-fantasy/[id]/page.tsx"
git commit -m "style: role-colored player cards and admin-card sections on squadra fantasy detail"
```

---

## Task 9: User dashboard — card sections

**Files:**
- Modify: `app/(user)/dashboard/page.tsx`

- [ ] **Step 1: Read the file**

Read `app/(user)/dashboard/page.tsx`.

- [ ] **Step 2: Wrap each section in admin-card**

Key changes:
- Page title: `<h1 className="text-[22px] font-bold text-[#111827]">Dashboard</h1>`
- Fantasy team section: wrap in `admin-card p-4`
- Empty state: `admin-card p-8 text-center` with dashed border inside
- MVP voting section: wrap in `admin-card p-4`
- Quick links section: wrap in `admin-card p-4`
- Replace `.btn-primary` with PrimeReact `Button` (import it)
- Replace `.btn-secondary` with PrimeReact `Button outlined`

Example for the fantasy team empty state:
```tsx
<div className="admin-card p-6 text-center">
  <p className="text-[#6B7280] text-sm mb-4">Non hai ancora creato la tua squadra fantasy.</p>
  <Button label="Crea squadra" href="/squadra/crea" onClick={() => {}} />
</div>
```

For the MVP voting section, replace the match item styling from:
```tsx
<div className="flex items-center justify-between border rounded-lg px-4 py-3">
```
to:
```tsx
<div className="flex items-center justify-between px-0 py-2 border-b border-[#F3F4F6] last:border-0">
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/(user)/dashboard/page.tsx"
git commit -m "style: admin-card sections on user dashboard page"
```

---

## Task 10: La mia squadra — card sections + field styling

**Files:**
- Modify: `app/(user)/squadra/page.tsx`

- [ ] **Step 1: Read the file**

Read `app/(user)/squadra/page.tsx`.

- [ ] **Step 2: Apply admin-card sections and improve PlayerCard**

Key changes:

1. **Page header**: add `<h1 className="text-[22px] font-bold text-[#111827]">{fantasyTeam.name}</h1>`

2. **Field visualization**: keep the green background but update card to have consistent padding and admin-card-like styling for the visual field container:
```tsx
<div className="admin-card overflow-hidden">
  <div className="bg-green-50 border-b border-green-100 p-6 flex flex-col items-center gap-4">
    {/* outfield + GK cards */}
  </div>
</div>
```

3. **PlayerCard function**: add role-colored left border:
```tsx
function PlayerCard({ name, team, isCaptain, isGk = false }: ...) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl px-4 py-3 text-center min-w-20 border ${
        isGk ? "bg-amber-50 border-amber-200" : "bg-white border-[#E5E7EB]"
      }`}
      style={{ borderLeft: `3px solid ${isGk ? "#F59E0B" : "#3B82F6"}` }}
    >
      {isCaptain && <span className="text-amber-500 text-xs mb-0.5">★ C</span>}
      <span className="font-semibold text-sm text-[#111827]">{name}</span>
      <span className="text-xs text-[#6B7280]">{team}</span>
    </div>
  );
}
```

4. **Rosa table**: wrap in `admin-card overflow-hidden`, apply same table header/row styling as classifica.

5. **Storico section**: wrap `<details>` items in admin-card instead of plain `border rounded-lg`.

6. **Back link**: replace `<Link href="/dashboard" className="btn-secondary">` with PrimeReact `Button` or styled link.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/(user)/squadra/page.tsx"
git commit -m "style: admin-card sections and improved field visualization on squadra page"
```

---

## Task 11: Crea squadra form — PrimeReact migration for inputs/submit

**Files:**
- Modify: `app/(user)/squadra/crea/_form.tsx`

- [ ] **Step 1: Read the file**

Read `app/(user)/squadra/crea/_form.tsx`.

- [ ] **Step 2: Replace raw input and submit button with PrimeReact**

Key changes:

1. **Team name input** — replace raw `<input className="input">` with PrimeReact `InputText`:
```tsx
// Add import: import { InputText } from "primereact/inputtext";
// Replace:
<input
  name="name"
  value={teamName}
  onChange={(e) => setTeamName(e.target.value)}
  className="input w-full max-w-sm"
  placeholder="es. I Guerrieri"
  maxLength={40}
  required
/>
// With:
<InputText
  name="name"
  value={teamName}
  onChange={(e) => setTeamName(e.target.value)}
  className="w-full max-w-sm"
  placeholder="es. I Guerrieri"
  maxLength={40}
  required
/>
```

2. **Submit button** — replace `<button className="btn-primary">` with PrimeReact `Button`:
```tsx
// Add import: import { Button } from "primereact/button";
// Replace:
<button
  type="submit"
  disabled={!validation.isValid || pending}
  className="btn-primary"
>
  {pending ? "Salvo..." : "Conferma squadra"}
</button>
// With:
<Button
  type="submit"
  label={pending ? "Salvo..." : "Conferma squadra"}
  disabled={!validation.isValid || pending}
  className="w-full md:w-auto"
/>
```

3. **Label styling** — update the label on team name from `text-sm font-medium` to `text-xs font-medium text-[#6B7280]`. Do the same for "Capitano *" label.

4. Keep the player toggle `<button>` elements and captain `<button>` elements as-is — they are custom interactive toggle controls, not standard action buttons.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/(user)/squadra/crea/_form.tsx"
git commit -m "style: PrimeReact InputText and Button in crea squadra form"
```

---

## Task 12: Vota MVP — card sections + button styling

**Files:**
- Modify: `app/(user)/vota/[id]/page.tsx`
- Modify: `app/(user)/vota/[id]/_vote-form.tsx`

- [ ] **Step 1: Read both files**

Read `app/(user)/vota/[id]/page.tsx` and `app/(user)/vota/[id]/_vote-form.tsx`.

- [ ] **Step 2: Update vota page**

Key changes to `page.tsx`:
- Add back link `← Dashboard` at top
- Wrap the voting status and form in `admin-card p-5`
- Wrap MVP box in `admin-card p-5 text-center`
- Page title: `<h1 className="text-[22px] font-bold text-[#111827]">{match.homeTeam.name} vs {match.awayTeam.name}</h1>`

- [ ] **Step 3: Update vote form button styling**

The vote buttons are submit buttons with `name`/`value` attributes. Keep as `<button>` but update styling to match design tokens:

```tsx
<button
  key={p.id}
  type="submit"
  name="playerId"
  value={p.id}
  disabled={pending}
  className="flex items-center justify-between admin-card px-4 py-3 text-left w-full hover:bg-[#F0F1FC] active:bg-[#E8E9F8] transition-colors disabled:opacity-50"
>
  <span className="font-medium text-sm text-[#111827]">{p.name}</span>
  <span className="text-xs text-[#6B7280]">{p.footballTeam.name}</span>
</button>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add "app/(user)/vota/[id]/"
git commit -m "style: card sections and updated vote button styling on vota MVP page"
```

---

## Task 13: Regolamento — card wrapper

**Files:**
- Modify: `app/(public)/regolamento/page.tsx`

- [ ] **Step 1: Read the file**

Read `app/(public)/regolamento/page.tsx`.

- [ ] **Step 2: Wrap content in admin-card, apply typography tokens**

```tsx
export default function RegolamentoPage() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-[22px] font-bold text-[#111827]">Regolamento</h1>
      <div className="admin-card p-6 flex flex-col gap-6 text-sm text-[#374151]">
        {/* keep all existing sections but update: */}
        {/* section h2: className="text-base font-semibold text-[#0107A3] mb-2" */}
        {/* section body: className="text-sm text-[#374151]" */}
        {/* lists: keep existing list-disc/list-decimal */}
      </div>
    </div>
  );
}
```

Replace the inline `style={{ color: "var(--primary)" }}` on section headers with `className="text-[#0107A3]"`.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/regolamento/page.tsx"
git commit -m "style: card wrapper and typography tokens on regolamento page"
```

---

## Task 14: Final verification and build

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 2: Production build**

```bash
npm run build
```

Expected: build completes with no errors.

- [ ] **Step 3: Visual check list**

Run `npm run dev`, open `http://localhost:3000` and verify:

- [ ] Mobile (375px): bottom nav visible with 4 items + Altro drawer
- [ ] Desktop: top nav visible, bottom nav hidden
- [ ] `/login`: card wrapper visible, clean form styling
- [ ] `/register`: same card treatment
- [ ] `/partite`: StatusBadge dots, card list
- [ ] `/partite/[id]`: navy gradient header, StatusBadge inside gold pill, role-colored player cards
- [ ] `/giocatori`: RoleBadge circles, card sections per team
- [ ] `/classifica`: styled table with zebra rows, hover navy tint
- [ ] `/squadre`: card grid with hover lift
- [ ] `/squadre-fantasy`: card grid with points prominent
- [ ] `/squadre-fantasy/[id]`: role-colored player card borders
- [ ] `/dashboard`: card sections for each area
- [ ] `/squadra`: field visualization in card, role borders on PlayerCard
- [ ] `/squadra/crea`: InputText for team name, PrimeReact Button for submit
- [ ] `/vota/[id]`: card sections, styled vote buttons
- [ ] `/regolamento`: card wrapper

- [ ] **Step 4: Commit session files**

```bash
git add .claude/ ai_context/.claude/
git commit -m "chore: update Claude session files after public redesign"
```
