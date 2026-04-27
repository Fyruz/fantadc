import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { isMvpWindowOpen } from "@/lib/domain/vote";
import { getCurrentUser } from "@/lib/session";
import StatusBadge from "@/components/status-badge";
import RoleBadge from "@/components/role-badge";

export default async function PartitaPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = Number(id);
  if (Number.isNaN(matchId)) notFound();

  const match = await db.match.findUnique({
    where: { id: matchId, status: { not: "DRAFT" } },
    include: {
      homeTeam: { select: { name: true, shortName: true } },
      awayTeam: { select: { name: true, shortName: true } },
      group: { select: { name: true, slug: true } },
      knockoutRound: { select: { name: true } },
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
  const user = await getCurrentUser();
  const userId = user ? Number(user.id) : null;

  const userVote = windowOpen && userId
    ? await db.vote.findUnique({
        where: { userId_matchId: { userId, matchId } },
        select: { player: { select: { name: true } } },
      })
    : null;

  let mvpPlayer: { name: string; footballTeam: { name: string } } | null = null;
  if (!windowOpen && match.status === "CONCLUDED") {
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
        className="rounded-[20px] overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)", boxShadow: "0 6px 24px rgba(1,7,163,0.30)" }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-5 py-3 gap-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <StatusBadge status={match.status} />
            {match.group && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white/70" style={{ background: "rgba(255,255,255,0.12)" }}>
                Girone {match.group.slug}
              </span>
            )}
            {match.knockoutRound && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white/70" style={{ background: "rgba(255,255,255,0.12)" }}>
                {match.knockoutRound.name}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold capitalize text-white/50">
            {match.startsAt.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })}
          </span>
        </div>

        {/* Body */}
        <div className="px-5 py-6 flex items-center gap-3">
          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <span className="font-display font-black text-3xl uppercase leading-none tracking-tight text-white">
              {match.homeTeam?.shortName ?? match.homeTeam?.name ?? match.homeSeed ?? "TBD"}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40 truncate max-w-full">
              {match.homeTeam?.name ?? match.homeSeed ?? "—"}
            </span>
          </div>

          {/* Score / VS */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1 px-2">
            {match.homeScore !== null && match.awayScore !== null ? (
              <div className="font-display font-black text-4xl leading-none text-white">
                {match.homeScore}
                <span className="text-white/30"> — </span>
                {match.awayScore}
              </div>
            ) : (
              <>
                <div className="font-display font-black text-2xl leading-none text-white/30">VS</div>
                <div className="text-[12px] font-bold text-white/50 tabular-nums">
                  {match.startsAt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <span className="font-display font-black text-3xl uppercase leading-none tracking-tight text-white">
              {match.awayTeam?.shortName ?? match.awayTeam?.name ?? match.awaySeed ?? "TBD"}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40 truncate max-w-full">
              {match.awayTeam?.name ?? match.awaySeed ?? "—"}
            </span>
          </div>
        </div>

        {/* Bottom strip — date + time when score is present */}
        {match.homeScore !== null && match.awayScore !== null && (
          <div
            className="px-5 py-2.5 text-center text-[11px] font-semibold text-white/40 capitalize"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            {match.startsAt.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
            {" · "}
            {match.startsAt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
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
        <Link
          href={user ? `/vota/${matchId}` : "/login"}
          className="rounded-xl p-4 flex items-center justify-between gap-3 transition-opacity hover:opacity-90"
          style={{ background: "var(--primary-light)", border: "1px solid var(--border-medium)" }}
        >
          <div>
            <div className="text-sm font-black" style={{ color: "var(--primary)" }}>
              {userVote
                ? `✓ Hai votato: ${userVote.player.name}`
                : "🗳️ Finestra di voto MVP aperta"}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {userVote
                ? "Tocca per vedere il dettaglio del voto"
                : user
                ? "Tocca per votare il tuo MVP"
                : "Accedi per votare"}
            </div>
          </div>
          <i className="pi pi-chevron-right text-sm flex-shrink-0" style={{ color: "var(--primary)" }} />
        </Link>
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
      {match.status === "CONCLUDED" && match.bonuses.length > 0 && (
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
