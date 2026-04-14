"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { logout } from "@/app/actions/auth";

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { href: "/admin", label: "Dashboard" },
    ],
  },
  {
    label: "Torneo",
    items: [
      { href: "/admin/squadre",     label: "Squadre"    },
      { href: "/admin/giocatori",   label: "Giocatori"  },
      { href: "/admin/partite",     label: "Partite"    },
      { href: "/admin/gironi",      label: "Gironi"     },
      { href: "/admin/eliminazione", label: "Eliminazione" },
      { href: "/admin/bonus-types", label: "Tipi bonus" },
    ],
  },
  {
    label: "Fanta",
    items: [
      { href: "/admin/squadre-fantasy", label: "Squadre Fanta" },
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

export default function TopBar({ initials }: { initials: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

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
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className="flex items-center gap-0.5">
              {gi > 0 && <NavDivider />}
              {group.label && (
                <span
                  className="px-2 text-[9px] font-black uppercase tracking-widest flex-shrink-0"
                  style={{ color: group.label === "Fanta" ? "var(--primary)" : "var(--text-disabled)" }}
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
                        ? { background: "var(--primary-light)", color: "var(--primary)" }
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
            style={{ background: "var(--primary)" }}
            aria-label="Menu utente"
            aria-expanded={open}
          >
            {initials}
          </button>

          {open && (
            <div
              className="absolute right-0 top-10 w-44 rounded-2xl overflow-hidden z-50"
              style={{
                background: "#fff",
                border: "1px solid var(--border-soft)",
                boxShadow: "0 8px 24px rgba(1,7,163,0.13)",
              }}
            >
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-left transition-colors hover:bg-[var(--surface-1)]"
                  style={{ color: "#991B1B" }}
                  onClick={() => setOpen(false)}
                >
                  <i className="pi pi-sign-out text-sm" />
                  Logout
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
