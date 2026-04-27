import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Button } from "primereact/button";
import { AUTH_ONBOARDING_PATH } from "@/lib/post-auth";
import { computeTeamHistory } from "@/lib/scoring";
import { MVP_WINDOW_MS } from "@/lib/domain/vote";
import ScoreTable from "../squadra/_score-table";

export default async function DashboardPage() {
  const user = await requireAuth();
  const userId = Number(user.id);

  const fantasyTeam = await db.fantasyTeam.findUnique({
    where: { userId },
    include: {
      players: { include: { player: { select: { id: true, name: true, role: true } } } },
    },
  });

  if (!fantasyTeam) {
    redirect(AUTH_ONBOARDING_PATH);
  }

  const history = await computeTeamHistory(fantasyTeam.id);

  const voteCutoff = new Date(Date.now() - MVP_WINDOW_MS);
  const openMatches = await db.match.findMany({
    where: { status: "CONCLUDED", concludedAt: { gte: voteCutoff } },
    orderBy: { concludedAt: "desc" },
    take: 3,
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
    },
  });

  const [hasVoted, pushCount] = await Promise.all([
    db.vote.findMany({
      where: { userId, matchId: { in: openMatches.map((m) => m.id) } },
      select: { matchId: true },
    }),
    db.pushSubscription.count({ where: { userId } }),
  ]);
  const votedMatchIds = new Set(hasVoted.map((v) => v.matchId));
  console.log(`[Dashboard] user=${userId} pushSubscriptions=${pushCount}`);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <div className="over-label mb-0.5">Bentornato</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          {user.name ? user.name.toUpperCase() : user.email.split("@")[0].toUpperCase()}
        </h1>
      </div>

      {/* Admin CTA */}
      {user.role === "ADMIN" && (
        <div className="card p-4 flex items-center justify-between gap-4">
          <div>
            <div className="font-display font-black text-[13px] uppercase" style={{ color: "var(--text-primary)" }}>
              ACCESSO AMMINISTRATORE
            </div>
            <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              Gestisci partite, bonus e dati del campionato.
            </div>
          </div>
          <Link href="/admin">
            <Button label="Admin →" size="small" />
          </Link>
        </div>
      )}

      {/* Squadra */}
      <div
        className="rounded-[18px] p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)", boxShadow: "0 6px 24px rgba(1,7,163,0.30)" }}
      >
        <div className="absolute right-[-20px] bottom-[-20px] w-28 h-28 rounded-full border border-white/5 pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">La mia squadra</div>
              <div className="font-display font-black text-xl uppercase text-white">{fantasyTeam.name}</div>
            </div>
            <Link href="/squadra" className="text-[10px] font-bold uppercase tracking-wide text-white/60 hover:text-white transition-colors mt-1">
              VEDI →
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {fantasyTeam.players.map(({ player }) => {
              const isCaptain = player.id === fantasyTeam.captainPlayerId;
              return (
                <span
                  key={player.name}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={isCaptain
                    ? { background: "rgba(232,160,0,0.15)", border: "1px solid #E8A000", color: "#E8A000" }
                    : { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.9)" }
                  }
                >
                  {isCaptain && <span style={{ fontSize: "9px" }}>★</span>}
                  {player.name}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vota MVP */}
      {openMatches.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-soft)" }}>
            <div className="over-label">Vota MVP</div>
            <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: "#E8A000" }}>
              {openMatches.filter((m) => !votedMatchIds.has(m.id)).length} aperti
            </span>
          </div>
          {openMatches.map((m, index) => {
            const voted = votedMatchIds.has(m.id);
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
                style={index < openMatches.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
              >
                <div className="font-display font-black text-[12px] uppercase min-w-0 flex-1" style={{ color: "var(--text-primary)" }}>
                  {m.homeTeam?.name ?? m.homeSeed ?? "TBD"}{" "}
                  <span style={{ color: "var(--text-disabled)", fontFamily: "inherit", fontWeight: 400, fontSize: "10px" }}>vs</span>{" "}
                  {m.awayTeam?.name ?? m.awaySeed ?? "TBD"}
                </div>
                {voted ? (
                  <Link href={`/vota/${m.id}`} className="flex-shrink-0">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ background: "var(--primary-light)", color: "var(--primary)", border: "1px solid rgba(1,7,163,0.15)" }}
                    >
                      ✓ Votato
                    </span>
                  </Link>
                ) : (
                  <Link href={`/vota/${m.id}`} className="flex-shrink-0">
                    <button
                      className="rounded-full font-black text-[10px] uppercase tracking-wide px-3 py-1.5 whitespace-nowrap"
                      style={{ background: "#E8A000", color: "#06073D", boxShadow: "0 2px 6px rgba(232,160,0,0.35)" }}
                    >
                      VOTA
                    </button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Storico punteggi */}
      {history.length > 0 && (
        <div>
          <div className="over-label mb-3">Storico punteggi</div>
          <div className="flex flex-col gap-2">
            {history.map((ms) => (
              <details key={ms.matchId} className="group overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 transition-colors hover:bg-[var(--surface-1)]">
                  <div className="flex items-center gap-2">
                    <i className="pi pi-chevron-right text-[10px] text-[var(--text-muted)] transition-transform group-open:rotate-90" />
                    <span className="font-display text-[13px] font-black uppercase" style={{ color: "var(--text-primary)" }}>
                      {ms.label}
                    </span>
                  </div>
                  <span className="font-display text-base font-black" style={{ color: "var(--primary)" }}>
                    {ms.total.toFixed(1)} pt
                  </span>
                </summary>
                <div className="px-4 pb-3.5 pt-1">
                  <ScoreTable rows={ms.playerScores} />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
