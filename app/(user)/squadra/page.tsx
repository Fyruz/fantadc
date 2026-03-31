import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { computeTeamHistory } from "@/lib/scoring";
import { Button } from "primereact/button";

export default async function SquadraPage() {
  const user = await requireAuth();
  const userId = Number(user.id);

  const fantasyTeam = await db.fantasyTeam.findUnique({
    where: { userId },
    include: {
      players: {
        include: {
          player: {
            include: { footballTeam: { select: { name: true, shortName: true } } },
          },
        },
      },
      captain: { select: { id: true, name: true } },
    },
  });

  if (!fantasyTeam) redirect("/squadra/crea");

  const history = await computeTeamHistory(fantasyTeam.id);
  const totalPoints = history.reduce((s, m) => s + m.total, 0);

  const gk = fantasyTeam.players.find((p) => p.player.role === "P");
  const outfield = fantasyTeam.players.filter((p) => p.player.role === "A");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-bold text-[#111827] mb-1">{fantasyTeam.name}</h1>
        <p className="text-[#6B7280] text-sm">
          Capitano: <span className="font-medium text-[#111827]">★ {fantasyTeam.captain.name}</span>
        </p>
        {history.length > 0 && (
          <p className="text-2xl font-bold text-[#111827] mt-2">{totalPoints.toFixed(1)} <span className="text-sm text-[#6B7280] font-normal">punti totali</span></p>
        )}
      </div>

      <div className="admin-card overflow-hidden">
        <div className="bg-green-50 border-b border-green-100 p-6 flex flex-col items-center gap-4">
          <div className="flex gap-3 flex-wrap justify-center">
            {outfield.map(({ player }) => (
              <PlayerCard
                key={player.id}
                name={player.name}
                team={player.footballTeam.shortName ?? player.footballTeam.name}
                isCaptain={player.id === fantasyTeam.captainPlayerId}
              />
            ))}
          </div>
          {gk && (
            <div className="mt-2">
              <PlayerCard
                name={gk.player.name}
                team={gk.player.footballTeam.shortName ?? gk.player.footballTeam.name}
                isCaptain={gk.player.id === fantasyTeam.captainPlayerId}
                isGk
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-[#111827] mb-3">Rosa</h2>
        <div className="admin-card overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#F8F9FC] border-b border-[#E5E7EB]">
                <th className="py-3 px-4 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">Giocatore</th>
                <th className="py-3 px-4 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">Ruolo</th>
                <th className="py-3 px-4 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">Squadra</th>
              </tr>
            </thead>
            <tbody>
              {fantasyTeam.players.map(({ player }, index) => (
                <tr key={player.id} className={`border-b border-[#F3F4F6] last:border-0 ${index % 2 === 1 ? "bg-[#FAFAFA]" : ""}`}>
                  <td className="py-2.5 px-4 font-medium text-[#111827]">
                    {player.id === fantasyTeam.captainPlayerId && (
                      <span className="text-amber-500 mr-1">★</span>
                    )}
                    {player.name}
                  </td>
                  <td className="py-2.5 px-4 text-[#6B7280]">{player.role}</td>
                  <td className="py-2.5 px-4 text-[#6B7280]">{player.footballTeam.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-[#9CA3AF]">
        La rosa è bloccata. Solo un admin può modificarla.
      </p>

      {history.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[#111827] mb-3">Storico punteggi</h2>
          <div className="flex flex-col gap-3">
            {history.map((ms) => (
              <details key={ms.matchId} className="admin-card overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#F8F9FC]">
                  <span className="text-sm font-medium text-[#111827]">{ms.label}</span>
                  <span className="font-bold text-sm ml-4 text-[#111827]">{ms.total.toFixed(1)} pt</span>
                </summary>
                <div className="px-4 pb-3">
                  <table className="w-full text-xs border-collapse mt-1">
                    <thead>
                      <tr className="text-left text-[#9CA3AF] border-b border-[#F3F4F6]">
                        <th className="py-1 pr-3">Giocatore</th>
                        <th className="py-1 pr-2 text-right">Bonus</th>
                        <th className="py-1 pr-2 text-right">MVP</th>
                        <th className="py-1 text-right">Totale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ms.playerScores.map((ps) => (
                        <tr key={ps.playerId} className="border-b border-[#F3F4F6] last:border-0">
                          <td className="py-1 pr-3">
                            {ps.isCaptain && <span className="text-amber-500 mr-0.5">★</span>}
                            {ps.playerName}
                            {ps.isMvp && <span className="ml-1 text-yellow-600 font-medium">(MVP)</span>}
                          </td>
                          <td className="py-1 pr-2 text-right text-[#6B7280]">{ps.bonusPoints.toFixed(1)}</td>
                          <td className="py-1 pr-2 text-right text-[#6B7280]">{ps.mvpPoints > 0 ? `+${ps.mvpPoints.toFixed(1)}` : "—"}</td>
                          <td className="py-1 text-right font-medium text-[#111827]">
                            {ps.finalPoints.toFixed(1)}
                            {ps.isCaptain && ps.basePoints !== 0 && <span className="text-amber-600 text-xs ml-0.5">×2</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      <div>
        <Link href="/dashboard">
          <Button label="← Dashboard" outlined size="small" />
        </Link>
      </div>
    </div>
  );
}

function PlayerCard({
  name,
  team,
  isCaptain,
  isGk = false,
}: {
  name: string;
  team: string;
  isCaptain: boolean;
  isGk?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl px-4 py-3 text-center min-w-20 border ${
        isGk ? "bg-amber-50 border-amber-200" : "bg-white border-[#E5E7EB]"
      }`}
      style={{ borderLeft: `3px solid ${isGk ? "#F59E0B" : "#3B82F6"}` }}
    >
      {isCaptain && <span className="text-amber-500 text-xs mb-0.5">★ C</span>}
      <span className="font-semibold text-sm text-[#111827]">{name}</span>
      <span className="text-xs text-[#6B7280]">{team}</span>
    </div>
  );
}
