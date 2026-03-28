import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { addAllMatchPlayers } from "@/app/actions/admin/match-players";
import EditMatchForm from "./_edit-form";
import AddMatchPlayerForm from "./_add-player-form";
import PlayerBonusCard from "./_player-bonus-card";
import StatusActions from "./_status-actions";

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
  const allEligibleCount = allPlayers.filter((p) => eligibleTeamIds.has(p.footballTeamId)).length;

  const bonusesByPlayer = new Map<number, typeof matchBonuses>();
  for (const b of matchBonuses) {
    const arr = bonusesByPlayer.get(b.playerId) ?? [];
    arr.push(b);
    bonusesByPlayer.set(b.playerId, arr);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header + status */}
      <div>
        <h1 className="text-xl font-bold mb-1">
          {match.homeTeam.name} vs {match.awayTeam.name}
        </h1>
        <p className="text-sm text-zinc-500 mb-3">
          {match.startsAt.toLocaleString("it-IT")}
        </p>
        <StatusActions
          matchId={matchId}
          status={match.status}
          playerCount={match.players.length}
        />
      </div>

      {/* Edit form */}
      <details>
        <summary className="cursor-pointer text-sm font-medium text-zinc-500 hover:text-zinc-800 select-none">
          Modifica dati partita
        </summary>
        <div className="mt-3">
          <EditMatchForm match={match} teams={teams} />
        </div>
      </details>

      {/* Participants */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">
            Partecipanti ({match.players.length}{allEligibleCount > 0 ? `/${allEligibleCount}` : ""})
          </h2>
          {availablePlayers.length > 0 && (
            <form action={addAllMatchPlayers as unknown as (fd: FormData) => void}>
              <input type="hidden" name="matchId" value={matchId} />
              <button type="submit" className="btn-secondary text-xs py-1">
                + Aggiungi tutti ({availablePlayers.length})
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {match.players.length === 0 && (
            <p className="text-sm text-zinc-400">Nessun partecipante aggiunto.</p>
          )}
          {match.players.map(({ player }) => (
            <PlayerBonusCard
              key={player.id}
              matchId={matchId}
              player={player}
              bonuses={(bonusesByPlayer.get(player.id) ?? []).map((b) => ({
                ...b,
                points: Number(b.points),
              }))}
              bonusTypes={bonusTypes.map((bt) => ({ ...bt, points: Number(bt.points) }))}
            />
          ))}
        </div>

        {availablePlayers.length > 0 && (
          <AddMatchPlayerForm matchId={matchId} availablePlayers={availablePlayers} />
        )}
      </div>

    </div>
  );
}
