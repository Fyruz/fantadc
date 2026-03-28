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

          {/* Altro button */}
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
