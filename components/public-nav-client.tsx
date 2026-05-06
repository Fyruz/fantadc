"use client";

import Image from "next/image";
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
];

export default function PublicNavClient({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [logoutPending, startTransition] = useTransition();

  const isGV = pathname.startsWith("/greenvolley");
  const primary = isGV ? GV : "var(--primary)";

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const isGroupActive = (group: (typeof DCUP_GROUPS)[number]) =>
    group.items.some((item) => isActive(item.href));

  const userInitial = user ? (user.name ?? user.email).charAt(0).toUpperCase() : "";

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

  useEffect(() => {
    if (!avatarOpen) return;
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node))
        setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [avatarOpen]);

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
          <Image
            src={isGV ? "/logo_greenvolley.png" : "/logo_dc.png"}
            width={28}
            height={28}
            alt={isGV ? "GreenVolley logo" : "DCup logo"}
            className="rounded-lg"
          />
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
            <div ref={avatarRef} className="relative">
              <button
                type="button"
                onClick={() => setAvatarOpen((v) => !v)}
                className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-black transition-opacity hover:opacity-80"
                style={{ background: primary }}
                aria-label="Menu utente"
                aria-expanded={avatarOpen}
              >
                {userInitial}
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
                    <div className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {user.name ?? user.email}
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--surface-1)]"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <i className="pi pi-home text-sm" />
                      Dashboard
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--surface-1)]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <i className="pi pi-cog text-sm" />
                        Admin
                      </Link>
                    )}
                    <button
                      type="button"
                      disabled={logoutPending}
                      onClick={() => { setAvatarOpen(false); startTransition(() => logout()); }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-[var(--surface-1)] disabled:opacity-50"
                      style={{ color: "#991B1B" }}
                    >
                      <i className="pi pi-sign-out text-sm" />
                      {logoutPending ? "Uscita in corso..." : "Esci"}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                className="hidden md:inline-flex text-xs px-4 py-2 rounded-full font-black uppercase tracking-wide transition-colors hover:opacity-90"
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
