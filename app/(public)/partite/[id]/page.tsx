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
        include: { player: { include: { footballTeam: { select: { name: true } } } } },
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
    <div className="flex flex-col gap-5">
      <Link
        href="/partite"
        className="flex items-center gap-1.5 text-xs font-semibold w-fit transition-colors hover:opacity-70"
        style={{ color: "var(--text-muted)" }}
      >
        <i className="pi pi-arrow-left text-[10px]" /> Tutte le partite
      </Link>

      {/* Header partita */}
      <div
        className="rounded-[18px] p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)", boxShadow: "0 6px 24px rgba(1,7,163,0.30)" }}
      >
        <div className="absolute right-[-20px] top-[-20px] w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute right-[10px] top-[10px] w-16 h-16 rounded-full border border-white/5 pointer-events-none" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="font-display font-black text-xl uppercase text-white leading-tight">
              {match.homeTeam.name}
              <span className="mx-2 text-sm font-normal text-white/40">vs</span>
              {match.awayTeam.name}
            </div>
            <div className="text-[12px] text-white/55 mt-1.5">
              {match.startsAt.toLocaleString("it-IT", { dateStyle: "full", timeStyle: "short" })}
            </div>
          </div>
          <div className="flex-shrink-0 mt-0.5">
            <StatusBadge status={match.status} />
          </div>
        </div>
      </div>

      {/* MVP */}
      {mvpPlayer && (
        <div className="card p-5 text-center" style={{ borderLeft: "3px solid #E8A000" }}>
          <div className="over-label mb-1">MVP della partita</div>
          <div className="font-display font-black text-2xl uppercase" style={{ color: "var(--text-primary)" }}>
            ★ {mvpPlayer.name}
          </div>
          <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{mvpPlayer.footballTeam.name}</div>
        </div>
      )}

      {/* Finestra voto aperta */}
      {windowOpen && (
        <div
          className="rounded-xl p-3.5 text-center text-sm font-semibold"
          style={{ background: "var(--primary-light)", color: "var(--primary)", border: "1px solid var(--border-medium)" }}
        >
          🗳️ Finestra di voto MVP aperta —{" "}
          <Link href="/login" className="font-black underline">
            accedi per votare
          </Link>
        </div>
      )}

      {/* Giocatori in campo */}
      {match.players.length > 0 && (
        <div>
          <div className="over-label mb-3">
            Giocatori in campo ({match.players.length})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {match.players.map(({ player }) => (
              <div
                key={player.id}
                className="card p-3 flex items-center gap-2.5"
              >
                <RoleBadge role={player.role} />
                <div className="min-w-0">
                  <div className="font-display font-black text-[12px] uppercase truncate" style={{ color: "var(--text-primary)" }}>
                    {player.name}
                  </div>
                  <div className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                    {player.footballTeam.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bonus */}
      {match.status === "PUBLISHED" && match.bonuses.length > 0 && (
        <div>
          <div className="over-label mb-3">Bonus assegnati</div>
          <div className="card overflow-hidden">
            {[...bonusByPlayer.entries()].map(([playerName, bonuses], index, entries) => (
              <div
                key={playerName}
                className="px-4 py-3"
                style={index < entries.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
              >
                <div className="font-display font-black text-[13px] uppercase mb-2" style={{ color: "var(--text-primary)" }}>
                  {playerName}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bonuses.map((b) => (
                    <span
                      key={b.id}
                      className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                      style={
                        Number(b.points) >= 0
                          ? { background: "#ECFDF5", color: "#065F46" }
                          : { background: "#FEF2F2", color: "#991B1B" }
                      }
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
