# Task 11 — Layout Pubblico + Sub-nav + Overview

**File da creare:**
- `app/(public)/greenvolley/layout.tsx`
- `app/(public)/greenvolley/_sub-nav.tsx`
- `app/(public)/greenvolley/page.tsx`

**Dipendenze:** Task 1 (schema), Task 2 (standings)

---

## Passi

- [ ] **Step 1: Crea `app/(public)/greenvolley/_sub-nav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/greenvolley",             label: "Home",        exact: true  },
  { href: "/greenvolley/partite",     label: "Partite",     exact: false },
  { href: "/greenvolley/classifica",  label: "Classifica",  exact: false },
  { href: "/greenvolley/gironi",      label: "Gironi",      exact: false },
  { href: "/greenvolley/eliminazione",label: "Eliminazione",exact: false },
  { href: "/greenvolley/squadre",     label: "Squadre",     exact: false },
  { href: "/greenvolley/giocatori",   label: "Giocatori",   exact: false },
];

export default function GreenVolleySubNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <div
      className="sticky top-14 z-20 overflow-x-auto scrollbar-none"
      style={{ background: "#fff", borderBottom: "2px solid #3DD907" }}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-0.5 h-10 min-w-max">
        {LINKS.map((link) => {
          const active = isActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap transition-colors"
              style={
                active
                  ? { background: "#f0fde7", color: "#3DD907" }
                  : { color: "var(--text-muted)" }
              }
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Crea `app/(public)/greenvolley/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import GreenVolleySubNav from "./_sub-nav";

export default function GreenVolleyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GreenVolleySubNav />
      {children}
    </>
  );
}
```

- [ ] **Step 3: Crea `app/(public)/greenvolley/page.tsx`**

```tsx
import { db } from "@/lib/db";
import Link from "next/link";
import { computeVolleyStandings } from "@/lib/volley/standings";

export default async function GreenVolleyHomePage() {
  const [nextMatch, groups] = await Promise.all([
    db.volleyMatch.findFirst({
      where: { status: "SCHEDULED" },
      orderBy: { date: "asc" },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
      },
    }),
    db.volleyGroup.findMany({
      orderBy: { name: "asc" },
      include: {
        teams: { include: { team: { select: { id: true, name: true } } } },
        matches: {
          where: { status: "CONCLUDED" },
          include: { sets: true },
        },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "linear-gradient(135deg, #0d1f0d 0%, #1a3a1a 100%)" }}
      >
        <div
          className="text-[11px] font-black uppercase tracking-widest mb-1"
          style={{ color: "#3DD907" }}
        >
          Campionato
        </div>
        <h1 className="font-display font-black text-3xl uppercase text-white">
          GREEN<span style={{ color: "#3DD907" }}>VOLLEY</span>
        </h1>
      </div>

      {/* Prossima partita */}
      {nextMatch ? (
        <div>
          <div
            className="text-[10px] font-black uppercase tracking-widest mb-2"
            style={{ color: "#3DD907" }}
          >
            Prossima partita
          </div>
          <Link
            href={`/greenvolley/partite/${nextMatch.id}`}
            className="admin-card p-4 flex items-center justify-between hover:shadow-md transition-shadow block"
          >
            <span className="font-black text-base">{nextMatch.homeTeam.name}</span>
            <div className="text-center">
              <div className="font-black text-xl" style={{ color: "#3DD907" }}>
                vs
              </div>
              {nextMatch.date && (
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {nextMatch.date.toLocaleDateString("it-IT", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              )}
            </div>
            <span className="font-black text-base">{nextMatch.awayTeam.name}</span>
          </Link>
        </div>
      ) : (
        <div
          className="admin-card p-4 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Nessuna partita programmata.
        </div>
      )}

      {/* Classifiche rapide per girone */}
      {groups.map((group) => {
        const teamList = group.teams.map((gt) => gt.team);
        const matches = group.matches.map((m) => ({
          homeTeamId: m.homeTeamId,
          awayTeamId: m.awayTeamId,
          status: m.status,
          sets: m.sets,
        }));
        const standings = computeVolleyStandings(teamList, matches).slice(0, 4);

        return (
          <div key={group.id}>
            <div className="flex items-center justify-between mb-2">
              <div
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: "#3DD907" }}
              >
                {group.name}
              </div>
              <Link
                href="/greenvolley/classifica"
                className="text-xs font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                Vedi tutto →
              </Link>
            </div>
            <div className="admin-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-soft)" }}>
                    <th className="text-left px-3 py-2 font-semibold text-xs" style={{ color: "var(--text-muted)" }}>
                      Squadra
                    </th>
                    <th className="text-center px-2 py-2 font-semibold text-xs w-10" style={{ color: "var(--text-muted)" }}>G</th>
                    <th className="text-center px-2 py-2 font-semibold text-xs w-10" style={{ color: "#3DD907" }}>P</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, i) => (
                    <tr
                      key={row.teamId}
                      style={{ borderBottom: i < standings.length - 1 ? "1px solid var(--border-soft)" : "none" }}
                    >
                      <td className="px-3 py-2 font-semibold">{row.teamName}</td>
                      <td className="text-center px-2 py-2 text-xs" style={{ color: "var(--text-muted)" }}>
                        {row.played}
                      </td>
                      <td className="text-center px-2 py-2 font-black" style={{ color: "#3DD907" }}>
                        {row.setsWon}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Output atteso: nessun errore.

- [ ] **Step 5: Commit**

```bash
git add app/(public)/greenvolley/layout.tsx app/(public)/greenvolley/_sub-nav.tsx app/(public)/greenvolley/page.tsx
git commit -m "feat: add GreenVolley public layout, sub-nav and overview page"
```
