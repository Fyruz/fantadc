"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "primereact/button";

const MAIN_NAV = [
  { href: "/admin",           label: "DASHBOARD", icon: "pi-home"     },
  { href: "/admin/partite",   label: "PARTITE",   icon: "pi-calendar" },
  { href: "/admin/giocatori", label: "GIOCATORI", icon: "pi-users"    },
  { href: "/admin/squadre",   label: "SQUADRE",   icon: "pi-shield"   },
];

const MORE_NAV = [
  { href: "/admin/utenti",           label: "Utenti",          icon: "pi-id-card" },
  { href: "/admin/bonus-types",      label: "Tipi bonus",      icon: "pi-star"    },
  { href: "/admin/squadre-fantasy",  label: "Squadre Fanta",   icon: "pi-trophy"  },
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
          style={{ background: "#fff", borderTop: "2px solid var(--border-medium)", boxShadow: "0 -4px 24px rgba(1,7,163,0.12)" }}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              ALTRO
            </span>
            <Button
              icon="pi pi-times"
              text
              onClick={() => setMoreOpen(false)}
              className="!p-1"
              style={{ color: "var(--text-muted)" }}
              aria-label="Chiudi"
            />
          </div>
          <div className="grid grid-cols-2 gap-1 px-3 pb-4">
            {MORE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                style={
                  isActive(item.href)
                    ? { background: "var(--surface-1)", color: "var(--primary)" }
                    : { color: "var(--text-secondary)" }
                }
              >
                <i className={`pi ${item.icon} text-base`} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

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
            const active = isActive(item.href);
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

          <Button
            unstyled
            onClick={() => setMoreOpen((v) => !v)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5"
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
