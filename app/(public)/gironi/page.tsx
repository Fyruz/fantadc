import Link from "next/link";
import { db } from "@/lib/db";
import { computeGroupStandings } from "@/lib/standings";
import StatusBadge from "@/components/status-badge";

export default async function GironiPublicPage() {
  const groups = await db.group.findMany({
    orderBy: { order: "asc" },
    include: {
      teams: {
        include: { footballTeam: { select: { id: true, name: true, shortName: true } } },
      },
      matches: {
        where: { status: { not: "DRAFT" } },
        orderBy: { startsAt: "asc" },
        include: {
          homeTeam: { select: { name: true, shortName: true } },
          awayTeam: { select: { name: true, shortName: true } },
        },
      },
    },
  });

  if (groups.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <div className="over-label mb-1">Stagione 2026</div>
          <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>GIRONI</h1>
        </div>
        <div className="card p-10 text-center over-label">Fase a gironi non ancora iniziata.</div>
      </div>
    );
  }

  // Compute standings for all groups in parallel
  const allStandings = await Promise.all(groups.map((g) => computeGroupStandings(g.id)));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">Stagione 2026</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>GIRONI</h1>
      </div>

      <div className="flex flex-col gap-8">
        {groups.map((group, gi) => {
          const standings = allStandings[gi];
          const qualifiedIds = new Set(group.teams.filter((gt) => gt.qualified).map((gt) => gt.footballTeamId));

          return (
            <div key={group.id} className="flex flex-col gap-4">
              {/* Group header */}
              <div
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={{ background: "linear-gradient(135deg, #0107A3 0%, #000669 100%)" }}
              >
                <div className="font-display font-black text-xl uppercase text-white">
                  Girone {group.slug}
                </div>
                <div className="text-sm text-white/50">{group.name}</div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Standings */}
                <div className="card overflow-hidden">
                  <div className="px-4 py-2.5 flex items-center" style={{ borderBottom: "1px solid var(--border-soft)", background: "var(--surface-1)" }}>
                    <span className="w-7 flex-shrink-0" />
                    <span className="flex-1 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Squadra</span>
                    {["G", "V", "N", "S", "DR", "PT"].map((h, i) => (
                      <span
                        key={h}
                        className={`w-7 text-center text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${i >= 1 && i <= 3 ? "hidden sm:block" : ""} ${i === 4 ? "hidden sm:block" : ""}`}
                        style={{ color: "var(--text-muted)" }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  {standings.length === 0 ? (
                    <div className="px-4 py-5 text-sm text-center" style={{ color: "var(--text-muted)" }}>
                      Nessun risultato ancora.
                    </div>
                  ) : (
                    standings.map((row, idx) => (
                      <div
                        key={row.teamId}
                        className="flex items-center gap-2 px-4 py-2.5"
                        style={{
                          borderBottom: idx < standings.length - 1 ? "1px solid var(--border-soft)" : undefined,
                          borderLeft: qualifiedIds.has(row.teamId) ? "3px solid #10B981" : "3px solid transparent",
                        }}
                      >
                        <div className="w-7 flex-shrink-0 text-center">
                          <span className="font-display font-black text-sm" style={{ color: "var(--text-muted)" }}>{row.rank}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-display font-black text-sm uppercase truncate" style={{ color: "var(--text-primary)" }}>
                            {row.shortName ?? row.teamName}
                          </span>
                          {qualifiedIds.has(row.teamId) && (
                            <span className="ml-1.5 text-[9px] font-bold" style={{ color: "#10B981" }}>Q</span>
                          )}
                        </div>
                        {[row.played, row.won, row.drawn, row.lost,
                          row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff,
                          row.points
                        ].map((v, i) => (
                          <span
                            key={i}
                            className={`w-7 text-center text-sm tabular-nums flex-shrink-0 ${i >= 1 && i <= 3 ? "hidden sm:block" : ""} ${i === 4 ? "hidden sm:block" : ""}`}
                            style={{
                              color: i === 5 ? "var(--primary)" : "var(--text-muted)",
                              fontWeight: i === 5 ? 700 : 500,
                            }}
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    ))
                  )}
                </div>

                {/* Matches */}
                <div className="card overflow-hidden">
                  <div className="px-4 py-2.5" style={{ borderBottom: "1px solid var(--border-soft)", background: "var(--surface-1)" }}>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                      Partite ({group.matches.length})
                    </span>
                  </div>
                  {group.matches.length === 0 ? (
                    <div className="px-4 py-5 text-sm text-center" style={{ color: "var(--text-muted)" }}>
                      Nessuna partita programmata.
                    </div>
                  ) : (
                    group.matches.map((m, idx) => {
                      const home = m.homeTeam?.shortName ?? m.homeTeam?.name ?? m.homeSeed ?? "TBD";
                      const away = m.awayTeam?.shortName ?? m.awayTeam?.name ?? m.awaySeed ?? "TBD";
                      const scored = m.homeScore !== null && m.awayScore !== null;
                      return (
                        <Link
                          key={m.id}
                          href={`/partite/${m.id}`}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--surface-1)] transition-colors"
                          style={{ borderBottom: idx < group.matches.length - 1 ? "1px solid var(--border-soft)" : undefined }}
                        >
                          <StatusBadge status={m.status} />
                          <span className="flex-1 text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                            {home} — {away}
                          </span>
                          {scored ? (
                            <span className="font-display font-black text-sm flex-shrink-0" style={{ color: "var(--text-primary)" }}>
                              {m.homeScore} — {m.awayScore}
                            </span>
                          ) : (
                            <span className="text-[11px] flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                              {m.startsAt.toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
