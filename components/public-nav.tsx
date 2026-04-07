import Link from "next/link";
import { Button } from "primereact/button";
import { getCurrentUser } from "@/lib/session";
import { signOut } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/partite",         label: "Partite"   },
  { href: "/squadre",         label: "Squadre"   },
  { href: "/giocatori",       label: "Giocatori" },
  { href: "/squadre-fantasy", label: "Fanta"      },
  { href: "/classifica",      label: "Classifica"},
  { href: "/regolamento",     label: "Regolamento"},
];

export default async function PublicNav() {
  const user = await getCurrentUser();

  return (
    <header
      className="sticky top-0 z-30"
      style={{ background: "#fff", borderBottom: "1px solid var(--border-soft)", boxShadow: "0 1px 8px rgba(1,7,163,0.06)" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: "var(--primary)" }}
          >
            ⚽
          </div>
          <span
            className="font-display font-black text-[15px] uppercase tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            FANTA<span style={{ color: "var(--primary)" }}>DC</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 px-4">
          {NAV_LINKS.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors hover:bg-[var(--surface-1)]"
              style={{ color: "var(--text-muted)" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm font-semibold transition-colors px-2 hover:text-[var(--primary)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="text-sm font-semibold transition-colors px-2 hover:text-[var(--primary)]"
                style={{ color: "var(--text-muted)" }}
              >
                Dashboard
              </Link>
              <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                <Button
                  type="submit"
                  unstyled
                  className="text-xs px-3 py-1.5 rounded-full font-bold border uppercase tracking-wide transition-colors hover:bg-[var(--surface-1)]"
                  style={{ borderColor: "var(--border-medium)", color: "var(--text-secondary)" }}
                  label="ESCI"
                />
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold transition-colors px-2 hover:text-[var(--primary)]"
                style={{ color: "var(--text-muted)" }}
              >
                Accedi
              </Link>
              <Link
                href="/register"
                className="text-xs px-4 py-2 rounded-full font-black uppercase tracking-wide transition-colors hover:opacity-90"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                REGISTRATI
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
