"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "primereact/button";

const GV = "#3DD907";
const GV_LIGHT = "#f0fde7";
const PRIMARY = "var(--text-primary)";

const DCUP_MORE = [
  { href: "/partite",               label: "Partite",      icon: "pi-calendar"       },
  { href: "/classifica-torneo",     label: "Class. squadre", icon: "pi-list"         },
  { href: "/classifica-marcatori",  label: "Marcatori",    icon: "pi-users"           },
  { href: "/gironi",                label: "Gironi",       icon: "pi-th-large"        },
  { href: "/eliminazione",          label: "Eliminazione", icon: "pi-sitemap"         },
  { href: "/giocatori",             label: "Giocatori",    icon: "pi-users"           },
  { href: "/squadre",               label: "Squadre",      icon: "pi-shield"          },
  { href: "/regolamento",           label: "Regolamento",  icon: "pi-book"            },
  { href: "/supporto",              label: "Supporto",     icon: "pi-question-circle" },
] as const;

const GV_MORE = [
  { href: "/greenvolley/gironi",       label: "Gironi",       icon: "pi-th-large" },
  { href: "/greenvolley/eliminazione", label: "Eliminazione", icon: "pi-sitemap"  },
  { href: "/contatti",                 label: "Contatti",     icon: "pi-envelope" },
] as const;

// CSS filter che converte black → var(--text-primary) #09144C
const FILTER_PRIMARY = "invert(9%) sepia(50%) saturate(1800%) hue-rotate(210deg) brightness(55%) contrast(110%)";

function NavIcon({ src, active, color = "primary" }: { src: string; active: boolean; color?: "primary" | "gv" }) {
  return (
    <img
      src={src}
      width={24}
      height={24}
      alt=""
      style={{
        filter: active ? (color === "gv" ? "invert(48%) sepia(95%) saturate(500%) hue-rotate(76deg) brightness(105%)" : FILTER_PRIMARY) : "none",
        opacity: active ? 1 : 0.45,
      }}
    />
  );
}

const NAV_STYLE = {
  background: "rgba(255,255,255,0.80)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  borderTop: "1px solid rgba(9,20,76,0.05)",
  boxShadow: "0 -4px 20px rgba(9,20,76,0.10)",
  paddingBottom: "env(safe-area-inset-bottom)",
} as React.CSSProperties;

export default function PublicBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isGV = pathname.startsWith("/greenvolley");

  if (pathname.startsWith("/vota") || /^\/partite\/\d+/.test(pathname) || (pathname.startsWith("/squadre") && !pathname.startsWith("/squadre-fanta")) || pathname.startsWith("/gironi") || pathname.startsWith("/classifica-marcatori")) return null;

  const isActive = (href: string, matchers?: readonly string[]) => {
    if (matchers) return matchers.some((m) => pathname === m || pathname.startsWith(m + "/"));
    if (href === "/" || href === "/greenvolley") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navItemStyle = (active: boolean, color = PRIMARY) => ({
    color: active ? color : "rgba(0,0,0,0.55)",
    fontWeight: active ? 500 : 400,
  });

  // ─── GreenVolley ────────────────────────────────────────────────────────────
  if (isGV) {
    const GV_MAIN = [
      { href: "/greenvolley",            label: "Home",      icon: "pi-home"     },
      { href: "/greenvolley/partite",    label: "Partite",   icon: "pi-calendar" },
      { href: "/greenvolley/classifica", label: "Classifica",icon: "pi-list"     },
      { href: "/greenvolley/squadre",    label: "Squadre",   icon: "pi-shield"   },
    ] as const;
    const moreIsActive = GV_MORE.some((item) => isActive(item.href));

    return (
      <>
        {moreOpen && (
          <div className="fixed inset-0 z-40 md:hidden" style={{ background: "rgba(6,7,61,0.3)" }} onClick={() => setMoreOpen(false)} />
        )}
        {moreOpen && (
          <div className="fixed bottom-16 left-0 right-0 z-50 rounded-t-2xl md:hidden" style={{ background: "#fff", borderTop: `2px solid ${GV}`, boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}>
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>ALTRO</span>
              <Button icon="pi pi-times" text type="button" onClick={() => setMoreOpen(false)} className="p-1!" style={{ color: "var(--text-muted)" }} aria-label="Chiudi" />
            </div>
            <div className="flex flex-col gap-1 px-3 pb-4">
              {GV_MORE.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={active ? { background: GV_LIGHT, color: GV } : { color: "var(--text-secondary)" }}>
                    <i className={`pi ${item.icon} text-base`} style={active ? { color: GV } : {}} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden" style={{ ...NAV_STYLE, borderTop: `2px solid ${GV}` }}>
          <div className="flex h-16 px-1">
            {GV_MAIN.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} className="flex flex-1 flex-col items-center justify-center gap-1.5 px-2 py-1">
                  <i className={`pi ${item.icon} text-2xl`} style={navItemStyle(active, GV)} />
                  <span className="text-[10px] text-center" style={navItemStyle(active, GV)}>{item.label}</span>
                </Link>
              );
            })}
            <Button unstyled type="button" onClick={() => setMoreOpen((v) => !v)} className="flex flex-1 flex-col items-center justify-center gap-1.5 px-2 py-1">
              <i className="pi pi-ellipsis-h text-2xl" style={navItemStyle(moreIsActive || moreOpen, GV)} />
              <span className="text-[10px]" style={navItemStyle(moreIsActive || moreOpen, GV)}>Altro</span>
            </Button>
          </div>
        </nav>
      </>
    );
  }

  // ─── DCup ───────────────────────────────────────────────────────────────────
  const moreIsActive = pathname.startsWith("/altro");

  const DCUP_MAIN = [
    { href: "/",             label: "Home",   icon: "home",     matchers: undefined          },
    { href: "/partite",      label: "Partite",icon: "football_field", matchers: undefined    },
    { href: "/squadre-fanta",label: "Fanta",  icon: "shirt",    matchers: undefined          },
    { href: "/dashboard",    label: "Il mio", icon: "account",  matchers: ["/dashboard", "/squadra"] },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden" style={NAV_STYLE}>
      <div className="flex px-1 py-2.5">
        {DCUP_MAIN.map((item) => {
          const active = isActive(item.href, item.matchers);
          return (
            <Link key={item.href} href={item.href} className="flex flex-1 flex-col items-center justify-center gap-1.5 px-2 py-1">
              <NavIcon src={`/icons/${item.icon}.svg`} active={active} />
              <span className="text-[10px] text-center" style={navItemStyle(active)}>{item.label}</span>
            </Link>
          );
        })}
        <Link href="/altro" className="flex flex-1 flex-col items-center justify-center gap-1.5 px-2 py-1">
          <NavIcon src="/icons/more.svg" active={moreIsActive} />
          <span className="text-[10px]" style={navItemStyle(moreIsActive)}>Altro</span>
        </Link>
      </div>
    </nav>
  );
}
