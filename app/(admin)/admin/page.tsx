import Link from "next/link";
import { db } from "@/lib/db";
import StatCard from "@/components/stat-card";

export default async function AdminDashboardPage() {
  const [teams, players, matches, users, fantasyTeams, concludedNoPlayers, usersNoTeam] =
    await Promise.all([
      db.footballTeam.count(),
      db.player.count(),
      db.match.count(),
      db.user.count(),
      db.fantasyTeam.count(),
      db.match.findMany({
        where: {
          status: { in: ["CONCLUDED", "PUBLISHED"] },
          players: { none: {} },
        },
        select: {
          id: true,
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
          status: true,
        },
        orderBy: { startsAt: "desc" },
      }),
      db.user.count({ where: { fantasyTeam: null } }),
    ]);

  const stats = [
    { label: "Squadre reali",   value: teams,        href: "/admin/squadre",         icon: "pi-shield"   },
    { label: "Giocatori",       value: players,      href: "/admin/giocatori",        icon: "pi-users"    },
    { label: "Partite",         value: matches,      href: "/admin/partite",          icon: "pi-calendar" },
    { label: "Utenti",          value: users,        href: "/admin/utenti",           icon: "pi-id-card"  },
    { label: "Squadre fantasy", value: fantasyTeams, href: "/admin/squadre-fantasy",  icon: "pi-trophy"   },
  ];

  const hasAnomalies = concludedNoPlayers.length > 0 || usersNoTeam > 0;

  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-[#111827]">Dashboard</h1>
        <span className="text-sm text-[#6B7280] capitalize hidden sm:block">{today}</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <StatCard key={s.href} value={s.value} label={s.label} href={s.href} icon={s.icon} />
        ))}
      </div>

      {/* Anomalie / Tutto ok */}
      {hasAnomalies ? (
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#111827] mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Da verificare
          </h2>
          <div className="flex flex-col gap-3">
            {concludedNoPlayers.map((m) => (
              <div
                key={m.id}
                className="bg-[#FFFBEB] border border-amber-200 border-l-[3px] border-l-amber-500 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-medium text-[#111827]">
                    {m.homeTeam.name} vs {m.awayTeam.name}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {m.status === "CONCLUDED"
                      ? "Partita conclusa senza giocatori — aggiungi i partecipanti prima di pubblicare"
                      : "Partita pubblicata senza giocatori — i punteggi non saranno calcolati"}
                  </p>
                </div>
                <Link
                  href={`/admin/partite/${m.id}`}
                  className="text-xs font-medium text-[#0107A3] hover:underline flex-shrink-0"
                >
                  Gestisci →
                </Link>
              </div>
            ))}

            {usersNoTeam > 0 && (
              <div className="bg-[#EFF6FF] border border-blue-200 border-l-[3px] border-l-blue-500 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                <p className="text-sm text-[#111827]">
                  <span className="font-bold">{usersNoTeam}</span>{" "}
                  {usersNoTeam === 1
                    ? "utente registrato senza squadra fantasy"
                    : "utenti registrati senza squadra fantasy"}
                </p>
                <Link
                  href="/admin/utenti"
                  className="text-xs font-medium text-[#0107A3] hover:underline flex-shrink-0"
                >
                  Vedi utenti →
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5 text-sm font-medium w-fit">
          <i className="pi pi-check-circle text-sm" />
          Tutto ok
        </div>
      )}
    </div>
  );
}
