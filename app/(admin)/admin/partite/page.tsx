import Link from "next/link";
import { db } from "@/lib/db";
import { deleteMatch } from "@/app/actions/admin/matches";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
  PUBLISHED: "Pubblicata",
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "badge-draft",
  SCHEDULED: "badge-scheduled",
  CONCLUDED: "badge-concluded",
  PUBLISHED: "badge-published",
};

export default async function PartitePage() {
  const matches = await db.match.findMany({
    orderBy: { startsAt: "desc" },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      _count: { select: { players: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Partite</h1>
        <Link href="/admin/partite/new" className="btn-primary">
          + Nuova partita
        </Link>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left text-zinc-500">
            <th className="py-2 pr-4">Partita</th>
            <th className="py-2 pr-4">Data</th>
            <th className="py-2 pr-4">Stato</th>
            <th className="py-2 pr-4 text-right">Giocatori</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => {
            const playerCount = m._count.players;
            const isAnomaly =
              (m.status === "CONCLUDED" || m.status === "PUBLISHED") && playerCount === 0;
            return (
              <tr key={m.id} className={`border-b hover:bg-zinc-50 ${isAnomaly ? "bg-orange-50" : ""}`}>
                <td className="py-2 pr-4 font-medium">
                  {m.homeTeam.name} vs {m.awayTeam.name}
                  {isAnomaly && (
                    <span className="ml-2 text-xs text-orange-600">⚠ no giocatori</span>
                  )}
                </td>
                <td className="py-2 pr-4 text-zinc-500">{m.startsAt.toLocaleDateString("it-IT")}</td>
                <td className="py-2 pr-4">
                  <span className={STATUS_BADGE[m.status] ?? "badge-draft"}>
                    {STATUS_LABEL[m.status] ?? m.status}
                  </span>
                </td>
                <td className="py-2 pr-4 text-right text-zinc-500 tabular-nums">{playerCount}</td>
                <td className="py-2 flex gap-3">
                  <Link href={`/admin/partite/${m.id}`} className="text-blue-600 hover:underline">
                    Gestisci
                  </Link>
                  <form action={deleteMatch as unknown as (fd: FormData) => void}>
                    <input type="hidden" name="id" value={m.id} />
                    <button
                      type="submit"
                      className="text-red-500 hover:underline"
                      onClick={(e) => {
                        if (!confirm("Eliminare la partita? L'operazione è irreversibile."))
                          e.preventDefault();
                      }}
                    >
                      Elimina
                    </button>
                  </form>
                </td>
              </tr>
            );
          })}
          {matches.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-zinc-400">
                Nessuna partita
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
