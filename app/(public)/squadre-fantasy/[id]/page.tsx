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
      <div>
        <div className="over-label mb-1">Stagione 2025</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          {team.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Proprietario: {team.user.name ?? team.user.email}
        </p>
        {history.length > 0 && (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{totalPoints.toFixed(1)}</span>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>punti totali</span>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Rosa</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {team.players.map(({ player }) => {
            const isCaptain = player.id === team.captainPlayerId;
            return (
              <div
                key={player.id}
                className={`card p-3 flex items-center gap-2 text-sm ${isCaptain ? "!border-[#F5C518]" : ""}`}
                style={{ borderLeft: `3px solid ${player.role === "P" ? "#10B981" : "#3B82F6"}`, ...(isCaptain ? { background: 'rgba(245,197,24,0.08)' } : {}) }}
              >
                <RoleBadge role={player.role} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{player.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {player.footballTeam.shortName ?? player.footballTeam.name}
                  </p>
                </div>
                {isCaptain && (
                  <span className="text-amber-500 text-xs font-bold shrink-0" title="Capitano">
                    ★ C
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {history.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Storico partite</h2>
          <div className="flex flex-col gap-3">
            {history.map((match) => (
              <details key={match.matchId} className="card overflow-hidden group">
                <summary className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[var(--surface-1)] transition-colors list-none">
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{match.label}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {match.startsAt.toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{match.total.toFixed(1)}</span>
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>pt</span>
                    <span className="text-xs group-open:rotate-180 transition-transform" style={{ color: "var(--text-muted)" }}>▼</span>
                  </div>
                </summary>
                <div className="px-4 pb-3 border-t" style={{ borderColor: "var(--border-soft)", background: "var(--surface-1)" }}>
                  <div className="flex flex-col gap-1 mt-2">
                    {match.playerScores.map((ps) => (
                      <div
                        key={ps.playerId}
                        className="flex items-center justify-between text-xs py-1 border-b last:border-0"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        <div className="flex items-center gap-1.5">
                          {ps.isCaptain && <span className="text-amber-500 font-bold">★ C</span>}
                          {ps.isMvp && <span className="text-yellow-400">★</span>}
                          <span className="font-medium" style={{ color: "var(--text-primary)" }}>{ps.playerName}</span>
                          <span style={{ color: "var(--text-muted)" }}>({ps.footballTeamName})</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {ps.isCaptain && ps.basePoints > 0 && (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>×2</span>
                          )}
                          <span
                            className="font-mono font-bold"
                            style={{ color: ps.finalPoints > 0 ? '#32D74B' : ps.finalPoints < 0 ? '#FF453A' : 'var(--text-muted)' }}
                          >
                            {ps.finalPoints > 0 ? "+" : ""}
                            {ps.finalPoints.toFixed(1)}
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
