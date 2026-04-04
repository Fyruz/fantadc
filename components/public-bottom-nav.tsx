"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "primereact/button";

type MainNavItem = {
  href: string;
  label: string;
  icon: string;
  matchers?: readonly string[];
};

const MAIN_NAV: readonly MainNavItem[] = [
  { href: "/partite",   label: "PARTITE",   icon: "pi-calendar" },
  { href: "/classifica",label: "CLASS.",    icon: "pi-list"     },
  { href: "/squadre-fantasy", label: "FANTASY", icon: "pi-shield" },
  {
    href: "/dashboard",
    label: "IL MIO",
    icon: "pi-user",
    matchers: ["/dashboard", "/squadra", "/vota"],
  },
] as const;

const MORE_NAV = [
  { href: "/giocatori",  label: "Giocatori",    icon: "pi-users" },
  { href: "/squadre",    label: "Squadre reali", icon: "pi-shield" },
  { href: "/regolamento",label: "Regolamento",  icon: "pi-book"  },
] as const;

export default function PublicBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string, matchers?: readonly string[]) => {
    if (matchers) return matchers.some((m) => pathname.startsWith(m));
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  const moreIsActive = MORE_NAV.some((item) => isActive(item.href));

  return (
    <>
      {/* Overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(6,7,61,0.3)" }}
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More drawer */}
      {moreOpen && (
        <div
          className="fixed bottom-[64px] left-0 right-0 z-50 rounded-t-2xl md:hidden pb-safe"
          style={{ background: "#fff", borderTop: "2px solid var(--border-medium)", boxShadow: "0 -4px 24px rgba(1,7,163,0.12)" }}
        >
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
            {MORE_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={
                    active
                      ? { background: "var(--surface-1)", color: "var(--primary)" }
                      : { color: "var(--text-secondary)" }
                  }
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
                    <span
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-b-full"
                      style={{ background: "var(--primary)" }}
                    />
                  )}
                  <i
                    className={`pi ${item.icon} text-xl`}
                    style={{ color: active ? "var(--primary)" : "var(--text-disabled)" }}
                  />
                </div>
                <span
                  className="text-[8px] font-black uppercase tracking-wide"
                  style={{ color: active ? "var(--primary)" : "var(--text-disabled)" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Altro */}
          <Button
            unstyled
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
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
