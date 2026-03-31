import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { signOut } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/partite", label: "Partite" },
  { href: "/squadre", label: "Squadre" },
  { href: "/giocatori", label: "Giocatori" },
  { href: "/squadre-fantasy", label: "Squadre Fantasy" },
  { href: "/classifica", label: "Classifica" },
  { href: "/regolamento", label: "Regolamento" },
];

export default async function PublicNav() {
  const user = await getCurrentUser();

  return (
    <header style={{ backgroundColor: "var(--primary)" }} className="text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
          <span className="text-yellow-400">⚽</span> Fantadc
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-wrap">
          {NAV_LINKS.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-1.5 rounded text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="text-sm text-white/80 hover:text-white transition-colors px-2">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="text-sm text-white/80 hover:text-white transition-colors px-2">
                Dashboard
              </Link>
              <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                <button type="submit" className="btn-outline-primary text-xs px-3 py-1.5">
                  Esci
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-white/80 hover:text-white transition-colors px-2">
                Accedi
              </Link>
              <Link href="/register" className="btn-outline-primary text-xs px-3 py-1.5">
                Registrati
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
