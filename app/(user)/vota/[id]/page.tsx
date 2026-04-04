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

  if (match.status === "DRAFT" || match.status === "SCHEDULED") {
    return (
      <div className="flex flex-col gap-4 items-center py-12 max-w-sm mx-auto text-center">
        <h1 className="font-display font-black text-2xl uppercase" style={{ color: "var(--text-primary)" }}>
          {title}
        </h1>
        <p style={{ color: "var(--text-muted)" }}>La partita non è ancora conclusa.</p>
        <Link href="/dashboard">
          <Button label="← Dashboard" outlined size="small" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-sm mx-auto">
      {/* Header partita */}
      <div
        className="rounded-[18px] p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)", boxShadow: "0 6px 24px rgba(1,7,163,0.30)" }}
      >
        <div className="absolute right-[-20px] top-[-20px] w-28 h-28 rounded-full border border-white/5 pointer-events-none" />
        <div className="relative">
          <div className="over-label mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Vota MVP</div>
          <div className="font-display font-black text-xl uppercase text-white leading-tight">{title}</div>
          <div className="mt-2">
            {windowOpen ? (
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                style={{ background: "rgba(34,197,94,0.2)", color: "#86efac", border: "1px solid rgba(34,197,94,0.3)" }}
              >
                ● FINESTRA APERTA
              </span>
            ) : (
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
              >
                VOTAZIONE CHIUSA
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hai già votato */}
      {userVote && (
        <div
          className="card p-4 text-center"
          style={{ borderLeft: "3px solid #22C55E" }}
        >
          <div className="font-black text-sm" style={{ color: "#065F46" }}>✓ Hai votato</div>
          <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Il tuo MVP: <span className="font-display font-black uppercase" style={{ color: "var(--text-primary)" }}>{userVote.player.name}</span>
          </div>
        </div>
      )}

      {/* Form di voto */}
      {windowOpen && !userVote && (
        <>
          <div className="over-label">Scegli il giocatore MVP</div>
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

      {/* Favorito provvisorio */}
      {windowOpen && topPlayer && (userVote || voteCounts.length > 0) && (
        <div className="card p-4 text-center">
          <div className="over-label mb-1">Favorito provvisorio</div>
          <div className="font-display font-black text-xl uppercase" style={{ color: "var(--primary)" }}>
            {topPlayer.name}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{topPlayer.footballTeam.name}</div>
        </div>
      )}

      {/* MVP finale */}
      {!windowOpen && topPlayer && (
        <div className="card p-5 text-center" style={{ borderLeft: "3px solid #E8A000" }}>
          <div className="over-label mb-1">MVP della partita</div>
          <div className="font-display font-black text-2xl uppercase" style={{ color: "var(--text-primary)" }}>
            ★ {topPlayer.name}
          </div>
          <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{topPlayer.footballTeam.name}</div>
        </div>
      )}

      {!windowOpen && !topPlayer && (
        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>Nessun voto registrato per questa partita.</p>
      )}

      <Link href="/dashboard">
        <Button label="← Dashboard" outlined size="small" />
      </Link>
    </div>
  );
}
