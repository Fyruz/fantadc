import Link from "next/link";
import { db } from "@/lib/db";
import StatusBadge from "@/components/status-badge";

function formatMatchDate(date: Date) {
  const day = date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
  const time = date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  return { day, time };
}

export default async function PartitePublicPage() {
  const matches = await db.match.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { startsAt: "asc" },
    include: {
      homeTeam: { select: { name: true, shortName: true } },
      awayTeam: { select: { name: true, shortName: true } },
    },
  });

  const hasScore = (m: typeof matches[0]) => m.homeScore !== null && m.awayScore !== null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">Stagione 2025</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          PARTITE
        </h1>
      </div>

      {matches.length === 0 ? (
        <div className="card p-10 text-center over-label">Nessuna partita disponibile.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {matches.map((m) => {
            const { day, time } = formatMatchDate(m.startsAt);
            const scored = hasScore(m);

            return (
              <Link
                key={m.id}
                href={`/partite/${m.id}`}
                className="group block rounded-[20px] overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "#fff",
                  border: "1.5px solid var(--border-medium)",
                  boxShadow: "0 2px 12px rgba(1,7,163,0.07)",
                }}
              >
                {/* Top bar */}
                <div
                  className="flex items-center justify-between px-4 py-2.5 gap-2"
                  style={{ borderBottom: "1px solid var(--border-soft)" }}
                >
                  <StatusBadge status={m.status} />
                  <span
                    className="text-[11px] font-semibold capitalize"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {day}
                  </span>
                </div>

                {/* Match body */}
                <div className="px-4 py-5 flex items-center gap-2">
                  {/* Home */}
                  <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span
                      className="font-display font-black text-2xl uppercase leading-none tracking-tight"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {m.homeTeam.shortName ?? m.homeTeam.name}
                    </span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide truncate max-w-full"
                      style={{ color: "var(--text-disabled)" }}
                    >
                      {m.homeTeam.name}
                    </span>
                  </div>

                  {/* Score / VS */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 px-2">
                    {scored ? (
                      <div
                        className="font-display font-black text-3xl leading-none"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {m.homeScore}
                        <span style={{ color: "var(--text-disabled)" }}> — </span>
                        {m.awayScore}
                      </div>
                    ) : (
                      <>
                        <div
                          className="font-display font-black text-xl leading-none"
                          style={{ color: "var(--primary)" }}
                        >
                          VS
                        </div>
                        <div
                          className="text-[11px] font-bold tabular-nums"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {time}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Away */}
                  <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span
                      className="font-display font-black text-2xl uppercase leading-none tracking-tight"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {m.awayTeam.shortName ?? m.awayTeam.name}
                    </span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide truncate max-w-full"
                      style={{ color: "var(--text-disabled)" }}
                    >
                      {m.awayTeam.name}
                    </span>
                  </div>
                </div>

                {/* Bottom strip — only when concluded/published with score */}
                {scored && (
                  <div
                    className="px-4 py-2 text-center text-[11px] font-semibold"
                    style={{
                      borderTop: "1px solid var(--border-soft)",
                      background: "var(--surface-1)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {day} · {time}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
