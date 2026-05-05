"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/greenvolley",             label: "Home",        exact: true  },
  { href: "/greenvolley/partite",     label: "Partite",     exact: false },
  { href: "/greenvolley/classifica",  label: "Classifica",  exact: false },
  { href: "/greenvolley/gironi",      label: "Gironi",      exact: false },
  { href: "/greenvolley/eliminazione",label: "Eliminazione",exact: false },
  { href: "/greenvolley/squadre",     label: "Squadre",     exact: false },
  { href: "/greenvolley/giocatori",   label: "Giocatori",   exact: false },
];

export default function GreenVolleySubNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <div
      className="sticky top-14 z-20 overflow-x-auto scrollbar-none"
      style={{ background: "#fff", borderBottom: "2px solid #3DD907" }}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-0.5 h-10 min-w-max">
        {LINKS.map((link) => {
          const active = isActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap transition-colors"
              style={
                active
                  ? { background: "#f0fde7", color: "#3DD907" }
                  : { color: "var(--text-muted)" }
              }
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
