import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { removeMatchPlayer } from "@/app/actions/admin/match-players";
import { deleteBonus } from "@/app/actions/admin/bonuses";
import EditMatchForm from "./_edit-form";
import AddMatchPlayerForm from "./_add-player-form";
import AssignBonusForm from "./_assign-bonus-form";

export default async function PartitaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = Number(id);

  const [match, teams, bonusTypes, allPlayers, matchBonuses] = await Promise.all([
    db.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        players: {
          include: {
            player: { include: { footballTeam: { select: { name: true } } } },
          },
        },
      },
    }),
    db.footballTeam.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.bonusType.findMany({ orderBy: { code: "asc" } }),
    db.player.findMany({ orderBy: { name: "asc" }, include: { footballTeam: { select: { name: true } } } }),
    db.playerMatchBonus.findMany({
      where: { matchId },
      include: { bonusType: true },
      orderBy: { id: "asc" },
    }),
  ]);

  if (!match) notFound();

  const participantIds = new Set(match.players.map((mp) => mp.playerId));
  const eligibleTeamIds = new Set([match.homeTeamId, match.awayTeamId]);
  const availablePlayers = allPlayers.filter(
    (p) => eligibleTeamIds.has(p.footballTeamId) && !participantIds.has(p.id)
  );

  const bonusesByPlayer = new Map<number, typeof matchBonuses>();
  for (const b of matchBonuses) {
    const arr = bonusesByPlayer.get(b.playerId) ?? [];
    arr.push(b);
    bonusesByPlayer.set(b.playerId, arr);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold mb-2">
          {match.homeTeam.name} vs {match.awayTeam.name}
        </h1>
        <p className="text-sm text-zinc-500 mb-4">
          {match.startsAt.toLocaleString("it-IT")} — <span className="font-medium">{match.status}</span>
        </p>
        <EditMatchForm match={match} teams={teams} />
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Partecipanti ({match.players.length})</h2>
        <div className="flex flex-col gap-2 mb-4">
          {match.players.length === 0 && <p className="text-sm text-zinc-400">Nessun partecipante aggiunto.</p>}
          {match.players.map(({ player }) => {
            const bonuses = bonusesByPlayer.get(player.id) ?? [];
            return (
              <div key={player.id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">
                    {player.name} <span className="text-zinc-400 text-xs">({player.role})</span>{" "}
                    <span className="text-zinc-400 text-xs">— {player.footballTeam.name}</span>
                  </span>
                  <form action={removeMatchPlayer as unknown as (fd: FormData) => void}>
                    <input type="hidden" name="matchId" value={matchId} />
                    <input type="hidden" name="playerId" value={player.id} />
                    <button type="submit" className="text-red-500 text-xs hover:underline">
                      Rimuovi
                    </button>
                  </form>
                </div>
                {bonuses.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {bonuses.map((b) => (
                      <li key={b.id} className="flex items-center gap-1 text-xs bg-zinc-100 px-2 py-0.5 rounded">
                        <span>{b.bonusType.code}</span>
                        {b.quantity > 1 && <span>×{b.quantity}</span>}
                        <span className="text-zinc-500">({Number(b.points) > 0 ? "+" : ""}{Number(b.points)}pt)</span>
                        <form action={deleteBonus as unknown as (fd: FormData) => void} className="inline">
                          <input type="hidden" name="id" value={b.id} />
                          <input type="hidden" name="matchId" value={matchId} />
                          <button type="submit" className="text-red-400 ml-1 hover:text-red-600">×</button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
        {availablePlayers.length > 0 && (
          <AddMatchPlayerForm matchId={matchId} availablePlayers={availablePlayers} />
        )}
      </div>

      {match.players.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3">Assegna bonus</h2>
          <AssignBonusForm
            matchId={matchId}
            players={match.players.map((mp) => ({ id: mp.player.id, name: mp.player.name }))}
            bonusTypes={bonusTypes.map((bt) => ({ ...bt, points: Number(bt.points) }))}
          />
        </div>
      )}
    </div>
  );
}
