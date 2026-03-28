import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [teams, players, matches, users, fantasyTeams] = await Promise.all([
    db.footballTeam.count(),
    db.player.count(),
    db.match.count(),
    db.user.count(),
    db.fantasyTeam.count(),
  ]);

  const stats = [
    { label: "Squadre reali", value: teams, href: "/admin/squadre" },
    { label: "Giocatori", value: players, href: "/admin/giocatori" },
    { label: "Partite", value: matches, href: "/admin/partite" },
    { label: "Utenti", value: users, href: "/admin/utenti" },
    { label: "Squadre fantasy", value: fantasyTeams, href: "/admin/squadre-fantasy" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="border rounded-lg p-4 hover:bg-zinc-50 transition-colors">
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-zinc-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
