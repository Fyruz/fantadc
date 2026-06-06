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

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] font-display text-sm font-black text-white"
        style={{
          background: "linear-gradient(135deg, #E8A000, #C87800)",
          boxShadow: "0 3px 10px rgba(232,160,0,0.5)",
        }}
      >
        1
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] font-display text-sm font-black"
        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
      >
        2
      </div>
    );
  }

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] font-display text-sm font-black"
      style={{ background: "var(--surface-1)", color: "var(--text-muted)" }}
    >
      {rank}
    </div>
  );
}

function FlagMark({ row, compact = false }: { row: PlayerPickRow; compact?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg ${
        compact ? "h-8 w-8" : "h-9 w-9"
      }`}
      style={{
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      {row.flagSrc ? (
        <img
          src={row.flagSrc}
          alt={row.footballTeamName}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <span
          className="text-[9px] font-black uppercase"
          style={{ color: compact ? "var(--text-muted)" : "rgba(255,255,255,0.65)" }}
        >
          {(row.footballTeamShortName ?? row.footballTeamName).slice(0, 2)}
        </span>
      )}
    </div>
  );
}

function PickMeta({ row, light = false }: { row: PlayerPickRow; light?: boolean }) {
  return (
    <div
      className="text-[10px] leading-tight"
      style={{ color: light ? "rgba(255,255,255,0.45)" : "var(--text-muted)" }}
    >
      {row.footballTeamShortName ?? row.footballTeamName} · {row.role === "P" ? "POR" : "ATT"}
    </div>
  );
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

  const top2 = rows.filter((row) => row.rank <= 2);
  const rest = rows.filter((row) => row.rank > 2);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">Stagione 2026</div>
        <h1 className="font-display text-3xl font-black uppercase" style={{ color: "var(--text-primary)" }}>
          PIU PRESI AL FANTA
        </h1>
        {totalFantasyTeams > 0 && (
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Su {totalFantasyTeams} squadre fanta registrate.
          </p>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center over-label">Nessuna squadra fanta registrata.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {top2.length > 0 && (
            <div
              className="relative overflow-hidden rounded-[18px] p-4"
              style={{
                background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)",
                boxShadow: "0 6px 24px rgba(1,7,163,0.30)",
              }}
            >
              <div className="pointer-events-none absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full border border-white/5" />
              <div className="pointer-events-none absolute right-[10px] top-[10px] h-16 w-16 rounded-full border border-white/5" />

              {top2.map((row, idx) => (
                <div key={row.playerId}>
                  {idx > 0 && (
                    <div className="my-3" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }} />
                  )}
                  <div className="relative flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] font-display text-base font-black"
                      style={
                        idx === 0
                          ? {
                              background: "linear-gradient(135deg, #E8A000, #C87800)",
                              boxShadow: "0 3px 10px rgba(232,160,0,0.5)",
                              color: "#fff",
                            }
                          : { background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }
                      }
                    >
                      {row.rank}
                    </div>
                    <FlagMark row={row} />
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate font-display text-[14px] font-black uppercase"
                        style={{ color: idx === 0 ? "#fff" : "rgba(255,255,255,0.85)" }}
                      >
                        {row.playerName}
                      </div>
                      <PickMeta row={row} light />
                    </div>
                    <div className="shrink-0 text-right">
                      <div
                        className="font-display text-2xl font-black leading-none"
                        style={{ color: idx === 0 ? "#E8A000" : "rgba(255,255,255,0.55)" }}
                      >
                        {row.pickCount}
                      </div>
                      <div className="mt-0.5 text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                        squadre
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <div className="card overflow-hidden">
              {rest.map((row, idx) => (
                <div
                  key={row.playerId}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-1)]"
                  style={idx < rest.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
                >
                  <RankBadge rank={row.rank} />
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg"
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
                    <div className="truncate font-display text-[13px] font-black uppercase" style={{ color: "var(--text-primary)" }}>
                      {row.playerName}
                    </div>
                    <PickMeta row={row} />
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-display text-lg font-black leading-none" style={{ color: "var(--text-secondary)" }}>
                      {row.pickCount}
                    </div>
                    <div className="mt-0.5 text-[9px]" style={{ color: "var(--text-disabled)" }}>
                      {row.pickRate.toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
