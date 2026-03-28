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
