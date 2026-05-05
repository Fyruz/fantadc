import { db } from "@/lib/db";
import Link from "next/link";

export default async function GreenVolleyDashboard() {
  const [teamCount, playerCount, matchCount, concludedCount] = await Promise.all([
    db.volleyTeam.count(),
    db.volleyPlayer.count(),
    db.volleyMatch.count(),
    db.volleyMatch.count({ where: { status: "CONCLUDED" } }),
  ]);

  const stats = [
    { label: "Squadre", value: teamCount, href: "/admin/greenvolley/squadre", icon: "pi-shield" },
    { label: "Giocatori", value: playerCount, href: "/admin/greenvolley/giocatori", icon: "pi-users" },
    { label: "Partite", value: matchCount, href: "/admin/greenvolley/partite", icon: "pi-calendar" },
    { label: "Concluse", value: concludedCount, href: "/admin/greenvolley/partite", icon: "pi-check-circle" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div
          className="text-[10px] font-black uppercase tracking-widest mb-1"
          style={{ color: "#3DD907" }}
        >
          GreenVolley
        </div>
        <h1 className="font-display font-black text-2xl uppercase">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Link
            key={s.href + s.label}
            href={s.href}
            className="admin-card p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2" style={{ color: "#3DD907" }}>
              <i className={`pi ${s.icon}`} />
              <span className="text-xs font-black uppercase tracking-wide">
                {s.label}
              </span>
            </div>
            <div className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              {s.value}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
