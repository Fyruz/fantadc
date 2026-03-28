import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";

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

  const gk = fantasyTeam.players.find((p) => p.player.role === "GK");
  const outfield = fantasyTeam.players.filter((p) => p.player.role === "PLAYER");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">{fantasyTeam.name}</h1>
        <p className="text-zinc-500 text-sm">
          Capitano: <span className="font-medium text-zinc-700">★ {fantasyTeam.captain.name}</span>
        </p>
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
        {/* GK */}
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
