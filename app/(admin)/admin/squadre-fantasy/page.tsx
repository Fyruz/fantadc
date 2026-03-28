import Link from "next/link";
import { db } from "@/lib/db";

export default async function SquadreFantasyPage() {
  const teams = await db.fantasyTeam.findMany({
    orderBy: { name: "asc" },
    include: {
      user: { select: { email: true } },
      _count: { select: { players: true } },
    },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Squadre fantasy</h1>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left text-zinc-500">
            <th className="py-2 pr-4">Nome</th>
            <th className="py-2 pr-4">Utente</th>
            <th className="py-2 pr-4">Giocatori</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.id} className="border-b hover:bg-zinc-50">
              <td className="py-2 pr-4 font-medium">{t.name}</td>
              <td className="py-2 pr-4 text-zinc-500">{t.user.email}</td>
              <td className="py-2 pr-4 text-zinc-500">{t._count.players}/5</td>
              <td className="py-2">
                <Link href={`/admin/squadre-fantasy/${t.id}`} className="text-blue-600 hover:underline">Gestisci</Link>
              </td>
            </tr>
          ))}
          {teams.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-zinc-400">Nessuna squadra fantasy</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
