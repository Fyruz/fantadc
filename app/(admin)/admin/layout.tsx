import Link from "next/link";
import { requireAdmin } from "@/lib/session";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/squadre", label: "Squadre reali" },
  { href: "/admin/giocatori", label: "Giocatori" },
  { href: "/admin/partite", label: "Partite" },
  { href: "/admin/bonus-types", label: "Tipi bonus" },
  { href: "/admin/utenti", label: "Utenti" },
  { href: "/admin/squadre-fantasy", label: "Squadre fantasy" },
  { href: "/admin/audit", label: "Audit log" },
];

export default async function AdminAreaLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-zinc-900 text-white px-6 py-3 flex items-center gap-6 flex-wrap">
        <span className="font-bold text-sm tracking-wide uppercase">Fantadc Admin</span>
        <nav className="flex gap-4 flex-wrap text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-zinc-300 transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
}
