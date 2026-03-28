import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const user = await requireAuth();
  const userId = Number(user.id);

  const fantasyTeam = await db.fantasyTeam.findUnique({
    where: { userId },
    include: {
      players: { include: { player: { select: { name: true, role: true } } } },
    },
  });

  const openMatches = await db.match.findMany({
    where: { status: "CONCLUDED" },
    orderBy: { concludedAt: "desc" },
    take: 3,
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
    },
  });

  const hasVoted = fantasyTeam
    ? await db.vote.findMany({
        where: { userId, matchId: { in: openMatches.map((m) => m.id) } },
        select: { matchId: true },
      })
    : [];

  const votedMatchIds = new Set(hasVoted.map((v) => v.matchId));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">
          Ciao{user.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-zinc-500 text-sm">{user.email}</p>
      </div>

      {!fantasyTeam ? (
        <div className="border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center">
          <p className="text-zinc-500 mb-4">Non hai ancora creato la tua squadra fantasy.</p>
          <Link href="/squadra/crea" className="btn-primary">Crea la tua squadra</Link>
        </div>
      ) : (
        <div className="border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{fantasyTeam.name}</h2>
            <Link href="/squadra" className="text-blue-600 text-sm hover:underline">Vedi squadra →</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {fantasyTeam.players.map(({ player }) => (
              <span key={player.name} className="text-xs bg-zinc-100 px-2 py-1 rounded">
                {player.name}
                <span className="text-zinc-400 ml-1">({player.role})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {openMatches.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Vota MVP</h2>
          <div className="flex flex-col gap-2">
            {openMatches.map((m) => {
              const voted = votedMatchIds.has(m.id);
              return (
                <div key={m.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
                  <span className="text-sm font-medium">
                    {m.homeTeam.name} vs {m.awayTeam.name}
                  </span>
                  {voted ? (
                    <span className="text-xs text-green-600">Votato ✓</span>
                  ) : (
                    <Link href={`/vota/${m.id}`} className="text-sm text-blue-600 hover:underline">
                      Vota ora →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <Link href="/classifica" className="btn-secondary">Classifica</Link>
        <Link href="/partite" className="btn-secondary">Calendario partite</Link>
      </div>
    </div>
  );
}
