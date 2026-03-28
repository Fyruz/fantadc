import { computeRankings } from "@/lib/scoring";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SquadreFantasyPublicPage() {
  const rankings = await computeRankings();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Squadre Fantasy</h1>
      {rankings.length === 0 && (
        <p className="text-zinc-400 text-sm">Nessuna squadra fantasy registrata.</p>
      )}
      {rankings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {rankings.map((r) => (
            <Link
              key={r.fantasyTeamId}
              href={`/squadre-fantasy/${r.fantasyTeamId}`}
              className="border rounded-xl p-4 hover:bg-zinc-50 transition-colors flex flex-col gap-2 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="font-bold text-base group-hover:underline"
                    style={{ color: "var(--primary)" }}
                  >
                    {r.fantasyTeamName}
                  </p>
                  <p className="text-xs text-zinc-400">{r.userName ?? r.userEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{r.totalPoints.toFixed(1)}</p>
                  <p className="text-xs text-zinc-400">punti</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  #{r.rank}
                </span>
                <span className="text-xs text-zinc-400">in classifica</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
