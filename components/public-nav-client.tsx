"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";
import { Button } from "primereact/button";
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
              <Button
                unstyled
                type="button"
                disabled={logoutPending}
                onClick={() => startTransition(() => logout())}
                className="text-xs px-3 py-1.5 rounded-full font-bold border uppercase tracking-wide transition-colors hover:bg-[var(--surface-1)] disabled:opacity-50"
                style={{ borderColor: "var(--border-medium)", color: "var(--text-secondary)" }}
                label={logoutPending ? "..." : "ESCI"}
              />
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
