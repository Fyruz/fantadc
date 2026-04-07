import { computeRankings } from "@/lib/scoring";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SquadreFantasyPublicPage() {
  const rankings = await computeRankings();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="over-label mb-1">Stagione 2025</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          SQUADRE FANTA
        </h1>
      </div>
      {rankings.length === 0 && (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessuna squadra fanta registrata.
        </div>
      )}
      {rankings.length > 0 && (
        <div className="flex flex-col gap-2">
          {rankings.map((r) => (
            <Link
              key={r.fantasyTeamId}
              href={`/squadre-fanta/${r.fantasyTeamId}`}
              className="card px-5 py-4 flex items-center justify-between hover:bg-[var(--surface-1)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                  style={{ background: "var(--primary)" }}
                >
                  #{r.rank}
                </span>
                <div>
                  <div className="font-display font-black text-[14px] uppercase" style={{ color: "var(--text-primary)" }}>
                    {r.fantasyTeamName}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {r.userName ?? r.userEmail}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-display font-black text-lg" style={{ color: "var(--text-primary)" }}>
                    {r.totalPoints.toFixed(1)}
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>punti</div>
                </div>
                <i className="pi pi-chevron-right text-xs" style={{ color: "var(--text-disabled)" }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
