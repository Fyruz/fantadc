import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { addAllMatchPlayers } from "@/app/actions/admin/match-players";
import AdminPageHeader from "@/components/admin-page-header";
import EditMatchForm from "./_edit-form";
import AddMatchPlayerForm from "./_add-player-form";
import PlayerBonusCard from "./_player-bonus-card";
import StatusActions from "./_status-actions";
import { Button } from "primereact/button";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
  PUBLISHED: "Pubblicata",
};

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
        className="rounded-2xl overflow-hidden p-5 flex items-start justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #0107A3 0%, #0106c4 100%)" }}
      >
        <div>
          <h2 className="text-xl font-bold text-white">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </h2>
          <p className="text-[13px] text-white/80 mt-1">
            {match.startsAt.toLocaleString("it-IT")}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#F5C518] text-[#111827] flex-shrink-0 mt-0.5">
          {STATUS_LABEL[match.status] ?? match.status}
        </span>
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
        <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-medium text-[#6B7280] hover:text-[#111827] select-none list-none border-b border-[#E5E7EB] [&::-webkit-details-marker]:hidden">
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
          <h2 className="text-base font-semibold text-[#111827]">
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
                className="text-[#0107A3] text-xs font-medium p-0"
              />
            </form>
          )}
        </div>

        {match.players.length === 0 && (
          <p className="text-sm text-[#9CA3AF] mb-4">Nessun partecipante aggiunto.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
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
