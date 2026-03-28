import Link from "next/link";
import { db } from "@/lib/db";

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
        select: { id: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } }, status: true },
        orderBy: { startsAt: "desc" },
      }),
      db.user.count({ where: { fantasyTeam: null } }),
    ]);

  const stats = [
    { label: "Squadre reali", value: teams, href: "/admin/squadre" },
    { label: "Giocatori", value: players, href: "/admin/giocatori" },
    { label: "Partite", value: matches, href: "/admin/partite" },
    { label: "Utenti", value: users, href: "/admin/utenti" },
    { label: "Squadre fantasy", value: fantasyTeams, href: "/admin/squadre-fantasy" },
  ];

  const hasAnomalies = concludedNoPlayers.length > 0 || usersNoTeam > 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="border rounded-lg p-4 hover:bg-zinc-50 transition-colors"
            >
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-zinc-500 mt-1">{s.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {hasAnomalies && (
        <div>
          <h2 className="text-base font-semibold mb-3">Anomalie da verificare</h2>
          <div className="flex flex-col gap-3">
            {concludedNoPlayers.map((m) => (
              <div
                key={m.id}
                className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    {m.homeTeam.name} vs {m.awayTeam.name}
                  </p>
                  <p className="text-xs text-orange-600">
                    {m.status === "CONCLUDED"
                      ? "Partita conclusa senza giocatori — aggiungi i partecipanti prima di pubblicare"
                      : "Partita pubblicata senza giocatori — i punteggi non saranno calcolati"}
                  </p>
                </div>
                <Link
                  href={`/admin/partite/${m.id}`}
                  className="text-xs text-orange-700 underline shrink-0 ml-4"
                >
                  Gestisci →
                </Link>
              </div>
            ))}

            {usersNoTeam > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  <span className="font-bold">{usersNoTeam}</span>{" "}
                  {usersNoTeam === 1
                    ? "utente registrato senza squadra fantasy"
                    : "utenti registrati senza squadra fantasy"}
                </p>
                <Link href="/admin/utenti" className="text-xs text-blue-700 underline shrink-0 ml-4">
                  Vedi utenti →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
