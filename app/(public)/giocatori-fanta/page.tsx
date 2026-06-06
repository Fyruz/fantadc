import { db } from "@/lib/db";
import { getFlagUrlFromCountryCode } from "@/lib/flags";

export const dynamic = "force-dynamic";
export const revalidate = 60;

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

  const rows = players
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

  if (rows.length === 0) {
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
        <span className="text-xs uppercase" style={{ color: "rgba(0,0,0,0.65)" }}>Preso</span>
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {rows.map((row, idx) => (
          <div
            key={row.playerId}
            className="flex gap-4 items-center py-3 transition-colors hover:bg-(--surface-1)"
            style={{
              borderBottom: idx < rows.length - 1 ? "1px solid rgba(0,0,0,0.05)" : undefined,
              paddingLeft: 8,
              borderLeft: "2px solid transparent",
            }}
          >
            <span className="text-xs shrink-0 w-5 text-black">{row.rank}</span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
              {row.flagSrc ? (
                <img
                  src={row.flagSrc}
                  alt={row.footballTeamName}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <span className="text-[10px] font-semibold uppercase" style={{ color: "rgba(0,0,0,0.55)" }}>
                  {(row.footballTeamShortName ?? row.footballTeamName).slice(0, 2)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="text-sm truncate font-medium text-black">{row.playerName}</span>
              <span className="text-xs truncate" style={{ color: "rgba(0,0,0,0.65)" }}>
                {row.footballTeamShortName ?? row.footballTeamName}
                {" · "}
                {row.role === "P" ? "Portiere" : "Giocatore"}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-sm font-semibold text-black">
                {row.pickCount}
              </span>
              <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.45)" }}>
                {row.pickRate.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
