import { computeRankings } from "@/lib/scoring";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClassificaPublicPage() {
  const rankings = await computeRankings();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Classifica</h1>
      {rankings.length === 0 ? (
        <div className="admin-card p-8 text-center text-[#6B7280] text-sm">
          Nessun risultato ancora pubblicato.
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F8F9FC]">
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB] w-10">#</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">Squadra</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">Proprietario</th>
                <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">Punti</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r, i) => (
                <tr
                  key={r.fantasyTeamId}
                  className={`border-b border-[#F3F4F6] last:border-0 hover:bg-[#F0F1FC] transition-colors ${
                    i % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-sm text-[#9CA3AF]">{r.rank}</td>
                  <td className="px-4 py-3">
                    <Link href={`/squadre-fantasy/${r.fantasyTeamId}`} className="font-semibold text-sm text-[#0107A3] hover:underline">
                      {r.fantasyTeamName}
                    </Link>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#6B7280]">{r.userName ?? r.userEmail}</td>
                  <td className="px-4 py-3 text-right font-bold text-sm text-[#111827]">{r.totalPoints.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
