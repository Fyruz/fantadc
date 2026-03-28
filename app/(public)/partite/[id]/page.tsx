import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { isMvpWindowOpen } from "@/lib/domain/vote";

export default async function PartitaPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await db.match.findUnique({
    where: { id: Number(id), status: { not: "DRAFT" } },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      players: {
        include: {
          player: {
            include: { footballTeam: { select: { name: true } } },
          },
        },
        orderBy: { player: { name: "asc" } },
      },
      bonuses: {
        include: { bonusType: true, player: { select: { name: true } } },
        orderBy: { id: "asc" },
      },
    },
  });
  if (!match) notFound();

  const windowOpen = isMvpWindowOpen(match.concludedAt);

  // MVP: count votes only after window is closed and match is published
  let mvpPlayer: { name: string; footballTeam: { name: string } } | null = null;
  if (!windowOpen && match.status === "PUBLISHED") {
    const topVote = await db.vote.groupBy({
      by: ["playerId"],
      where: { matchId: match.id },
      _count: { playerId: true },
      orderBy: { _count: { playerId: "desc" } },
      take: 1,
    });
    if (topVote[0]) {
      const mp = match.players.find((p) => p.playerId === topVote[0].playerId);
      if (mp) mvpPlayer = mp.player;
    }
  }

  const STATUS_LABEL: Record<string, string> = {
    SCHEDULED: "Programmata",
    CONCLUDED: "Conclusa",
    PUBLISHED: "Pubblicata",
  };
  const STATUS_CLASS: Record<string, string> = {
    SCHEDULED: "badge-scheduled",
    CONCLUDED: "badge-concluded",
    PUBLISHED: "badge-published",
  };

  // Group bonuses by player for display
  const bonusByPlayer = new Map<string, typeof match.bonuses>();
  for (const b of match.bonuses) {
    const arr = bonusByPlayer.get(b.player.name) ?? [];
    arr.push(b);
    bonusByPlayer.set(b.player.name, arr);
  }

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold">
            {match.homeTeam.name} <span className="text-zinc-400 font-normal">vs</span> {match.awayTeam.name}
          </h1>
          <span className={STATUS_CLASS[match.status] ?? "badge-draft"}>
            {STATUS_LABEL[match.status] ?? match.status}
          </span>
        </div>
        <p className="text-sm text-zinc-500">
          {match.startsAt.toLocaleString("it-IT", { dateStyle: "full", timeStyle: "short" })}
        </p>
      </div>

      {/* MVP */}
      {mvpPlayer && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">MVP della partita</p>
          <p className="text-xl font-bold">★ {mvpPlayer.name}</p>
          <p className="text-sm text-zinc-500">{mvpPlayer.footballTeam.name}</p>
        </div>
      )}

      {windowOpen && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center text-sm text-blue-700">
          🗳️ Finestra di voto MVP aperta — <a href="/login" className="font-medium underline">accedi per votare</a>
        </div>
      )}

      {/* Players */}
      {match.players.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Giocatori in campo ({match.players.length})</h2>
          <div className="grid grid-cols-2 gap-2">
            {match.players.map(({ player }) => (
              <div key={player.id} className="border rounded-lg px-3 py-2 text-sm">
                <span className="font-medium">{player.name}</span>
                <span className="text-zinc-400 ml-1 text-xs">({player.role})</span>
                <p className="text-xs text-zinc-400">{player.footballTeam.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bonuses (only show for published matches) */}
      {match.status === "PUBLISHED" && match.bonuses.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Bonus assegnati</h2>
          <div className="flex flex-col gap-2">
            {[...bonusByPlayer.entries()].map(([playerName, bonuses]) => (
              <div key={playerName} className="border rounded-lg px-3 py-2 text-sm">
                <span className="font-medium">{playerName}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {bonuses.map((b) => (
                    <span key={b.id} className={`text-xs px-1.5 py-0.5 rounded ${Number(b.points) >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {b.bonusType.code}
                      {b.quantity > 1 && ` ×${b.quantity}`}
                      {" "}({Number(b.points) > 0 ? "+" : ""}{Number(b.points)}pt)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
