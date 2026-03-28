import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { computeTeamHistory } from "@/lib/scoring";

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
        <h1 className="text-2xl font-bold mb-1">{fantasyTeam.name}</h1>
        <p className="text-zinc-500 text-sm">
          Capitano: <span className="font-medium text-zinc-700">★ {fantasyTeam.captain.name}</span>
        </p>
        {history.length > 0 && (
          <p className="text-2xl font-bold mt-2">{totalPoints.toFixed(1)} <span className="text-sm text-zinc-400 font-normal">punti totali</span></p>
        )}
      </div>

      {/* Campo visivo */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center gap-4">
        {/* 4 outfield */}
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
        {/* P (Portiere) */}
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

      {/* Dettaglio roster */}
      <div>
        <h2 className="font-semibold mb-3">Rosa</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="py-2 pr-4">Giocatore</th>
              <th className="py-2 pr-4">Ruolo</th>
              <th className="py-2">Squadra</th>
            </tr>
          </thead>
          <tbody>
            {fantasyTeam.players.map(({ player }) => (
              <tr key={player.id} className="border-b">
                <td className="py-2 pr-4 font-medium">
                  {player.id === fantasyTeam.captainPlayerId && (
                    <span className="text-yellow-500 mr-1">★</span>
                  )}
                  {player.name}
                </td>
                <td className="py-2 pr-4 text-zinc-500">{player.role}</td>
                <td className="py-2 text-zinc-500">{player.footballTeam.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-400">
        La rosa è bloccata. Solo un admin può modificarla.
      </p>

      {/* Storico punteggi per partita */}
      {history.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Storico punteggi</h2>
          <div className="flex flex-col gap-3">
            {history.map((ms) => (
              <details key={ms.matchId} className="border rounded-lg">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-50 rounded-lg">
                  <span className="text-sm font-medium">{ms.label}</span>
                  <span className="font-bold text-sm ml-4">{ms.total.toFixed(1)} pt</span>
                </summary>
                <div className="px-4 pb-3">
                  <table className="w-full text-xs border-collapse mt-1">
                    <thead>
                      <tr className="text-left text-zinc-400 border-b">
                        <th className="py-1 pr-3">Giocatore</th>
                        <th className="py-1 pr-2 text-right">Bonus</th>
                        <th className="py-1 pr-2 text-right">MVP</th>
                        <th className="py-1 text-right">Totale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ms.playerScores.map((ps) => (
                        <tr key={ps.playerId} className="border-b last:border-0">
                          <td className="py-1 pr-3">
                            {ps.isCaptain && <span className="text-yellow-500 mr-0.5">★</span>}
                            {ps.playerName}
                            {ps.isMvp && <span className="ml-1 text-yellow-600 font-medium">(MVP)</span>}
                          </td>
                          <td className="py-1 pr-2 text-right text-zinc-500">{ps.bonusPoints.toFixed(1)}</td>
                          <td className="py-1 pr-2 text-right text-zinc-500">{ps.mvpPoints > 0 ? `+${ps.mvpPoints.toFixed(1)}` : "—"}</td>
                          <td className="py-1 text-right font-medium">
                            {ps.finalPoints.toFixed(1)}
                            {ps.isCaptain && ps.basePoints !== 0 && <span className="text-yellow-600 text-xs ml-0.5">×2</span>}
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
        <Link href="/dashboard" className="btn-secondary">← Dashboard</Link>
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
      className={`flex flex-col items-center rounded-lg px-4 py-3 text-center min-w-20 border ${
        isGk ? "bg-yellow-50 border-yellow-200" : "bg-white border-zinc-200"
      }`}
    >
      {isCaptain && <span className="text-yellow-500 text-xs mb-0.5">★ C</span>}
      <span className="font-medium text-sm">{name}</span>
      <span className="text-xs text-zinc-400">{team}</span>
    </div>
  );
}
