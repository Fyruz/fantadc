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
        <h1 className="text-[22px] font-bold text-[#111827] mb-1">{team.name}</h1>
        <p className="text-sm text-[#6B7280]">
          Proprietario: {team.user.name ?? team.user.email}
        </p>
        {history.length > 0 && (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#111827]">{totalPoints.toFixed(1)}</span>
            <span className="text-[#6B7280] text-sm">punti totali</span>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold text-[#111827] mb-3">Rosa</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {team.players.map(({ player }) => {
            const isCaptain = player.id === team.captainPlayerId;
            return (
              <div
                key={player.id}
                className={`admin-card p-3 flex items-center gap-2 text-sm ${isCaptain ? "!bg-[#FFFBEB] !border-amber-300" : ""}`}
                style={{ borderLeft: `3px solid ${player.role === "P" ? "#10B981" : "#3B82F6"}` }}
              >
                <RoleBadge role={player.role} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#111827] truncate">{player.name}</p>
                  <p className="text-xs text-[#6B7280]">
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
          <h2 className="text-base font-semibold text-[#111827] mb-3">Storico partite</h2>
          <div className="flex flex-col gap-3">
            {history.map((match) => (
              <details key={match.matchId} className="admin-card overflow-hidden group">
                <summary className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#F8F9FC] transition-colors list-none">
                  <div>
                    <p className="font-medium text-sm text-[#111827]">{match.label}</p>
                    <p className="text-xs text-[#6B7280]">
                      {match.startsAt.toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-lg text-[#111827]">{match.total.toFixed(1)}</span>
                    <span className="text-[#6B7280] text-sm">pt</span>
                    <span className="text-[#6B7280] text-xs group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="px-4 pb-3 border-t border-[#F3F4F6] bg-[#F8F9FC]">
                  <div className="flex flex-col gap-1 mt-2">
                    {match.playerScores.map((ps) => (
                      <div
                        key={ps.playerId}
                        className="flex items-center justify-between text-xs py-1 border-b last:border-0"
                      >
                        <div className="flex items-center gap-1.5">
                          {ps.isCaptain && <span className="text-amber-500 font-bold">★ C</span>}
                          {ps.isMvp && <span className="text-yellow-400">★</span>}
                          <span className="font-medium text-[#111827]">{ps.playerName}</span>
                          <span className="text-[#6B7280]">({ps.footballTeamName})</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {ps.isCaptain && ps.basePoints > 0 && (
                            <span className="text-[#6B7280] text-xs">×2</span>
                          )}
                          <span
                            className={`font-mono font-bold ${ps.finalPoints > 0 ? "text-green-700" : ps.finalPoints < 0 ? "text-red-600" : "text-[#6B7280]"}`}
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
        <div className="admin-card p-8 text-center text-[#6B7280] text-sm">
          Nessuna partita pubblicata ancora.
        </div>
      )}
    </div>
  );
}
