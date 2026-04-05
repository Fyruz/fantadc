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
  { href: "/admin/squadre-fantasy", label: "Squadre Fanta" },
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
