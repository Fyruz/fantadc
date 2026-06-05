import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { computeTeamHistory } from "@/lib/scoring";
import BackButton from "@/components/back-button";
import { getFlagUrlFromCountryCode } from "@/lib/flags";

export const revalidate = 60;

const CARD: React.CSSProperties = {
  background: "#fff",
  border: "1px solid rgba(9,20,76,0.05)",
  boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)",
};

const ROW_BORDER: React.CSSProperties = {
  borderTop: "1px solid rgba(9,20,76,0.05)",
};

export default async function SquadraFantasyPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teamId = Number(id);

  const team = await db.fantasyTeam.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      name: true,
      captainPlayerId: true,
      user: { select: { name: true, email: true } },
      players: {
        select: {
          player: {
            select: {
              id: true,
              name: true,
              role: true,
              footballTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
            },
          },
        },
      },
    },
  });

  if (!team) notFound();

  const history = await computeTeamHistory(teamId);
  const totalPoints = history.reduce((s, m) => s + m.total, 0);
  const ownerLabel = team.user.name ?? team.user.email;

  return (
    <div className="flex flex-col gap-10 max-w-lg mx-auto">

      {/* Header mobile */}
      <div className="md:hidden flex items-center justify-between h-12">
        <div className="flex-1 flex items-center">
          <BackButton />
        </div>
        <div className="flex flex-col items-center flex-1 px-2 min-w-0" style={{ gap: 4 }}>
          <span className="text-base font-semibold truncate w-full text-center" style={{ color: "#09144C" }}>
            {team.name}
          </span>
          <span className="text-xs truncate w-full text-center text-black">
            {ownerLabel}
          </span>
        </div>
        <div className="flex-1" />
      </div>

      {/* Rosa */}
      <div className="rounded-3xl overflow-hidden" style={CARD}>
        {/* Card header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <h2
            className="text-base font-medium uppercase"
            style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
          >
            Rosa
          </h2>
          {history.length > 0 && (
            <div className="flex items-baseline gap-1">
              <span className="text-base font-semibold" style={{ color: "var(--primary)" }}>
                {totalPoints.toFixed(1)}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>pt</span>
            </div>
          )}
        </div>

        {/* Player rows */}
        {team.players.map(({ player }) => {
          const isCaptain = player.id === team.captainPlayerId;
          const flagSrc = player.footballTeam.logoUrl ?? getFlagUrlFromCountryCode(player.footballTeam.countryCode);
          return (
            <div
              key={player.id}
              className="flex items-center gap-3 px-6 py-3"
              style={ROW_BORDER}
            >
              {/* Logo / flag */}
              <div className="w-9 h-9 shrink-0 flex items-center justify-center p-1">
                {flagSrc ? (
                  <img src={flagSrc} alt={player.footballTeam.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
                    {(player.footballTeam.shortName ?? player.footballTeam.name).slice(0, 2)}
                  </span>
                )}
              </div>

              {/* Name + team */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-black truncate">{player.name}</p>
                <p className="text-xs truncate" style={{ color: "rgba(0,0,0,0.55)" }}>
                  {player.footballTeam.shortName ?? player.footballTeam.name}
                </p>
              </div>

              {/* Captain badge */}
              {isCaptain && (
                <span className="text-xs font-semibold shrink-0" style={{ color: "#C48A00" }}>
                  CAP
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Storico partite */}
      {history.length > 0 && (
        <div className="rounded-3xl overflow-hidden" style={CARD}>
          {/* Card header */}
          <div className="px-6 pt-6 pb-3">
            <h2
              className="text-base font-medium uppercase"
              style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
            >
              Storico partite
            </h2>
          </div>

          {/* Match rows */}
          {history.map((match) => (
            <details key={match.matchId} className="group" style={ROW_BORDER}>
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-black truncate">{match.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(0,0,0,0.55)" }}>
                    {match.startsAt.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {match.total.toFixed(1)} pt
                  </span>
                  <i
                    className="pi pi-chevron-down text-[10px] transition-transform group-open:rotate-180"
                    style={{ color: "rgba(0,0,0,0.35)" }}
                  />
                </div>
              </summary>

              {/* Expanded: player scores */}
              <div className="px-6 pb-4" style={{ borderTop: "1px solid rgba(9,20,76,0.05)", paddingTop: 12 }}>
                <div className="flex flex-col gap-0">
                  {match.playerScores.map((ps) => (
                    <div
                      key={ps.playerId}
                      className="flex items-center justify-between py-2"
                      style={{ borderBottom: "1px solid rgba(9,20,76,0.04)" }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {ps.isCaptain && (
                          <span className="text-[10px] font-semibold shrink-0" style={{ color: "#C48A00" }}>CAP</span>
                        )}
                        {ps.isMvp && (
                          <span className="text-[10px] font-semibold shrink-0" style={{ color: "#E8A000" }}>MVP</span>
                        )}
                        <span className="text-sm text-black truncate">{ps.playerName}</span>
                        <span className="text-xs shrink-0" style={{ color: "rgba(0,0,0,0.45)" }}>
                          {ps.footballTeamName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        {ps.isCaptain && ps.basePoints > 0 && (
                          <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.45)" }}>×2</span>
                        )}
                        <span
                          className="text-sm font-semibold"
                          style={{ color: ps.finalPoints > 0 ? "#16A34A" : ps.finalPoints < 0 ? "#DC2626" : "rgba(0,0,0,0.45)" }}
                        >
                          {ps.finalPoints > 0 ? "+" : ""}{ps.finalPoints.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      )}

      {history.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
          Nessuna partita pubblicata ancora.
        </p>
      )}

    </div>
  );
}
