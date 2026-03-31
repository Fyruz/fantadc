import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { isMvpWindowOpen } from "@/lib/domain/vote";
import StatusBadge from "@/components/status-badge";
import RoleBadge from "@/components/role-badge";

export default async function PartitaPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = Number(id);
  if (Number.isNaN(matchId)) notFound();

  const match = await db.match.findUnique({
    where: { id: matchId, status: { not: "DRAFT" } },
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

  const bonusByPlayer = new Map<string, typeof match.bonuses>();
  for (const b of match.bonuses) {
    const arr = bonusByPlayer.get(b.player.name) ?? [];
    arr.push(b);
    bonusByPlayer.set(b.player.name, arr);
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/partite" className="text-sm text-[#6B7280] hover:text-[#111827] flex items-center gap-1 w-fit">
        <i className="pi pi-arrow-left text-xs" /> Tutte le partite
      </Link>

      <div
        className="rounded-2xl overflow-hidden p-5 flex items-start justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #0107A3 0%, #0106c4 100%)" }}
      >
        <div>
          <h1 className="text-xl font-bold text-white">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </h1>
          <p className="text-[13px] text-white/80 mt-1">
            {match.startsAt.toLocaleString("it-IT", { dateStyle: "full", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex-shrink-0 mt-0.5">
          <StatusBadge status={match.status} />
        </div>
      </div>

      {mvpPlayer && (
        <div className="admin-card p-5 text-center">
          <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">MVP della partita</p>
          <p className="text-xl font-bold text-[#111827]">★ {mvpPlayer.name}</p>
          <p className="text-sm text-[#6B7280] mt-0.5">{mvpPlayer.footballTeam.name}</p>
        </div>
      )}

      {windowOpen && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center text-sm text-blue-700">
          🗳️ Finestra di voto MVP aperta — <Link href="/login" className="font-medium underline">accedi per votare</Link>
        </div>
      )}

      {match.players.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[#111827] mb-3">Giocatori in campo ({match.players.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {match.players.map(({ player }) => (
              <div
                key={player.id}
                className="admin-card p-3 flex items-center gap-2"
                style={{ borderLeft: `3px solid ${player.role === "P" ? "#10B981" : "#3B82F6"}` }}
              >
                <RoleBadge role={player.role} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#111827] truncate">{player.name}</p>
                  <p className="text-xs text-[#6B7280] truncate">{player.footballTeam.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {match.status === "PUBLISHED" && match.bonuses.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[#111827] mb-3">Bonus assegnati</h2>
          <div className="admin-card overflow-hidden">
            {[...bonusByPlayer.entries()].map(([playerName, bonuses], index, entries) => (
              <div
                key={playerName}
                className={`px-4 py-3 ${index < entries.length - 1 ? "border-b border-[#F3F4F6]" : ""}`}
              >
                <p className="font-medium text-sm text-[#111827] mb-1">{playerName}</p>
                <div className="flex flex-wrap gap-1">
                  {bonuses.map((b) => (
                    <span
                      key={b.id}
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        Number(b.points) >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {b.bonusType.code}
                      {b.quantity > 1 && ` ×${b.quantity}`} {Number(b.points) > 0 ? "+" : ""}
                      {Number(b.points)}pt
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
