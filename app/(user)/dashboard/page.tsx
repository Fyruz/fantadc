import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AUTH_ONBOARDING_PATH } from "@/lib/post-auth";
import { computeTeamHistory } from "@/lib/scoring";
import { isMvpWindowOpen, MVP_WINDOW_MS } from "@/lib/domain/vote";
import { getActiveEditWindow } from "@/lib/roster-edit-window";
import { resolveTeamFlag } from "@/lib/flags";
import ScoreTable from "../squadra/_score-table";
import { Button } from "primereact/button";
import ShareStoryButton from "../squadra/_share-story-button";

export default async function DashboardPage() {
  const user = await requireAuth();
  const userId = Number(user.id);

  const fantasyTeam = await db.fantasyTeam.findUnique({
    where: { userId },
    include: {
      players: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              role: true,
              footballTeam: {
                select: {
                  name: true,
                  shortName: true,
                  countryCode: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!fantasyTeam) {
    redirect(AUTH_ONBOARDING_PATH);
  }

  const history = await computeTeamHistory(fantasyTeam.id);

  // Finestra di modifica rosa ("mercato")
  const editWindow = await getActiveEditWindow();
  let changesLeft = 0;
  if (editWindow) {
    const usage = await db.rosterEditUsage.findUnique({
      where: { windowId_fantasyTeamId: { windowId: editWindow.id, fantasyTeamId: fantasyTeam.id } },
      select: { changesUsed: true },
    });
    changesLeft = Math.max(0, editWindow.maxChanges - (usage?.changesUsed ?? 0));
  }
  const editWindowClosesAt = editWindow
    ? editWindow.closesAt.toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Rome",
      })
    : null;

  const voteCutoff = new Date(Date.now() - MVP_WINDOW_MS);
  const [recentConcludedMatches, expressedVotes] = await Promise.all([
    db.match.findMany({
      where: {
        status: "CONCLUDED",
        concludedAt: { not: null, gte: voteCutoff },
      },
      orderBy: { concludedAt: "desc" },
      include: {
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
      },
    }),
    db.vote.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        player: { select: { name: true } },
        match: {
          select: {
            id: true,
            startsAt: true,
            homeSeed: true,
            awaySeed: true,
            homeTeam: { select: { name: true } },
            awayTeam: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const openMatches = recentConcludedMatches.filter((match) =>
    isMvpWindowOpen(match.concludedAt)
  );
  const votedMatchIds = new Set(expressedVotes.map((vote) => vote.matchId));
  const pendingOpenMatches = openMatches.filter((match) => !votedMatchIds.has(match.id));

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <div className="over-label mb-0.5">Bentornato</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          {user.name ? user.name.toUpperCase() : user.email.split("@")[0].toUpperCase()}
        </h1>
      </div>

      {/* Banner finestra di modifica rosa aperta */}
      {editWindow && (
        <div
          className="flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ background: "rgba(50,215,75,0.10)", border: "1px solid rgba(50,215,75,0.35)" }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#1A7F37" }}>
              <i className="pi pi-unlock text-sm" />
              Modifiche rosa aperte fino al {editWindowClosesAt}
            </div>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              Cambi rimasti: <strong>{changesLeft}/{editWindow.maxChanges}</strong> — il cambio di capitano è libero.
            </p>
          </div>
          <Link
            href="/squadra/modifica"
            className="shrink-0 rounded-full px-4 py-2 text-center text-sm font-semibold text-white"
            style={{ background: "var(--primary)" }}
          >
            Modifica rosa
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
          <div className="grid grid-cols-1 gap-2">
            {fantasyTeam.players.map(({ player }) => {
              const isCaptain = player.id === fantasyTeam.captainPlayerId;
              const flagSrc = resolveTeamFlag(player.footballTeam);
              return (
                <div
                  key={player.id}
                  className="flex items-center gap-2 rounded-2xl px-3 py-2"
                  style={isCaptain
                    ? { background: "rgba(232,160,0,0.15)", border: "1px solid #E8A000", color: "#E8A000" }
                    : { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.9)" }
                  }
                >
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10"
                    style={{ border: "1px solid rgba(255,255,255,0.16)" }}
                  >
                    {flagSrc ? (
                      <img
                        src={flagSrc}
                        alt={player.footballTeam.name}
                        className="h-5 w-5 rounded-sm object-contain"
                      />
                    ) : (
                      <span className="text-[9px] font-black text-white/70">
                        {(player.footballTeam.shortName ?? player.footballTeam.name).slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {isCaptain && <span className="text-[10px]">★</span>}
                      <span className="truncate text-xs font-black uppercase leading-tight">
                        {player.name}
                      </span>
                    </div>
                    <div className="truncate text-[10px] font-medium" style={{ color: isCaptain ? "rgba(232,160,0,0.75)" : "rgba(255,255,255,0.55)" }}>
                      {player.footballTeam.shortName ?? player.footballTeam.name}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase" style={{ background: "rgba(255,255,255,0.10)" }}>
                    {player.role === "P" ? "POR" : "ATT"}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 border-t border-white/10 pt-3">
            <ShareStoryButton teamId={fantasyTeam.id} variant="subtle" />
          </div>
        </div>
      </div>

      {/* Vota MVP */}
      {pendingOpenMatches.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-soft)" }}>
            <div className="over-label">Vota MVP</div>
            <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: "#E8A000" }}>
              {pendingOpenMatches.length} aperti
            </span>
          </div>
          {pendingOpenMatches.map((m, index) => {
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
                style={index < pendingOpenMatches.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
              >
                <div className="font-display font-black text-[12px] uppercase min-w-0 flex-1" style={{ color: "var(--text-primary)" }}>
                  {m.homeTeam?.name ?? m.homeSeed ?? "TBD"}{" "}
                  <span style={{ color: "var(--text-disabled)", fontFamily: "inherit", fontWeight: 400, fontSize: "10px" }}>vs</span>{" "}
                  {m.awayTeam?.name ?? m.awaySeed ?? "TBD"}
                </div>
                <Link href={`/vota/${m.id}`} className="flex-shrink-0">
                  <Button
                    type="button"
                    label="VOTA"
                    className="rounded-full font-black text-[10px] uppercase tracking-wide px-3 py-1.5 whitespace-nowrap"
                    style={{ background: "#E8A000", color: "#06073D", boxShadow: "0 2px 6px rgba(232,160,0,0.35)" }}
                  />
                </Link>
              </div>
            );
          })}
        </div>
      )}
      {pendingOpenMatches.length === 0 && (
        <div className="card px-4 py-3">
          <div className="over-label">Vota MVP</div>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Nessuna partita con votazione aperta in questo momento.
          </p>
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
                  {ms.playerScores.some((ps) => ps.played) ? (
                    <ScoreTable rows={ms.playerScores.filter((ps) => ps.played)} />
                  ) : (
                    <p className="py-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      Nessun giocatore della tua rosa risulta presente in questa partita.
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Storico voti MVP */}
      <div>
        <div className="over-label mb-3">Voti espressi</div>
        <details className="group overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 transition-colors hover:bg-[var(--surface-1)]">
            <div className="flex items-center gap-2">
              <i className="pi pi-chevron-right text-[10px] text-[var(--text-muted)] transition-transform group-open:rotate-90" />
              <span className="font-display text-[13px] font-black uppercase" style={{ color: "var(--text-primary)" }}>
                Storico voti MVP
              </span>
            </div>
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              {expressedVotes.length} voti
            </span>
          </summary>
          <div className="border-t border-[var(--border-soft)] px-4 py-1">
            {expressedVotes.length === 0 ? (
              <p className="py-2 text-xs" style={{ color: "var(--text-muted)" }}>
                Non hai ancora espresso voti MVP.
              </p>
            ) : (
              expressedVotes.map((vote, index) => (
                <Link
                  key={vote.id}
                  href={`/vota/${vote.matchId}`}
                  className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-[var(--surface-1)]"
                  style={index < expressedVotes.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : undefined}
                >
                  <div className="min-w-0">
                    <div className="font-display text-[12px] font-black uppercase" style={{ color: "var(--text-primary)" }}>
                      {vote.match.homeTeam?.name ?? vote.match.homeSeed ?? "TBD"}{" "}
                      <span style={{ color: "var(--text-disabled)", fontFamily: "inherit", fontWeight: 400, fontSize: "10px" }}>vs</span>{" "}
                      {vote.match.awayTeam?.name ?? vote.match.awaySeed ?? "TBD"}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      MVP votato: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{vote.player.name}</span>
                    </div>
                    <div className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                      {vote.createdAt.toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <i className="pi pi-chevron-right text-[10px]" style={{ color: "var(--text-disabled)" }} />
                </Link>
              ))
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
