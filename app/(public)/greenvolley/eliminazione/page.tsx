import { db } from "@/lib/db";
import Link from "next/link";

export default async function VolleyEliminazionePublicPage() {
  const rounds = await db.volleyKnockoutRound.findMany({
    orderBy: { order: "asc" },
    include: {
      matches: {
        where: { status: { not: "DRAFT" } },
        include: {
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          sets: { orderBy: { setNumber: "asc" } },
        },
        orderBy: { date: "asc" },
      },
    },
  });

  if (rounds.length === 0 || rounds.every((r) => r.matches.length === 0)) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <div className="over-label mb-1">GreenVolley</div>
          <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
            ELIMINAZIONE
          </h1>
        </div>
        <div className="card p-10 text-center over-label">Fase ad eliminazione non ancora iniziata.</div>
      </div>
    );
  }

  const activeRounds = rounds.filter((r) => r.matches.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">GreenVolley</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          ELIMINAZIONE
        </h1>
      </div>

      {/* Bracket — scroll orizzontale su mobile */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: `${activeRounds.length * 220}px` }}>
          {activeRounds.map((round) => (
            <div key={round.id} className="flex flex-col gap-3" style={{ width: 200, flexShrink: 0 }}>
              {/* Round header */}
              <div
                className="text-center text-[11px] font-black uppercase tracking-wide py-1.5 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
              >
                {round.name}
              </div>

              {/* Matches */}
              <div className="flex flex-col gap-2.5">
                {round.matches.map((m) => {
                  const homeSets = m.sets.filter((s) => s.homePoints > s.awayPoints).length;
                  const awaySets = m.sets.filter((s) => s.awayPoints > s.homePoints).length;
                  const scored = m.status === "CONCLUDED" && m.sets.length > 0;
                  const homeWon = scored && homeSets > awaySets;
                  const awayWon = scored && awaySets > homeSets;

                  return (
                    <Link
                      key={m.id}
                      href={`/greenvolley/partite/${m.id}`}
                      className="block transition-opacity hover:opacity-80"
                    >
                      <div
                        className="rounded-xl overflow-hidden"
                        style={{
                          border: "1.5px solid var(--border-medium)",
                          background: "#fff",
                          boxShadow: "0 2px 8px rgba(21,128,61,0.06)",
                        }}
                      >
                        {/* Home */}
                        <div
                          className="flex items-center justify-between px-3 py-2 gap-2"
                          style={{
                            borderBottom: "1px solid var(--border-soft)",
                            background: homeWon ? "var(--primary-light)" : undefined,
                          }}
                        >
                          <span
                            className="font-display font-black text-xs uppercase truncate flex-1"
                            style={{ color: homeWon ? "var(--primary)" : "var(--text-primary)" }}
                          >
                            {m.homeTeam.name}
                          </span>
                          {scored && (
                            <span
                              className="font-display font-black text-sm flex-shrink-0 tabular-nums"
                              style={{ color: homeWon ? "var(--primary)" : "var(--text-muted)" }}
                            >
                              {homeSets}
                            </span>
                          )}
                        </div>
                        {/* Away */}
                        <div
                          className="flex items-center justify-between px-3 py-2 gap-2"
                          style={{ background: awayWon ? "var(--primary-light)" : undefined }}
                        >
                          <span
                            className="font-display font-black text-xs uppercase truncate flex-1"
                            style={{ color: awayWon ? "var(--primary)" : "var(--text-primary)" }}
                          >
                            {m.awayTeam.name}
                          </span>
                          {scored && (
                            <span
                              className="font-display font-black text-sm flex-shrink-0 tabular-nums"
                              style={{ color: awayWon ? "var(--primary)" : "var(--text-muted)" }}
                            >
                              {awaySets}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
