import Link from "next/link";
import { computeRankings } from "@/lib/scoring";
import { getCurrentUser } from "@/lib/session";
export const dynamic = 'force-dynamic'


export const revalidate = 60;

export default async function SquadreFantasyPublicPage() {
  const [rankings, user] = await Promise.all([computeRankings(), getCurrentUser()]);

  if (rankings.length === 0) {
    return (
      <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>
        Nessuna squadra fanta registrata.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Column headers */}
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: "1px solid rgba(9,20,76,0.1)" }}
      >
        <span className="text-xs uppercase" style={{ color: "rgba(0,0,0,0.65)" }}>Rank</span>
        <span className="text-xs uppercase" style={{ color: "rgba(0,0,0,0.65)" }}>P.ti totali</span>
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {rankings.map((r, idx) => {
          const isMe = user?.email === r.userEmail;
          return (
            <Link
              key={r.fantasyTeamId}
              href={`/squadre-fanta/${r.fantasyTeamId}`}
              className="flex gap-4 items-center py-3 rounded-xl px-2 -mx-2 transition-colors hover:bg-[var(--surface-1)]"
              style={{
                borderBottom: idx < rankings.length - 1 ? "1px solid rgba(0,0,0,0.05)" : undefined,
                background: isMe ? "var(--primary-light)" : undefined,
              }}
            >
              <span className="text-xs shrink-0 w-5" style={{ color: isMe ? "var(--primary)" : "#000" }}>{r.rank}</span>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="text-sm truncate font-medium" style={{ color: isMe ? "var(--primary)" : "#000" }}>{r.fantasyTeamName}</span>
                <span className="text-xs truncate" style={{ color: isMe ? "var(--primary)" : "rgba(0,0,0,0.65)" }}>
                  {r.userName ?? r.userEmail}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: isMe ? "var(--primary)" : "var(--text-muted)" }}>
                  Vedi rosa
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: isMe ? "var(--primary)" : "#000" }}>
                  {Number.isInteger(r.totalPoints) ? r.totalPoints : r.totalPoints.toFixed(1)}
                </span>
                <i className="pi pi-chevron-right text-[10px]" style={{ color: isMe ? "var(--primary)" : "var(--text-disabled)" }} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
