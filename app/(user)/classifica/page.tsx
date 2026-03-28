import Link from "next/link";
import { computeRankings } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function ClassificaPage() {
  const rankings = await computeRankings();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Classifica</h1>
      {rankings.length === 0 && (
        <p className="text-zinc-400 text-sm">Nessun risultato ancora pubblicato.</p>
      )}
      {rankings.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="py-2 pr-3 w-8">#</th>
              <th className="py-2 pr-4">Squadra</th>
              <th className="py-2 pr-4 text-zinc-400">Proprietario</th>
              <th className="py-2 text-right font-semibold">Punti</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((r) => (
              <tr key={r.fantasyTeamId} className="border-b hover:bg-zinc-50">
                <td className="py-3 pr-3 text-zinc-400 font-mono">{r.rank}</td>
                <td className="py-3 pr-4 font-semibold">{r.fantasyTeamName}</td>
                <td className="py-3 pr-4 text-zinc-500 text-xs">{r.userName ?? r.userEmail}</td>
                <td className="py-3 text-right font-bold text-lg">{r.totalPoints.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-6">
        <Link href="/dashboard" className="btn-secondary">← Dashboard</Link>
      </div>
    </div>
  );
}
