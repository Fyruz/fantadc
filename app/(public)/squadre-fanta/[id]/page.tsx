import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { computeTeamHistory } from "@/lib/scoring";
import RoleBadge from "@/components/role-badge";

export const dynamic = "force-dynamic";

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
              footballTeam: { select: { name: true, shortName: true } },
            },
          },
        },
      },
    },
  });

  if (!team) notFound();

  const history = await computeTeamHistory(teamId);
  const totalPoints = history.reduce((s, m) => s + m.total, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="over-label mb-1">Squadra Fanta</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          {team.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Proprietario: {team.user.name ?? team.user.email}
        </p>
        {history.length > 0 && (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display font-black text-3xl" style={{ color: "var(--primary)" }}>
              {totalPoints.toFixed(1)}
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>punti totali</span>
          </div>
        )}
      </div>

      {/* Rosa */}
      <div>
        <div className="over-label mb-3">Rosa</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {team.players.map(({ player }) => {
            const isCaptain = player.id === team.captainPlayerId;
            return (
              <div
                key={player.id}
                className="card p-3 flex items-center gap-3"
                style={{
                  borderLeft: `3px solid ${player.role === "P" ? "#10B981" : "#3B82F6"}`,
                  ...(isCaptain ? { background: "rgba(245,197,24,0.07)", borderColor: "#F5C518" } : {}),
                }}
              >
                <RoleBadge role={player.role} />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-black text-sm uppercase truncate" style={{ color: "var(--text-primary)" }}>
                    {player.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {player.footballTeam.shortName ?? player.footballTeam.name}
                  </p>
                </div>
                {isCaptain && (
                  <span className="text-[11px] font-black flex-shrink-0" style={{ color: "#C48A00" }}>
                    ★ CAP
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Storico partite */}
      {history.length > 0 && (
        <div>
          <div className="over-label mb-3">Storico partite</div>
          <div className="flex flex-col gap-3">
            {history.map((match) => (
              <details key={match.matchId} className="card overflow-hidden group">
                <summary className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[var(--surface-1)] transition-colors list-none">
                  <div>
                    <p className="font-display font-black text-sm uppercase" style={{ color: "var(--text-primary)" }}>
                      {match.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {match.startsAt.toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-display font-black text-xl" style={{ color: "var(--text-primary)" }}>
                      {match.total.toFixed(1)}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>pt</span>
                    <i className="pi pi-chevron-down text-xs transition-transform group-open:rotate-180" style={{ color: "var(--text-muted)" }} />
                  </div>
                </summary>
                <div className="px-4 pb-3 border-t" style={{ borderColor: "var(--border-soft)", background: "var(--surface-1)" }}>
                  <div className="flex flex-col gap-1 mt-2">
                    {match.playerScores.map((ps) => (
                      <div
                        key={ps.playerId}
                        className="flex items-center justify-between py-1.5 border-b last:border-0"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {ps.isCaptain && <span className="text-[10px] font-black flex-shrink-0" style={{ color: "#C48A00" }}>★ C</span>}
                          {ps.isMvp && <span className="text-[10px] flex-shrink-0" style={{ color: "#E8A000" }}>MVP</span>}
                          <span className="font-display font-black text-xs uppercase truncate" style={{ color: "var(--text-primary)" }}>
                            {ps.playerName}
                          </span>
                          <span className="text-[11px] flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                            ({ps.footballTeamName})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {ps.isCaptain && ps.basePoints > 0 && (
                            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>×2</span>
                          )}
                          <span
                            className="font-display font-black text-sm"
                            style={{ color: ps.finalPoints > 0 ? "#16A34A" : ps.finalPoints < 0 ? "#DC2626" : "var(--text-muted)" }}
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
        </div>
      )}

      {history.length === 0 && (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessuna partita pubblicata ancora.
        </div>
      )}
    </div>
  );
}
