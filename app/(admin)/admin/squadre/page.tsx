import Link from "next/link";
import { db } from "@/lib/db";
import { deleteFootballTeam } from "@/app/actions/admin/football-teams";

export default async function SquadrePage() {
  const teams = await db.footballTeam.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Squadre reali</h1>
        <Link href="/admin/squadre/new" className="btn-primary">+ Nuova squadra</Link>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left text-zinc-500">
            <th className="py-2 pr-4">Nome</th>
            <th className="py-2 pr-4">Abbreviazione</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.id} className="border-b hover:bg-zinc-50">
              <td className="py-2 pr-4 font-medium">{t.name}</td>
              <td className="py-2 pr-4 text-zinc-500">{t.shortName ?? "—"}</td>
              <td className="py-2 flex gap-3">
                <Link href={`/admin/squadre/${t.id}/edit`} className="text-blue-600 hover:underline">Modifica</Link>
                <form action={deleteFootballTeam as unknown as (fd: FormData) => void}>
                  <input type="hidden" name="id" value={t.id} />
                  <button type="submit" className="text-red-500 hover:underline" onClick={(e) => { if (!confirm("Eliminare la squadra?")) e.preventDefault(); }}>
                    Elimina
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {teams.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-zinc-400">Nessuna squadra</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
