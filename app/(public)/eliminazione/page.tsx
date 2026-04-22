import Link from "next/link";
import { db } from "@/lib/db";

export default async function EliminazionePublicPage() {
  const rounds = await db.knockoutRound.findMany({
    orderBy: { order: "asc" },
    include: {
      matches: {
        where: { status: { not: "DRAFT" } },
        orderBy: { bracketPosition: "asc" },
        include: {
          homeTeam: { select: { name: true, shortName: true } },
          awayTeam: { select: { name: true, shortName: true } },
        },
      },
    },
  });

  if (rounds.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <div className="over-label mb-1">Stagione 2026</div>
          <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>ELIMINAZIONE DIRETTA</h1>
        </div>
        <div className="card p-10 text-center over-label">Fase ad eliminazione non ancora iniziata.</div>
      </div>
    );
  }

  // Separate 3rd place match from others
  const thirdPlaceRound = rounds.find((r) => r.order === 3);
  const mainRounds = rounds.filter((r) => r.order !== 3);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">Stagione 2026</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>ELIMINAZIONE DIRETTA</h1>
      </div>

      {/* Bracket — horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: `${mainRounds.length * 220}px` }}>
          {mainRounds.map((round) => (
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
                  const home = m.homeTeam?.shortName ?? m.homeTeam?.name ?? m.homeSeed ?? "TBD";
                  const away = m.awayTeam?.shortName ?? m.awayTeam?.name ?? m.awaySeed ?? "TBD";
                  const scored = m.homeScore !== null && m.awayScore !== null;
                  const homeWon = scored && m.homeScore! > m.awayScore!;
                  const awayWon = scored && m.awayScore! > m.homeScore!;

                  const card = (
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{
                        border: "1.5px solid var(--border-medium)",
                        background: "#fff",
                        boxShadow: "0 2px 8px rgba(1,7,163,0.06)",
                      }}
                    >
                      {/* Home */}
                      <div
                        className="flex items-center justify-between px-3 py-2 gap-2"
                        style={{
                          borderBottom: "1px solid var(--border-soft)",
                          background: homeWon ? "rgba(16,185,129,0.06)" : undefined,
                        }}
                      >
                        <span
                          className="font-display font-black text-xs uppercase truncate flex-1"
                          style={{ color: homeWon ? "#065F46" : m.homeTeamId ? "var(--text-primary)" : "var(--text-disabled)" }}
                        >
                          {home}
                        </span>
                        {scored && (
                          <span
                            className="font-display font-black text-sm flex-shrink-0 tabular-nums"
                            style={{ color: homeWon ? "#065F46" : "var(--text-muted)" }}
                          >
                            {m.homeScore}
                          </span>
                        )}
                      </div>
                      {/* Away */}
                      <div
                        className="flex items-center justify-between px-3 py-2 gap-2"
                        style={{ background: awayWon ? "rgba(16,185,129,0.06)" : undefined }}
                      >
                        <span
                          className="font-display font-black text-xs uppercase truncate flex-1"
                          style={{ color: awayWon ? "#065F46" : m.awayTeamId ? "var(--text-primary)" : "var(--text-disabled)" }}
                        >
                          {away}
                        </span>
                        {scored && (
                          <span
                            className="font-display font-black text-sm flex-shrink-0 tabular-nums"
                            style={{ color: awayWon ? "#065F46" : "var(--text-muted)" }}
                          >
                            {m.awayScore}
                          </span>
                        )}
                      </div>
                    </div>
                  );

                  return m.homeTeamId && m.awayTeamId ? (
                    <Link key={m.id} href={`/partite/${m.id}`} className="block transition-opacity hover:opacity-80">
                      {card}
                    </Link>
                  ) : (
                    <div key={m.id}>{card}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3rd place match — separate section */}
      {thirdPlaceRound && thirdPlaceRound.matches.length > 0 && (
        <div>
          <div className="over-label mb-3">Finale 3°/4° posto</div>
          <div style={{ maxWidth: 200 }}>
            {thirdPlaceRound.matches.map((m) => {
              const home = m.homeTeam?.shortName ?? m.homeTeam?.name ?? m.homeSeed ?? "TBD";
              const away = m.awayTeam?.shortName ?? m.awayTeam?.name ?? m.awaySeed ?? "TBD";
              const scored = m.homeScore !== null && m.awayScore !== null;
              const homeWon = scored && m.homeScore! > m.awayScore!;
              const awayWon = scored && m.awayScore! > m.homeScore!;

              const card = (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    border: "1.5px solid var(--border-medium)",
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(1,7,163,0.06)",
                  }}
                >
                  <div className="flex items-center justify-between px-3 py-2 gap-2" style={{ borderBottom: "1px solid var(--border-soft)", background: homeWon ? "rgba(16,185,129,0.06)" : undefined }}>
                    <span className="font-display font-black text-xs uppercase truncate flex-1" style={{ color: homeWon ? "#065F46" : m.homeTeamId ? "var(--text-primary)" : "var(--text-disabled)" }}>{home}</span>
                    {scored && <span className="font-display font-black text-sm flex-shrink-0 tabular-nums" style={{ color: homeWon ? "#065F46" : "var(--text-muted)" }}>{m.homeScore}</span>}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 gap-2" style={{ background: awayWon ? "rgba(16,185,129,0.06)" : undefined }}>
                    <span className="font-display font-black text-xs uppercase truncate flex-1" style={{ color: awayWon ? "#065F46" : m.awayTeamId ? "var(--text-primary)" : "var(--text-disabled)" }}>{away}</span>
                    {scored && <span className="font-display font-black text-sm flex-shrink-0 tabular-nums" style={{ color: awayWon ? "#065F46" : "var(--text-muted)" }}>{m.awayScore}</span>}
                  </div>
                </div>
              );

              return m.homeTeamId && m.awayTeamId ? (
                <Link key={m.id} href={`/partite/${m.id}`} className="block transition-opacity hover:opacity-80">{card}</Link>
              ) : (
                <div key={m.id}>{card}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
