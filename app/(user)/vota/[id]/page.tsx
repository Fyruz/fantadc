import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { isMvpWindowOpen } from "@/lib/domain/vote";
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
      <div className="text-center py-12">
        <h1 className="text-xl font-bold mb-2">{title}</h1>
        <p className="text-zinc-500">La partita non è ancora conclusa.</p>
        <Link href="/dashboard" className="mt-6 inline-block btn-secondary">← Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto">
      <div>
        <h1 className="text-xl font-bold mb-1">{title}</h1>
        <p className="text-sm text-zinc-500">
          {windowOpen ? (
            <span className="text-green-600 font-medium">Finestra di voto aperta</span>
          ) : (
            <span className="text-zinc-400">Finestra di voto chiusa</span>
          )}
        </p>
      </div>

      {/* Già votato */}
      {userVote && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-green-700 font-semibold text-sm">Hai votato ✓</p>
          <p className="text-zinc-600 text-sm mt-1">Il tuo voto: <span className="font-medium">{userVote.player.name}</span></p>
        </div>
      )}

      {/* Finestra aperta + non ancora votato */}
      {windowOpen && !userVote && (
        <>
          <p className="text-sm text-zinc-600">Scegli il giocatore MVP della partita:</p>
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

      {/* Favorito provvisorio (finestra aperta) */}
      {windowOpen && topPlayer && (userVote || voteCounts.length > 0) && (
        <div className="border rounded-xl p-4 text-center">
          <p className="text-xs text-zinc-500 mb-1">Favorito provvisorio</p>
          <p className="font-bold text-lg">{topPlayer.name}</p>
          <p className="text-xs text-zinc-400">{topPlayer.footballTeam.name}</p>
        </div>
      )}

      {/* MVP finale (finestra chiusa) */}
      {!windowOpen && topPlayer && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">MVP della partita</p>
          <p className="text-2xl font-bold">★ {topPlayer.name}</p>
          <p className="text-sm text-zinc-500 mt-1">{topPlayer.footballTeam.name}</p>
        </div>
      )}

      {!windowOpen && !topPlayer && (
        <p className="text-sm text-zinc-400 text-center">Nessun voto registrato per questa partita.</p>
      )}

      <Link href="/dashboard" className="btn-secondary w-fit">← Dashboard</Link>
    </div>
  );
}
