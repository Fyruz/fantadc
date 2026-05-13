"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "primereact/button";

const GV = "#3DD907";
const GV_LIGHT = "#f0fde7";

// ─── DCup ────────────────────────────────────────────────────────────────────

const DCUP_MAIN = [
  { href: "/partite", label: "PARTITE", icon: "pi-calendar" },
] as const;

const DCUP_AFTER_CLASSIFICA = [
  { href: "/squadre-fanta", label: "FANTA",   icon: "pi-trophy",  matchers: undefined },
  { href: "/dashboard",     label: "IL MIO",  icon: "pi-user",    matchers: ["/dashboard", "/squadra", "/vota"] },
] as const;

const DCUP_CLASSIFICA = [
  { href: "/classifica-torneo",    label: "Classifica squadre",   icon: "pi-list"  },
  { href: "/classifica-marcatori", label: "Classifica marcatori", icon: "pi-users" },
] as const;

const DCUP_MORE = [
  { href: "/gironi",       label: "Gironi",       icon: "pi-th-large" },
  { href: "/eliminazione", label: "Eliminazione", icon: "pi-sitemap"  },
  { href: "/giocatori",    label: "Giocatori",    icon: "pi-users"    },
  { href: "/squadre",      label: "Squadre",      icon: "pi-shield"   },
  { href: "/regolamento",  label: "Regolamento",  icon: "pi-book"     },
  { href: "/supporto",     label: "Supporto",     icon: "pi-question-circle" },
] as const;

// ─── GreenVolley ──────────────────────────────────────────────────────────────

const GV_MAIN = [
  { href: "/greenvolley",            label: "HOME",     icon: "pi-home"     },
  { href: "/greenvolley/partite",    label: "PARTITE",  icon: "pi-calendar" },
  { href: "/greenvolley/classifica", label: "CLASS.",   icon: "pi-list"     },
  { href: "/greenvolley/squadre",    label: "SQUADRE",  icon: "pi-shield"   },
] as const;

const GV_MORE = [
  { href: "/greenvolley/gironi",       label: "Gironi",       icon: "pi-th-large" },
  { href: "/greenvolley/eliminazione", label: "Eliminazione", icon: "pi-sitemap"  },
] as const;

// ─── Helper ───────────────────────────────────────────────────────────────────

function NavIndicator({ color }: { color: string }) {
  return (
    <span
      className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-b-full"
      style={{ background: color }}
    />
  );
}

export default function PublicBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [classificaOpen, setClassificaOpen] = useState(false);

  const isGV = pathname.startsWith("/greenvolley");
  const primary = isGV ? GV : "var(--primary)";

  const isActive = (href: string, matchers?: readonly string[]) => {
    if (matchers) return matchers.some((m) => pathname === m || pathname.startsWith(m + "/"));
    if (href === "/greenvolley") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const closeAll = () => { setMoreOpen(false); setClassificaOpen(false); };

  // ─── Sport Switcher (shared between drawers) ─────────────────────────────
  const SportSwitcher = () => (
    <div className="flex gap-1.5 px-4 pt-3 pb-2 border-b" style={{ borderColor: "var(--border-soft)" }}>
      <Link
        href="/"
        onClick={closeAll}
        className="flex-1 py-1.5 text-center text-[10px] font-black uppercase rounded-full"
        style={
          !isGV
            ? { background: "var(--primary-light)", color: "var(--primary)" }
            : { background: "transparent", color: "var(--text-disabled)" }
        }
      >
        DCup
      </Link>
      <Link
        href="/greenvolley"
        onClick={closeAll}
        className="flex-1 py-1.5 text-center text-[10px] font-black uppercase rounded-full"
        style={
          isGV
            ? { background: GV_LIGHT, color: GV }
            : { background: "transparent", color: "var(--text-disabled)" }
        }
      >
        GreenVolley
      </Link>
    </div>
  );

  // ─── GreenVolley bottom nav ───────────────────────────────────────────────
  if (isGV) {
    const moreIsActive = GV_MORE.some((item) => isActive(item.href));
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
            style={{ background: "#fff", borderTop: `2px solid ${GV}`, boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}
          >
            <SportSwitcher />
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
              {GV_MORE.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={active ? { background: GV_LIGHT, color: GV } : { color: "var(--text-secondary)" }}
                  >
                    <i className={`pi ${item.icon} text-base`} style={active ? { color: GV } : {}} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
          style={{
            background: "#fff",
            borderTop: `2px solid ${GV}`,
            boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="flex h-16">
            {GV_MAIN.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
                >
                  <div className="relative flex flex-col items-center">
                    {active && <NavIndicator color={GV} />}
                    <i
                      className={`pi ${item.icon} text-xl`}
                      style={{ color: active ? GV : "var(--text-disabled)" }}
                    />
                  </div>
                  <span
                    className="text-[8px] font-black uppercase tracking-wide"
                    style={{ color: active ? GV : "var(--text-disabled)" }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
            <Button
              unstyled
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5"
            >
              <i
                className="pi pi-ellipsis-h text-xl"
                style={{ color: moreIsActive || moreOpen ? GV : "var(--text-disabled)" }}
              />
              <span
                className="text-[8px] font-black uppercase tracking-wide"
                style={{ color: moreIsActive || moreOpen ? GV : "var(--text-disabled)" }}
              >
                ALTRO
              </span>
            </Button>
          </div>
        </nav>
      </>
    );
  }

  // ─── DCup bottom nav ──────────────────────────────────────────────────────
  const classificaIsActive = DCUP_CLASSIFICA.some((item) => isActive(item.href));
  const moreIsActive = DCUP_MORE.some((item) => isActive(item.href));

  return (
    <>
      {(moreOpen || classificaOpen) && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(6,7,61,0.3)" }}
          onClick={closeAll}
        />
      )}

      {/* Classifica drawer */}
      {classificaOpen && (
        <div
          className="fixed bottom-[64px] left-0 right-0 z-50 rounded-t-2xl md:hidden pb-safe"
          style={{ background: "#fff", borderTop: "2px solid var(--border-medium)", boxShadow: "0 -4px 24px rgba(1,7,163,0.12)" }}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              CLASSIFICA
            </span>
            <Button
              icon="pi pi-times"
              text
              type="button"
              onClick={() => setClassificaOpen(false)}
              className="!p-1"
              style={{ color: "var(--text-muted)" }}
              aria-label="Chiudi"
            />
          </div>
          <div className="flex flex-col gap-1 px-3 pb-4">
            {DCUP_CLASSIFICA.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setClassificaOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={active ? { background: "var(--surface-1)", color: "var(--primary)" } : { color: "var(--text-secondary)" }}
                >
                  <i className={`pi ${item.icon} text-base`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* More drawer */}
      {moreOpen && (
        <div
          className="fixed bottom-[64px] left-0 right-0 z-50 rounded-t-2xl md:hidden pb-safe"
          style={{ background: "#fff", borderTop: "2px solid var(--border-medium)", boxShadow: "0 -4px 24px rgba(1,7,163,0.12)" }}
        >
          <SportSwitcher />
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
            {DCUP_MORE.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={active ? { background: "var(--surface-1)", color: "var(--primary)" } : { color: "var(--text-secondary)" }}
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
          {/* Partite */}
          {DCUP_MAIN.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <div className="relative flex flex-col items-center">
                  {active && <NavIndicator color="var(--primary)" />}
                  <i className={`pi ${item.icon} text-xl`} style={{ color: active ? "var(--primary)" : "var(--text-disabled)" }} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-wide" style={{ color: active ? "var(--primary)" : "var(--text-disabled)" }}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Classifica drawer button */}
          <Button
            unstyled
            type="button"
            onClick={() => { setClassificaOpen((v) => !v); setMoreOpen(false); }}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
          >
            <div className="relative flex flex-col items-center">
              {classificaIsActive && <NavIndicator color="var(--primary)" />}
              <i
                className="pi pi-list text-xl"
                style={{ color: classificaIsActive || classificaOpen ? "var(--primary)" : "var(--text-disabled)" }}
              />
            </div>
            <span
              className="text-[8px] font-black uppercase tracking-wide"
              style={{ color: classificaIsActive || classificaOpen ? "var(--primary)" : "var(--text-disabled)" }}
            >
              CLASSIFICA
            </span>
          </Button>

          {/* Fanta + Il Mio */}
          {DCUP_AFTER_CLASSIFICA.map((item) => {
            const active = isActive(item.href, item.matchers);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <div className="relative flex flex-col items-center">
                  {active && <NavIndicator color="var(--primary)" />}
                  <i className={`pi ${item.icon} text-xl`} style={{ color: active ? "var(--primary)" : "var(--text-disabled)" }} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-wide" style={{ color: active ? "var(--primary)" : "var(--text-disabled)" }}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Altro */}
          <Button
            unstyled
            type="button"
            onClick={() => { setMoreOpen((v) => !v); setClassificaOpen(false); }}
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
