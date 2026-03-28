import { computeRankings } from "@/lib/scoring";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClassificaPublicPage() {
  const rankings = await computeRankings();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Classifica</h1>
      {rankings.length === 0 && (
        <p className="text-zinc-400 text-sm">Nessun risultato ancora pubblicato.</p>
      )}
      {rankings.length > 0 && (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-white text-left text-xs uppercase tracking-wide" style={{ backgroundColor: "var(--primary)" }}>
                <th className="py-3 px-4 w-10">#</th>
                <th className="py-3 px-4">Squadra</th>
                <th className="py-3 px-4 text-white/60">Proprietario</th>
                <th className="py-3 px-4 text-right">Punti</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r, i) => (
                <tr key={r.fantasyTeamId} className={`border-b last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-zinc-50"}`}>
                  <td className="py-3 px-4 font-mono text-zinc-400">{r.rank}</td>
                  <td className="py-3 px-4">
                    <Link href={`/squadre-fantasy/${r.fantasyTeamId}`} className="font-semibold hover:underline" style={{ color: "var(--primary)" }}>
                      {r.fantasyTeamName}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-zinc-500 text-xs">{r.userName ?? r.userEmail}</td>
                  <td className="py-3 px-4 text-right font-bold text-lg">{r.totalPoints.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
