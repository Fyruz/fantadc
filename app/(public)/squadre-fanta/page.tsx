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
              className="flex gap-4 items-center py-3 transition-colors hover:bg-(--surface-1)"
              style={{
                borderBottom: idx < rankings.length - 1 ? "1px solid rgba(0,0,0,0.05)" : undefined,
                paddingLeft: isMe ? 6 : 8,
                borderLeft: isMe ? "2px solid var(--text-primary)" : "2px solid transparent",
              }}
            >
              <span className="text-xs shrink-0 w-5 text-black">{r.rank}</span>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="text-sm truncate font-medium text-black">{r.fantasyTeamName}</span>
                <span className="text-xs truncate" style={{ color: "rgba(0,0,0,0.65)" }}>
                  {r.userName ?? r.userEmail}
                </span>
              </div>
              <span className="text-sm font-semibold shrink-0 text-black">
                {Number.isInteger(r.totalPoints) ? r.totalPoints : r.totalPoints.toFixed(1)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
