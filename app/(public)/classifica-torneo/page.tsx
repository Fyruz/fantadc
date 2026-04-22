import { computeStandings } from "@/lib/standings";

export const revalidate = 60;

export default async function ClassificaTorneoPage() {
  const standings = await computeStandings();
  const played = standings.some((s) => s.played > 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">Stagione 2026</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          CLASSIFICA TORNEO
        </h1>
      </div>

      {!played ? (
        <div className="card p-10 text-center over-label">Nessun risultato ancora disponibile.</div>
      ) : (
        <div className="card overflow-hidden">
          {/* Header */}
          <div
            className="flex items-center gap-2 px-4 py-2.5"
            style={{ borderBottom: "1px solid var(--border-soft)", background: "var(--surface-1)" }}
          >
            <span className="w-7 flex-shrink-0" />
            <span className="flex-1 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Squadra
            </span>
            <div className="flex items-center gap-3 flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: "var(--text-muted)" }}>
              <span className="w-5 text-center">G</span>
              <span className="w-5 text-center hidden sm:block">V</span>
              <span className="w-5 text-center hidden sm:block">N</span>
              <span className="w-5 text-center hidden sm:block">S</span>
              <span className="w-8 text-center hidden sm:block">DR</span>
              <span className="w-8 text-center font-black" style={{ color: "var(--text-secondary)" }}>PT</span>
            </div>
          </div>

          {/* Rows */}
          {standings.map((row, idx) => {
            const isTop3 = row.rank <= 3 && row.played > 0;
            return (
              <div
                key={row.teamId}
                className="flex items-center gap-2 px-4 py-3 transition-colors"
                style={{
                  borderBottom: idx < standings.length - 1 ? "1px solid var(--border-soft)" : undefined,
                  background: isTop3 && row.rank === 1 ? "rgba(232,160,0,0.05)" : undefined,
                }}
              >
                {/* Rank */}
                <div className="w-7 flex-shrink-0 flex items-center justify-center">
                  {row.rank === 1 && row.played > 0 ? (
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center font-display font-black text-xs text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #E8A000, #C87800)", boxShadow: "0 2px 8px rgba(232,160,0,0.4)" }}
                    >
                      1
                    </div>
                  ) : (
                    <span className="font-display font-black text-sm" style={{ color: row.played === 0 ? "var(--text-disabled)" : "var(--text-muted)" }}>
                      {row.rank}
                    </span>
                  )}
                </div>

                {/* Team */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-display font-black text-sm uppercase truncate"
                      style={{ color: row.played === 0 ? "var(--text-disabled)" : "var(--text-primary)" }}
                    >
                      {row.teamName}
                    </span>
                    {row.shortName && (
                      <span
                        className="text-[9px] font-bold px-1 py-0.5 rounded hidden sm:inline-flex flex-shrink-0"
                        style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                      >
                        {row.shortName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 flex-shrink-0 text-sm tabular-nums text-right">
                  <span className="w-5 text-center font-semibold" style={{ color: "var(--text-muted)" }}>{row.played}</span>
                  <span className="w-5 text-center hidden sm:block" style={{ color: "var(--text-muted)" }}>{row.won}</span>
                  <span className="w-5 text-center hidden sm:block" style={{ color: "var(--text-muted)" }}>{row.drawn}</span>
                  <span className="w-5 text-center hidden sm:block" style={{ color: "var(--text-muted)" }}>{row.lost}</span>
                  <span
                    className="w-8 text-center text-xs hidden sm:block"
                    style={{ color: row.goalDiff > 0 ? "#065F46" : row.goalDiff < 0 ? "#991B1B" : "var(--text-muted)" }}
                  >
                    {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                  </span>
                  <span
                    className="w-8 text-center font-display font-black text-base"
                    style={{ color: row.played === 0 ? "var(--text-disabled)" : "var(--text-primary)" }}
                  >
                    {row.points}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Legend — mobile only */}
          <div
            className="flex items-center justify-end gap-3 px-4 py-2 sm:hidden"
            style={{ borderTop: "1px solid var(--border-soft)", background: "var(--surface-1)" }}
          >
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--text-disabled)" }}>
              G = giocate · PT = punti
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
