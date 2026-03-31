import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { Button } from "primereact/button";

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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-bold text-[#111827]">
          Ciao{user.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-[#6B7280] text-sm">{user.email}</p>
      </div>

      {!fantasyTeam ? (
        <div className="admin-card p-6 text-center">
          <p className="text-[#6B7280] text-sm mb-4">Non hai ancora creato la tua squadra fantasy.</p>
          <Link href="/squadra/crea">
            <Button label="Crea la tua squadra" />
          </Link>
        </div>
      ) : (
        <div className="admin-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#111827]">{fantasyTeam.name}</h2>
            <Link href="/squadra" className="text-sm text-[#0107A3] hover:underline">Vedi squadra →</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {fantasyTeam.players.map(({ player }) => (
              <span key={player.name} className="text-xs bg-[#E8E9F8] text-[#0107A3] px-2 py-1 rounded-full font-medium">
                {player.name}
                <span className="text-[#6B7280] ml-1 font-normal">({player.role})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {openMatches.length > 0 && (
        <div className="admin-card p-4">
          <h2 className="font-semibold text-[#111827] mb-3">Vota MVP</h2>
          <div className="flex flex-col gap-0">
            {openMatches.map((m, index) => {
              const voted = votedMatchIds.has(m.id);
              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between py-2.5 ${
                    index < openMatches.length - 1 ? "border-b border-[#F3F4F6]" : ""
                  }`}
                >
                  <span className="text-sm font-medium text-[#111827]">
                    {m.homeTeam.name} vs {m.awayTeam.name}
                  </span>
                  {voted ? (
                    <span className="text-xs text-emerald-600 font-medium">Votato ✓</span>
                  ) : (
                    <Link href={`/vota/${m.id}`} className="text-sm text-[#0107A3] hover:underline font-medium">
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
        <Link href="/classifica">
          <Button label="Classifica" outlined />
        </Link>
        <Link href="/partite">
          <Button label="Calendario partite" outlined />
        </Link>
      </div>
    </div>
  );
}
