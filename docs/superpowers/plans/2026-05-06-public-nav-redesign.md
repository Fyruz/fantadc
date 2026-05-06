# Public Nav Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La navigazione pubblica (top bar + mobile bottom nav) si trasforma completamente quando si naviga su `/greenvolley/*` — logo verde, link GV, colore `#3DD907` — dando il feeling di sito a parte.

**Architecture:** `public-nav.tsx` viene suddiviso in server wrapper (fetcha `SessionUser`) + client component (`public-nav-client.tsx`) che usa `usePathname()` per rilevare lo sport. `public-bottom-nav.tsx` (già client) riceve una modalità GreenVolley. La sub-nav esistente (`_sub-nav.tsx`) viene rimossa — i link entrano nella top bar.

**Tech Stack:** Next.js 15 App Router, React, Tailwind CSS, PrimeReact v10, TypeScript strict

---

## File Map

| File | Tipo |
|---|---|
| `components/public-nav-client.tsx` | Create — logica UI completa (client) |
| `components/public-nav.tsx` | Modify — thin server wrapper |
| `components/public-bottom-nav.tsx` | Modify — aggiunge modalità GreenVolley |
| `app/(public)/greenvolley/layout.tsx` | Modify — rimuove sub-nav |
| `app/(public)/greenvolley/_sub-nav.tsx` | Delete |

---

## Task 1: Crea `public-nav-client.tsx` e aggiorna `public-nav.tsx`

I due file sono strettamente accoppiati — vanno implementati insieme. Il server wrapper non funziona senza il client.

**Files:**
- Create: `components/public-nav-client.tsx`
- Modify: `components/public-nav.tsx`

- [ ] **Step 1: Scrivi il contenuto completo di `components/public-nav-client.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";
import { logout } from "@/app/actions/auth";
import type { SessionUser } from "@/lib/session";

const GV = "#3DD907";
const GV_LIGHT = "#f0fde7";

const DCUP_GROUPS = [
  {
    label: "Torneo",
    items: [
      { href: "/partite",              label: "Partite"      },
      { href: "/gironi",               label: "Gironi"       },
      { href: "/eliminazione",         label: "Eliminazione" },
      { href: "/squadre",              label: "Squadre"      },
      { href: "/giocatori",            label: "Giocatori"    },
      { href: "/classifica-torneo",    label: "Classifica"   },
      { href: "/classifica-marcatori", label: "Marcatori"    },
    ],
  },
  {
    label: "Fanta",
    items: [
      { href: "/squadre-fanta", label: "Classifica Fanta" },
    ],
  },
];

const GV_LINKS = [
  { href: "/greenvolley",              label: "Home",        exact: true  },
  { href: "/greenvolley/partite",      label: "Partite",     exact: false },
  { href: "/greenvolley/classifica",   label: "Classifica",  exact: false },
  { href: "/greenvolley/gironi",       label: "Gironi",      exact: false },
  { href: "/greenvolley/eliminazione", label: "Eliminazione",exact: false },
  { href: "/greenvolley/squadre",      label: "Squadre",     exact: false },
  { href: "/greenvolley/giocatori",    label: "Giocatori",   exact: false },
];

export default function PublicNavClient({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const [logoutPending, startTransition] = useTransition();

  const isGV = pathname.startsWith("/greenvolley");
  const primary = isGV ? GV : "var(--primary)";
  const primaryLight = isGV ? GV_LIGHT : "var(--primary-light)";

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const isGroupActive = (group: (typeof DCUP_GROUPS)[number]) =>
    group.items.some((item) => isActive(item.href));

  useEffect(() => {
    setOpenGroup(null);
  }, [isGV]);

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
      className="sticky top-0 z-30"
      style={{
        background: "#fff",
        borderBottom: isGV ? `2px solid ${GV}` : "1px solid var(--border-soft)",
        boxShadow: "0 1px 8px rgba(1,7,163,0.06)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link href={isGV ? "/greenvolley" : "/"} className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: primary }}
          >
            {isGV ? "🏐" : "⚽"}
          </div>
          <span
            className="font-display font-black text-[15px] uppercase tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {isGV ? (
              <>GREEN<span style={{ color: GV }}>VOLLEY</span></>
            ) : (
              <><span style={{ color: "var(--primary)" }}>DCUP</span>{" "}<span style={{ color: "#E8A000" }}>26</span></>
            )}
          </span>
        </Link>

        {/* Sport switcher */}
        <div
          className="flex items-center gap-0.5 rounded-full p-1 flex-shrink-0"
          style={{ background: "var(--surface-1)" }}
        >
          <Link
            href="/"
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
            href="/greenvolley"
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

        {/* Desktop nav */}
        {isGV ? (
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {GV_LINKS.map((link) => {
              const active = isActive(link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
                  style={active ? { background: GV_LIGHT, color: GV } : { color: "var(--text-muted)" }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav ref={navRef} className="hidden md:flex items-center gap-1 flex-1">
            {DCUP_GROUPS.map((group) => {
              const groupActive = isGroupActive(group);
              const isOpen = openGroup === group.label;
              return (
                <div key={group.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenGroup(isOpen ? null : group.label)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
                    style={
                      groupActive || isOpen
                        ? { background: "var(--primary-light)", color: "var(--primary)" }
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
                            style={active ? { color: "var(--primary)" } : { color: "var(--text-primary)" }}
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
            <Link
              href="/regolamento"
              className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
              style={
                isActive("/regolamento")
                  ? { background: "var(--primary-light)", color: "var(--primary)" }
                  : { color: "var(--text-muted)" }
              }
            >
              Regolamento
            </Link>
          </nav>
        )}

        {/* Auth */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm font-semibold transition-colors px-2 hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="text-sm font-semibold transition-colors px-2 hover:opacity-70"
                style={{ color: "var(--text-muted)" }}
              >
                Dashboard
              </Link>
              <button
                type="button"
                disabled={logoutPending}
                onClick={() => startTransition(() => logout())}
                className="text-xs px-3 py-1.5 rounded-full font-bold border uppercase tracking-wide transition-colors hover:bg-[var(--surface-1)] disabled:opacity-50"
                style={{ borderColor: "var(--border-medium)", color: "var(--text-secondary)" }}
              >
                {logoutPending ? "..." : "ESCI"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold transition-colors px-2 hover:opacity-70"
                style={{ color: "var(--text-muted)" }}
              >
                Accedi
              </Link>
              <Link
                href="/register"
                className="text-xs px-4 py-2 rounded-full font-black uppercase tracking-wide transition-colors hover:opacity-90"
                style={{ background: primary, color: "#fff" }}
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

- [ ] **Step 2: Sostituisci il contenuto di `components/public-nav.tsx`**

```tsx
import { getCurrentUser } from "@/lib/session";
import PublicNavClient from "./public-nav-client";

export default async function PublicNav() {
  const user = await getCurrentUser();
  return <PublicNavClient user={user} />;
}
```

- [ ] **Step 3: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 4: Commit**

```bash
git add components/public-nav.tsx components/public-nav-client.tsx
git commit -m "feat(public): split nav into server wrapper + client component with sport switcher"
```

---

## Task 2: Aggiorna `public-bottom-nav.tsx` — modalità GreenVolley

**File:**
- Modify: `components/public-bottom-nav.tsx`

Sostituire l'intero contenuto con il seguente. Rispetto all'originale: aggiunto `isGV`, due branch di rendering per DCup vs GreenVolley, sport switcher nei drawer, rimossa la riga GreenVolley dal MORE_NAV DCup.

- [ ] **Step 1: Sostituisci l'intero contenuto del file**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "primereact/button";

const GV = "#3DD907";
const GV_LIGHT = "#f0fde7";

// ─── DCup ────────────────────────────────────────────────────────────────────

const DCUP_MAIN = [
  { href: "/partite", label: "PARTITE", icon: "pi-calendar" },
] as const;

const DCUP_AFTER_CLASSIFICA = [
  { href: "/squadre-fanta", label: "FANTA",   icon: "pi-trophy", matchers: undefined },
  { href: "/dashboard",     label: "IL MIO",  icon: "pi-user",   matchers: ["/dashboard", "/squadra", "/vota"] },
] as const;

const DCUP_CLASSIFICA = [
  { href: "/classifica-torneo",    label: "Classifica squadre",   icon: "pi-list"  },
  { href: "/classifica-marcatori", label: "Classifica marcatori", icon: "pi-users" },
] as const;

const DCUP_MORE = [
  { href: "/gironi",       label: "Gironi",       icon: "pi-th-large" },
  { href: "/eliminazione", label: "Eliminazione", icon: "pi-sitemap"  },
  { href: "/giocatori",    label: "Giocatori",    icon: "pi-users"    },
  { href: "/squadre",      label: "Squadre",      icon: "pi-shield"   },
  { href: "/regolamento",  label: "Regolamento",  icon: "pi-book"     },
] as const;

// ─── GreenVolley ──────────────────────────────────────────────────────────────

const GV_MAIN = [
  { href: "/greenvolley/partite",    label: "PARTITE",  icon: "pi-calendar" },
  { href: "/greenvolley/classifica", label: "CLASS.",   icon: "pi-list"     },
  { href: "/greenvolley/squadre",    label: "SQUADRE",  icon: "pi-shield"   },
  { href: "/greenvolley/giocatori",  label: "GIOC.",    icon: "pi-users"    },
] as const;

const GV_MORE = [
  { href: "/greenvolley/gironi",       label: "Gironi",       icon: "pi-th-large" },
  { href: "/greenvolley/eliminazione", label: "Eliminazione", icon: "pi-sitemap"  },
  { href: "/greenvolley",              label: "Home",         icon: "pi-home"     },
] as const;

// ─── Helper ───────────────────────────────────────────────────────────────────

function NavIndicator({ color }: { color: string }) {
  return (
    <span
      className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-b-full"
      style={{ background: color }}
    />
  );
}

export default function PublicBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [classificaOpen, setClassificaOpen] = useState(false);

  const isGV = pathname.startsWith("/greenvolley");
  const primary = isGV ? GV : "var(--primary)";

  const isActive = (href: string, matchers?: readonly string[]) => {
    if (matchers) return matchers.some((m) => pathname === m || pathname.startsWith(m + "/"));
    if (href === "/greenvolley") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const closeAll = () => { setMoreOpen(false); setClassificaOpen(false); };

  // ─── Sport Switcher (shared between drawers) ─────────────────────────────
  const SportSwitcher = () => (
    <div className="flex gap-2 px-4 pt-3 pb-2 border-b" style={{ borderColor: "var(--border-soft)" }}>
      <Link
        href="/"
        onClick={closeAll}
        className="flex-1 py-1.5 text-center text-[11px] font-black uppercase rounded-full"
        style={
          !isGV
            ? { background: "var(--primary-light)", color: "var(--primary)" }
            : { background: "var(--surface-1)", color: "var(--text-muted)" }
        }
      >
        ⚽ DCup
      </Link>
      <Link
        href="/greenvolley"
        onClick={closeAll}
        className="flex-1 py-1.5 text-center text-[11px] font-black uppercase rounded-full"
        style={
          isGV
            ? { background: GV_LIGHT, color: GV }
            : { background: "var(--surface-1)", color: "var(--text-muted)" }
        }
      >
        🏐 GreenVolley
      </Link>
    </div>
  );

  // ─── GreenVolley bottom nav ───────────────────────────────────────────────
  if (isGV) {
    const moreIsActive = GV_MORE.some((item) => isActive(item.href));
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
            style={{ background: "#fff", borderTop: `2px solid ${GV}`, boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}
          >
            <SportSwitcher />
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
              {GV_MORE.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={active ? { background: GV_LIGHT, color: GV } : { color: "var(--text-secondary)" }}
                  >
                    <i className={`pi ${item.icon} text-base`} style={active ? { color: GV } : {}} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
          style={{
            background: "#fff",
            borderTop: `2px solid ${GV}`,
            boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="flex h-16">
            {GV_MAIN.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
                >
                  <div className="relative flex flex-col items-center">
                    {active && <NavIndicator color={GV} />}
                    <i
                      className={`pi ${item.icon} text-xl`}
                      style={{ color: active ? GV : "var(--text-disabled)" }}
                    />
                  </div>
                  <span
                    className="text-[8px] font-black uppercase tracking-wide"
                    style={{ color: active ? GV : "var(--text-disabled)" }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
            <Button
              unstyled
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5"
            >
              <i
                className="pi pi-ellipsis-h text-xl"
                style={{ color: moreIsActive || moreOpen ? GV : "var(--text-disabled)" }}
              />
              <span
                className="text-[8px] font-black uppercase tracking-wide"
                style={{ color: moreIsActive || moreOpen ? GV : "var(--text-disabled)" }}
              >
                ALTRO
              </span>
            </Button>
          </div>
        </nav>
      </>
    );
  }

  // ─── DCup bottom nav ──────────────────────────────────────────────────────
  const classificaIsActive = DCUP_CLASSIFICA.some((item) => isActive(item.href));
  const moreIsActive = DCUP_MORE.some((item) => isActive(item.href));

  return (
    <>
      {(moreOpen || classificaOpen) && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(6,7,61,0.3)" }}
          onClick={closeAll}
        />
      )}

      {/* Classifica drawer */}
      {classificaOpen && (
        <div
          className="fixed bottom-[64px] left-0 right-0 z-50 rounded-t-2xl md:hidden pb-safe"
          style={{ background: "#fff", borderTop: "2px solid var(--border-medium)", boxShadow: "0 -4px 24px rgba(1,7,163,0.12)" }}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              CLASSIFICA
            </span>
            <Button
              icon="pi pi-times"
              text
              type="button"
              onClick={() => setClassificaOpen(false)}
              className="!p-1"
              style={{ color: "var(--text-muted)" }}
              aria-label="Chiudi"
            />
          </div>
          <div className="flex flex-col gap-1 px-3 pb-4">
            {DCUP_CLASSIFICA.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setClassificaOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={active ? { background: "var(--surface-1)", color: "var(--primary)" } : { color: "var(--text-secondary)" }}
                >
                  <i className={`pi ${item.icon} text-base`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* More drawer */}
      {moreOpen && (
        <div
          className="fixed bottom-[64px] left-0 right-0 z-50 rounded-t-2xl md:hidden pb-safe"
          style={{ background: "#fff", borderTop: "2px solid var(--border-medium)", boxShadow: "0 -4px 24px rgba(1,7,163,0.12)" }}
        >
          <SportSwitcher />
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
            {DCUP_MORE.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={active ? { background: "var(--surface-1)", color: "var(--primary)" } : { color: "var(--text-secondary)" }}
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
          {/* Partite */}
          {DCUP_MAIN.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <div className="relative flex flex-col items-center">
                  {active && <NavIndicator color="var(--primary)" />}
                  <i className={`pi ${item.icon} text-xl`} style={{ color: active ? "var(--primary)" : "var(--text-disabled)" }} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-wide" style={{ color: active ? "var(--primary)" : "var(--text-disabled)" }}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Classifica drawer button */}
          <Button
            unstyled
            type="button"
            onClick={() => { setClassificaOpen((v) => !v); setMoreOpen(false); }}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
          >
            <div className="relative flex flex-col items-center">
              {classificaIsActive && <NavIndicator color="var(--primary)" />}
              <i
                className="pi pi-list text-xl"
                style={{ color: classificaIsActive || classificaOpen ? "var(--primary)" : "var(--text-disabled)" }}
              />
            </div>
            <span
              className="text-[8px] font-black uppercase tracking-wide"
              style={{ color: classificaIsActive || classificaOpen ? "var(--primary)" : "var(--text-disabled)" }}
            >
              CLASSIFICA
            </span>
          </Button>

          {/* Fanta + Il Mio */}
          {DCUP_AFTER_CLASSIFICA.map((item) => {
            const active = isActive(item.href, item.matchers);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <div className="relative flex flex-col items-center">
                  {active && <NavIndicator color="var(--primary)" />}
                  <i className={`pi ${item.icon} text-xl`} style={{ color: active ? "var(--primary)" : "var(--text-disabled)" }} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-wide" style={{ color: active ? "var(--primary)" : "var(--text-disabled)" }}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Altro */}
          <Button
            unstyled
            type="button"
            onClick={() => { setMoreOpen((v) => !v); setClassificaOpen(false); }}
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

Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add components/public-bottom-nav.tsx
git commit -m "feat(public): bottom nav GreenVolley mode + sport switcher in drawers"
```

---

## Task 3: Rimuovi sub-nav GreenVolley

La sub-nav è ora sostituita dalla top bar. Il layout GreenVolley diventa un passthrough.

**Files:**
- Modify: `app/(public)/greenvolley/layout.tsx`
- Delete: `app/(public)/greenvolley/_sub-nav.tsx`

- [ ] **Step 1: Sostituisci il contenuto di `app/(public)/greenvolley/layout.tsx`**

```tsx
import type { ReactNode } from "react";

export default function GreenVolleyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 2: Elimina `_sub-nav.tsx`**

```bash
rm "app/(public)/greenvolley/_sub-nav.tsx"
```

Oppure cancellalo manualmente. Il file non è importato da nessun altro posto (solo dal layout che abbiamo appena aggiornato).

- [ ] **Step 3: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/greenvolley/layout.tsx"
git rm "app/(public)/greenvolley/_sub-nav.tsx"
git commit -m "feat(greenvolley): remove sub-nav, links now in top bar"
```

---

## Task 4: Verifica finale

- [ ] **Step 1: TypeScript full check**

```bash
npx tsc --noEmit
```

Expected: 0 errori.

- [ ] **Step 2: Build produzione**

```bash
npm run build
```

Expected: build completata senza errori. Nessuna pagina in errore.

- [ ] **Step 3: Commit .claude/**

```bash
git add .claude/ ai_context/
git status
```

Se ci sono file modificati:

```bash
git commit -m "chore: update claude context after public nav redesign"
```

---

## Checklist spec coverage

| Requisito spec | Task |
|---|---|
| Server wrapper + client component split | Task 1 |
| Desktop DCup: dropdown Torneo (7 link) + Fanta + Regolamento flat | Task 1 |
| Desktop GreenVolley: 7 link flat, logo verde, bordo `2px #3DD907` | Task 1 |
| Sport switcher desktop + mobile icone (`hidden md:inline`) | Task 1 |
| Reset `openGroup` su cambio sport | Task 1 |
| Outside-click chiude dropdown | Task 1 |
| Auth: logout via `logout` action, REGISTRATI verde su GV | Task 1 |
| Bottom nav GreenVolley: 4 main + Altro verde | Task 2 |
| Bottom nav DCup: sport switcher in drawer Altro, rimossa voce GV standalone | Task 2 |
| Rimozione `_sub-nav.tsx` | Task 3 |
| `greenvolley/layout.tsx` passthrough | Task 3 |
| tsc + build | Task 4 |
