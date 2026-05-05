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

function NavDivider() {
  return (
    <span
      className="flex-shrink-0 w-px h-4 rounded-full mx-1"
      style={{ background: "var(--border-medium)" }}
      aria-hidden
    />
  );
}

export default function TopBar({
  initials,
  userName,
}: {
  initials: string;
  userName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [logoutPending, startTransition] = useTransition();

  const isGV = pathname.startsWith("/admin/greenvolley");
  const GROUPS = isGV ? GV_GROUPS : DCUP_GROUPS;
  const primary = isGV ? GV : "var(--primary)";
  const primaryLight = isGV ? "#f0fde7" : "var(--primary-light)";

  const isActive = (href: string) => {
    if (href === "/admin" || href === "/admin/greenvolley") return pathname === href;
    return pathname.startsWith(href);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

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
        <Link href={isGV ? "/admin/greenvolley" : "/admin"} className="flex items-center gap-2 flex-shrink-0">
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

        {/* Sport switcher */}
        <div
          className="flex items-center gap-0.5 rounded-full p-1 flex-shrink-0"
          style={{ background: "var(--surface-1)" }}
        >
          <Link
            href="/admin"
            className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide transition-colors"
            style={
              !isGV
                ? { background: "#fff", color: "var(--primary)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                : { color: "var(--text-muted)" }
            }
          >
            ⚽ DCup
          </Link>
          <Link
            href="/admin/greenvolley"
            className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide transition-colors"
            style={
              isGV
                ? { background: "#fff", color: GV, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                : { color: "var(--text-muted)" }
            }
          >
            🏐 GreenVolley
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto">
          {GROUPS.map((group, gi) => (
            <div key={gi} className="flex items-center gap-0.5">
              {gi > 0 && <NavDivider />}
              {group.label && (
                <span
                  className="px-2 text-[9px] font-black uppercase tracking-widest flex-shrink-0"
                  style={{
                    color:
                      group.label === "Fanta" || group.label === "GreenVolley"
                        ? primary
                        : "var(--text-disabled)",
                  }}
                >
                  {group.label}
                </span>
              )}
              {group.items.map((item) => {
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
              })}
            </div>
          ))}
        </nav>

        {/* Avatar + dropdown */}
        <div ref={ref} className="ml-auto relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-black transition-opacity hover:opacity-80"
            style={{ background: primary }}
            aria-label="Menu utente"
            aria-expanded={open}
          >
            {initials}
          </button>

          {open && (
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
                  setOpen(false);
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
