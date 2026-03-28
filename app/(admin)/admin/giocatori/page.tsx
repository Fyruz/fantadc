import Link from "next/link";
import { db } from "@/lib/db";
import { deletePlayer } from "@/app/actions/admin/players";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

export default async function GiocatoriPage() {
  const players = await db.player.findMany({
    orderBy: [{ footballTeam: { name: "asc" } }, { name: "asc" }],
    include: { footballTeam: { select: { name: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Giocatori</h1>
        <Link href="/admin/giocatori/new" className="btn-primary">+ Nuovo giocatore</Link>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left text-zinc-500">
            <th className="py-2 pr-4">Nome</th>
            <th className="py-2 pr-4">Ruolo</th>
            <th className="py-2 pr-4">Squadra</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className="border-b hover:bg-zinc-50">
              <td className="py-2 pr-4 font-medium">{p.name}</td>
              <td className="py-2 pr-4 text-zinc-500">{p.role}</td>
              <td className="py-2 pr-4 text-zinc-500">{p.footballTeam.name}</td>
              <td className="py-2 flex gap-3">
                <Link href={`/admin/giocatori/${p.id}/edit`} className="text-blue-600 hover:underline">Modifica</Link>
                <ConfirmDeleteForm
                  action={deletePlayer}
                  hiddenInputs={{ id: p.id }}
                  confirmMessage="Eliminare il giocatore?"
                  buttonClassName="text-red-500 hover:underline"
                />
              </td>
            </tr>
          ))}
          {players.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-zinc-400">Nessun giocatore</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
