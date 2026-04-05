import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { addAllMatchPlayers } from "@/app/actions/admin/match-players";
import AdminPageHeader from "@/components/admin-page-header";
import EditMatchForm from "./_edit-form";
import AddMatchPlayerForm from "./_add-player-form";
import PlayerBonusCard from "./_player-bonus-card";
import StatusActions from "./_status-actions";
import { Button } from "primereact/button";
import StatusBadge from "@/components/status-badge";

export default async function PartitaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matchId = Number(id);
  if (isNaN(matchId)) notFound();

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
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Dettaglio partita" backHref="/admin/partite" />

      {/* Header card — navy gradient */}
      <div
        className="rounded-2xl overflow-hidden p-5"
        style={{ background: "linear-gradient(135deg, #0107A3 0%, #0106c4 100%)" }}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <p className="text-[12px] text-white/55">
            {match.startsAt.toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
          </p>
          <div className="flex-shrink-0">
            <StatusBadge status={match.status} />
          </div>
        </div>
        {/* Teams + score */}
        <div className="flex items-center gap-3">
          <span className="font-display font-black text-base uppercase text-white flex-1 text-right leading-tight">
            {match.homeTeam.name}
          </span>
          <span className="font-display font-black text-3xl text-white flex-shrink-0 min-w-[4rem] text-center">
            {match.homeScore !== null && match.awayScore !== null
              ? `${match.homeScore} — ${match.awayScore}`
              : <span className="text-white/30 text-xl">— vs —</span>}
          </span>
          <span className="font-display font-black text-base uppercase text-white flex-1 text-left leading-tight">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Status actions */}
      <div className="admin-card p-4">
        <StatusActions
          matchId={matchId}
          status={match.status}
          playerCount={match.players.length}
        />
      </div>

      {/* Edit form — collapsible */}
      <details className="admin-card overflow-hidden">
        <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] select-none list-none border-b border-[var(--border-soft)] [&::-webkit-details-marker]:hidden">
          <i className="pi pi-pencil text-xs" />
          Modifica dati partita
          <i className="pi pi-chevron-down text-xs ml-auto" />
        </summary>
        <div className="p-4">
          <EditMatchForm match={match} teams={teams} />
        </div>
      </details>

      {/* Participants */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Partecipanti ({match.players.length}
            {allEligibleCount > 0 ? `/${allEligibleCount}` : ""})
          </h2>
          {availablePlayers.length > 0 && (
            <form action={addAllMatchPlayers as unknown as (fd: FormData) => void}>
              <input type="hidden" name="matchId" value={matchId} />
              <Button
                type="submit"
                label={`+ Aggiungi tutti (${availablePlayers.length})`}
                link
                size="small"
                className="text-[var(--primary)] text-xs font-medium p-0"
              />
            </form>
          )}
        </div>

        {match.players.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] mb-4">Nessun partecipante aggiunto.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          {match.players.map(({ player }) => (
            <PlayerBonusCard
              key={player.id}
              matchId={matchId}
              player={player}
              bonuses={(bonusesByPlayer.get(player.id) ?? []).map((b) => ({
                id: b.id,
                bonusType: { code: b.bonusType.code },
                quantity: b.quantity,
                points: Number(b.points),
              }))}
              bonusTypes={bonusTypes.map((bt) => ({ id: bt.id, code: bt.code, name: bt.name, points: Number(bt.points) }))}
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
