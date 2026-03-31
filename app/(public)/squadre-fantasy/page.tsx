import { computeRankings } from "@/lib/scoring";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SquadreFantasyPublicPage() {
  const rankings = await computeRankings();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Squadre Fantasy</h1>
      {rankings.length === 0 && (
        <div className="admin-card p-8 text-center text-[#6B7280] text-sm">
          Nessuna squadra fantasy registrata.
        </div>
      )}
      {rankings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {rankings.map((r) => (
            <Link
              key={r.fantasyTeamId}
              href={`/squadre-fantasy/${r.fantasyTeamId}`}
              className="admin-card p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-px transition-all duration-150 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-sm text-[#0107A3] group-hover:underline">
                    {r.fantasyTeamName}
                  </p>
                  <p className="text-xs text-[#6B7280]">{r.userName ?? r.userEmail}</p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full text-white bg-[#0107A3] flex-shrink-0">
                  #{r.rank}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">{r.totalPoints.toFixed(1)}</p>
                <p className="text-xs text-[#6B7280]">punti</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
