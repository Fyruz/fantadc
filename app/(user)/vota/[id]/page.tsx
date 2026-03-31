import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { isMvpWindowOpen } from "@/lib/domain/vote";
import { Button } from "primereact/button";
import VoteForm from "./_vote-form";

export default async function VotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = Number(id);
  const user = await requireAuth();
  const userId = Number(user.id);

  const match = await db.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      players: {
        include: { player: { include: { footballTeam: { select: { name: true } } } } },
      },
    },
  });
  if (!match) notFound();

  const windowOpen = isMvpWindowOpen(match.concludedAt);
  const userVote = await db.vote.findUnique({
    where: { userId_matchId: { userId, matchId } },
    include: { player: { select: { name: true } } },
  });

  // Conta voti per favorito provvisorio / MVP finale
  const voteCounts = await db.vote.groupBy({
    by: ["playerId"],
    where: { matchId },
    _count: { playerId: true },
    orderBy: { _count: { playerId: "desc" } },
  });

  const topVotedId = voteCounts[0]?.playerId ?? null;
  const topPlayer = topVotedId
    ? match.players.find((mp) => mp.playerId === topVotedId)?.player
    : null;

  const title = `${match.homeTeam.name} vs ${match.awayTeam.name}`;

  // Partita non ancora conclusa
  if (match.status === "DRAFT" || match.status === "SCHEDULED") {
    return (
      <div className="flex flex-col gap-4 items-center py-12">
        <h1 className="text-[22px] font-bold text-[#111827] mb-2">{title}</h1>
        <p className="text-[#6B7280]">La partita non è ancora conclusa.</p>
        <Link href="/dashboard">
          <Button label="← Dashboard" outlined size="small" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto">
      <div>
        <h1 className="text-[22px] font-bold text-[#111827] mb-1">{title}</h1>
        <p className="text-sm text-[#6B7280]">
          {windowOpen ? (
            <span className="text-emerald-600 font-medium">Finestra di voto aperta</span>
          ) : (
            <span className="text-[#9CA3AF]">Finestra di voto chiusa</span>
          )}
        </p>
      </div>

      {userVote && (
        <div className="admin-card p-4 text-center border-l-4 border-l-emerald-400">
          <p className="text-green-700 font-semibold text-sm">Hai votato ✓</p>
          <p className="text-[#6B7280] text-sm mt-1">Il tuo voto: <span className="font-medium text-[#111827]">{userVote.player.name}</span></p>
        </div>
      )}

      {windowOpen && !userVote && (
        <>
          <p className="text-sm text-[#6B7280]">Scegli il giocatore MVP della partita:</p>
          <VoteForm
            matchId={matchId}
            players={match.players.map((mp) => ({
              id: mp.player.id,
              name: mp.player.name,
              footballTeam: mp.player.footballTeam,
            }))}
          />
        </>
      )}

      {windowOpen && topPlayer && (userVote || voteCounts.length > 0) && (
        <div className="admin-card p-4 text-center">
          <p className="text-xs text-[#6B7280] mb-1">Favorito provvisorio</p>
          <p className="font-bold text-lg text-[#111827]">{topPlayer.name}</p>
          <p className="text-xs text-[#6B7280]">{topPlayer.footballTeam.name}</p>
        </div>
      )}

      {!windowOpen && topPlayer && (
        <div className="admin-card p-5 text-center border-l-4 border-l-amber-400">
          <p className="text-xs text-[#6B7280] mb-1 uppercase tracking-wide">MVP della partita</p>
          <p className="text-2xl font-bold text-[#111827]">★ {topPlayer.name}</p>
          <p className="text-sm text-[#6B7280] mt-1">{topPlayer.footballTeam.name}</p>
        </div>
      )}

      {!windowOpen && !topPlayer && (
        <p className="text-sm text-[#9CA3AF] text-center">Nessun voto registrato per questa partita.</p>
      )}

      <Link href="/dashboard">
        <Button label="← Dashboard" outlined size="small" />
      </Link>
    </div>
  );
}
