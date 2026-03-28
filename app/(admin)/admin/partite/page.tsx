import Link from "next/link";
import { db } from "@/lib/db";
import { deleteMatch } from "@/app/actions/admin/matches";

export default async function PartitePage() {
  const matches = await db.match.findMany({
    orderBy: { startsAt: "desc" },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Partite</h1>
        <Link href="/admin/partite/new" className="btn-primary">+ Nuova partita</Link>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left text-zinc-500">
            <th className="py-2 pr-4">Partita</th>
            <th className="py-2 pr-4">Data</th>
            <th className="py-2 pr-4">Stato</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => (
            <tr key={m.id} className="border-b hover:bg-zinc-50">
              <td className="py-2 pr-4 font-medium">{m.homeTeam.name} vs {m.awayTeam.name}</td>
              <td className="py-2 pr-4 text-zinc-500">{m.startsAt.toLocaleDateString("it-IT")}</td>
              <td className="py-2 pr-4">
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">{m.status}</span>
              </td>
              <td className="py-2 flex gap-3">
                <Link href={`/admin/partite/${m.id}`} className="text-blue-600 hover:underline">Dettaglio</Link>
                <form action={deleteMatch as unknown as (fd: FormData) => void}>
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" className="text-red-500 hover:underline" onClick={(e) => { if (!confirm("Eliminare la partita?")) e.preventDefault(); }}>
                    Elimina
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {matches.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-zinc-400">Nessuna partita</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
