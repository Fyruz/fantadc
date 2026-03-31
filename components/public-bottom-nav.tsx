"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type MainNavItem = {
  href: string;
  label: string;
  icon: string;
  matchers?: readonly string[];
};

const MAIN_NAV: readonly MainNavItem[] = [
  { href: "/partite", label: "Partite", icon: "pi-calendar" },
  { href: "/classifica", label: "Classifica", icon: "pi-list" },
  { href: "/squadre-fantasy", label: "Fantasy", icon: "pi-shield" },
  {
    href: "/dashboard",
    label: "Il mio",
    icon: "pi-user",
    matchers: ["/dashboard", "/squadra", "/vota"],
  },
] as const;

const MORE_NAV = [
  { href: "/giocatori", label: "Giocatori", icon: "pi-users" },
  { href: "/squadre", label: "Squadre reali", icon: "pi-shield" },
  { href: "/regolamento", label: "Regolamento", icon: "pi-book" },
] as const;

export default function PublicBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string, matchers?: readonly string[]) => {
    if (matchers) {
      return matchers.some((matcher) => pathname.startsWith(matcher));
    }

    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  const moreIsActive = MORE_NAV.some((item) => isActive(item.href));

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {moreOpen && (
        <div className="fixed bottom-[64px] left-0 right-0 z-50 rounded-t-2xl border-t border-[#E5E7EB] bg-white shadow-lg md:hidden pb-safe">
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-sm font-semibold text-[#111827]">Altro</span>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="p-1 text-[#6B7280]"
              aria-label="Chiudi"
            >
              <i className="pi pi-times text-sm" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-1 px-3 pb-4">
            {MORE_NAV.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#E8E9F8] text-[#0107A3]"
                      : "text-[#374151] hover:bg-[#F8F9FC]"
                  }`}
                >
                  <i className={`pi ${item.icon} text-base`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E5E7EB] bg-white md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex h-16">
          {MAIN_NAV.map((item) => {
            const active = isActive(item.href, item.matchers);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <div className="relative flex flex-col items-center">
                  {active && (
                    <span className="absolute -top-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-[#0107A3]" />
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

          <button
            type="button"
            onClick={() => setMoreOpen((current) => !current)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
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