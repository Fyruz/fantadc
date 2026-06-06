import { db } from "@/lib/db";
import { getFlagUrlFromCountryCode } from "@/lib/flags";

export const dynamic = "force-dynamic";
export const revalidate = 60;

type PlayerPickRow = {
  rank: number;
  playerId: number;
  playerName: string;
  role: string;
  footballTeamName: string;
  footballTeamShortName: string | null;
  flagSrc: string | null;
  pickCount: number;
  pickRate: number;
};

function formatPercent(value: number) {
  return `${value.toFixed(0)}%`;
}

export default async function GiocatoriFantaPage() {
  const [players, totalFantasyTeams] = await Promise.all([
    db.player.findMany({
      include: {
        footballTeam: {
          select: { name: true, shortName: true, countryCode: true, logoUrl: true },
        },
        _count: { select: { fantasyTeams: true } },
      },
    }),
    db.fantasyTeam.count(),
  ]);

  const rows: PlayerPickRow[] = players
    .map((player) => {
      const pickCount = player._count.fantasyTeams;
      return {
        rank: 0,
        playerId: player.id,
        playerName: player.name,
        role: player.role,
        footballTeamName: player.footballTeam.name,
        footballTeamShortName: player.footballTeam.shortName,
        flagSrc: player.footballTeam.logoUrl ?? getFlagUrlFromCountryCode(player.footballTeam.countryCode),
        pickCount,
        pickRate: totalFantasyTeams > 0 ? (pickCount / totalFantasyTeams) * 100 : 0,
      };
    })
    .filter((row) => row.pickCount > 0)
    .sort(
      (a, b) =>
        b.pickCount - a.pickCount ||
        a.playerName.localeCompare(b.playerName, "it") ||
        a.footballTeamName.localeCompare(b.footballTeamName, "it")
    )
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">Stagione 2026</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          PIU PRESI AL FANTA
        </h1>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center over-label">Nessuna squadra fanta registrata.</div>
      ) : (
        <div className="card overflow-hidden">
          <div
            className="flex items-center gap-2 px-4 py-2.5"
            style={{ borderBottom: "1px solid var(--border-soft)", background: "var(--surface-1)" }}
          >
            <span className="w-7 flex-shrink-0" />
            <span className="flex-1 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Giocatore
            </span>
            <div
              className="flex flex-shrink-0 items-center gap-3 text-right text-[10px] font-black uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              <span className="w-12 text-center">Preso</span>
              <span className="w-9 text-center hidden sm:block">%</span>
            </div>
          </div>

          {rows.map((row, idx) => {
            const isFirst = row.rank === 1;
            return (
              <div
                key={row.playerId}
                className="flex items-center gap-2 px-4 py-3 transition-colors"
                style={{
                  borderBottom: idx < rows.length - 1 ? "1px solid var(--border-soft)" : undefined,
                  background: isFirst ? "rgba(232,160,0,0.05)" : undefined,
                }}
              >
                <div className="flex w-7 flex-shrink-0 items-center justify-center">
                  {isFirst ? (
                    <div
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg font-display text-xs font-black text-white"
                      style={{
                        background: "linear-gradient(135deg, #E8A000, #C87800)",
                        boxShadow: "0 2px 8px rgba(232,160,0,0.4)",
                      }}
                    >
                      1
                    </div>
                  ) : (
                    <span className="font-display text-sm font-black" style={{ color: "var(--text-muted)" }}>
                      {row.rank}
                    </span>
                  )}
                </div>

                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg"
                  style={{ background: "var(--surface-1)", border: "1px solid var(--border-soft)" }}
                >
                  {row.flagSrc ? (
                    <img src={row.flagSrc} alt={row.footballTeamName} className="h-full w-full object-contain p-1" />
                  ) : (
                    <span className="text-[9px] font-black uppercase" style={{ color: "var(--text-muted)" }}>
                      {(row.footballTeamShortName ?? row.footballTeamName).slice(0, 2)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-display text-sm font-black uppercase" style={{ color: "var(--text-primary)" }}>
                      {row.playerName}
                    </span>
                    <span
                      className="hidden flex-shrink-0 rounded px-1 py-0.5 text-[9px] font-bold sm:inline-flex"
                      style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                    >
                      {row.role === "P" ? "POR" : "ATT"}
                    </span>
                  </div>
                  <div className="truncate text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {row.footballTeamShortName ?? row.footballTeamName}
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-3 text-right tabular-nums">
                  <span className="w-12 text-center font-display text-base font-black" style={{ color: "var(--text-primary)" }}>
                    {row.pickCount}
                  </span>
                  <span className="hidden w-9 text-center text-xs sm:block" style={{ color: "var(--text-muted)" }}>
                    {formatPercent(row.pickRate)}
                  </span>
                </div>
              </div>
            );
          })}

          <div
            className="flex items-center justify-end gap-3 px-4 py-2 sm:hidden"
            style={{ borderTop: "1px solid var(--border-soft)", background: "var(--surface-1)" }}
          >
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--text-disabled)" }}>
              Preso = numero squadre fanta
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
