import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { isMvpWindowOpen } from "@/lib/domain/vote";
import { getCurrentUser } from "@/lib/session";

export default async function PartitaPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = Number(id);
  if (Number.isNaN(matchId)) notFound();

  const match = await db.match.findUnique({
    where: { id: matchId, status: { not: "DRAFT" } },
    include: {
      homeTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
      awayTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
      group: { select: { name: true, slug: true } },
      knockoutRound: { select: { name: true } },
      goals: {
        include: {
          scorer: {
            select: { id: true, name: true, footballTeamId: true },
          },
        },
        orderBy: { minute: "asc" },
      },
      players: {
        include: {
          player: {
            select: { id: true, name: true, role: true, footballTeamId: true },
          },
        },
        orderBy: { player: { name: "asc" } },
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

  let mvpPlayer: { name: string; footballTeamId: number } | null = null;
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

  const homeId = match.homeTeam?.id ?? null;
  const awayId = match.awayTeam?.id ?? null;

  const homeGoals = match.goals.filter((g) => !g.isOwnGoal && g.scorer.footballTeamId === homeId)
    .concat(match.goals.filter((g) => g.isOwnGoal && g.scorer.footballTeamId === awayId));
  const awayGoals = match.goals.filter((g) => !g.isOwnGoal && g.scorer.footballTeamId === awayId)
    .concat(match.goals.filter((g) => g.isOwnGoal && g.scorer.footballTeamId === homeId));

  const homePlayers = match.players.filter((p) => p.player.footballTeamId === homeId);
  const awayPlayers = match.players.filter((p) => p.player.footballTeamId === awayId);

  const scored = match.homeScore !== null && match.awayScore !== null;

  const TeamLogo = ({ team }: { team: { name: string; countryCode: string | null; logoUrl: string | null } | null }) => {
    if (!team) return <div className="w-16 h-16" />;
    if (team.logoUrl) return <img src={team.logoUrl} alt={team.name} className="w-16 h-16 object-contain" />;
    if (team.countryCode) return <img src={`https://flagcdn.com/w80/${team.countryCode.toLowerCase()}.png`} alt={team.name} className="w-16 h-10 object-contain rounded-sm" />;
    return <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-black text-lg">{team.name.slice(0, 2).toUpperCase()}</div>;
  };

  return (
    <div className="max-w-lg mx-auto w-full px-4 py-10 flex flex-col gap-6">

      {/* Back */}
      <Link href="/partite" className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--text-primary)">
        <i className="pi pi-arrow-left" style={{ fontSize: 10 }} />
        Tutte le partite
      </Link>

      {/* ── Match card ─────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-3xl overflow-hidden"
        style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
      >
        {/* Teams + score */}
        <div className="px-6 pt-6 pb-4 flex items-start gap-4">
          {/* Home */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <TeamLogo team={match.homeTeam} />
            <span className="text-sm text-black text-center leading-tight">
              {match.homeTeam?.shortName ?? match.homeTeam?.name ?? match.homeSeed ?? "TBD"}
            </span>
          </div>

          {/* Center */}
          <div className="flex flex-col items-center gap-1 shrink-0 pt-2">
            {match.group && (
              <span className="text-xs text-black/40">{match.group.name}</span>
            )}
            {match.knockoutRound && (
              <span className="text-xs text-black/40">{match.knockoutRound.name}</span>
            )}
            {scored ? (
              <span className="text-4xl font-bold text-(--text-primary) tabular-nums">
                {match.homeScore} – {match.awayScore}
              </span>
            ) : (
              <span className="text-4xl font-bold text-(--text-primary)">
                {match.startsAt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <span className="text-xs text-black/40">
              {match.startsAt.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
            {match.status === "CONCLUDED" && (
              <span className="text-xs text-black/40 mt-1">Fischio finale</span>
            )}
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <TeamLogo team={match.awayTeam} />
            <span className="text-sm text-black text-center leading-tight">
              {match.awayTeam?.shortName ?? match.awayTeam?.name ?? match.awaySeed ?? "TBD"}
            </span>
          </div>
        </div>

        {/* Scorers */}
        {match.goals.length > 0 && (
          <div className="px-6 pb-6 pt-2 flex gap-4" style={{ borderTop: "1px solid rgba(9,20,76,0.05)" }}>
            {/* Home scorers */}
            <div className="flex-1 flex flex-col items-end gap-1">
              {homeGoals.map((g, i) => (
                <span key={i} className="text-xs text-black/60">
                  {g.scorer.name}{g.isOwnGoal ? " (A)" : ""}
                  {g.minute ? ` ${g.minute}'` : ""}
                </span>
              ))}
            </div>
            {/* Ball icon */}
            <div className="shrink-0 flex flex-col gap-1 pt-0.5">
              {match.goals.map((_, i) => (
                <i key={i} className="pi pi-circle-fill" style={{ fontSize: 8, color: "rgba(9,20,76,0.2)" }} />
              ))}
            </div>
            {/* Away scorers */}
            <div className="flex-1 flex flex-col items-start gap-1">
              {awayGoals.map((g, i) => (
                <span key={i} className="text-xs text-black/60">
                  {g.scorer.name}{g.isOwnGoal ? " (A)" : ""}
                  {g.minute ? ` ${g.minute}'` : ""}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MVP ────────────────────────────────────────────────────── */}
      {mvpPlayer && (
        <div
          className="bg-white rounded-3xl p-6"
          style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
        >
          <p className="text-xs text-black/40 mb-1">MVP della partita</p>
          <p className="text-base font-semibold text-(--text-primary)">⭐ {mvpPlayer.name}</p>
        </div>
      )}

      {/* ── Vota MVP ───────────────────────────────────────────────── */}
      {windowOpen && (
        <Link
          href={user ? `/vota/${matchId}` : "/login"}
          className="bg-white rounded-3xl p-6 flex items-center gap-4"
          style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
        >
          <div className="flex-1">
            <h2
              className="uppercase text-base font-medium text-(--text-primary) mb-1"
              style={{ fontFamily: "var(--font-tallica)" }}
            >
              Vota l&apos;MVP della giornata
            </h2>
            <p className="text-sm text-black/60 mb-3">
              Scegli il migliore in campo e fai contare il tuo voto!
            </p>
            <span className="text-sm font-semibold text-(--text-primary)">
              {userVote ? `✓ Hai votato: ${userVote.player.name}` : "Accedi e vota"}
            </span>
          </div>
          <i className="pi pi-chevron-right shrink-0" style={{ color: "var(--primary)", fontSize: 14 }} />
        </Link>
      )}

      {/* ── Giocatori ──────────────────────────────────────────────── */}
      {match.players.length > 0 && (
        <div
          className="bg-white rounded-3xl overflow-hidden"
          style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
        >
          <div className="px-6 pt-6 pb-3">
            <h2
              className="uppercase text-base font-medium text-(--text-primary)"
              style={{ fontFamily: "var(--font-tallica)" }}
            >
              Giocatori
            </h2>
          </div>

          <div className="flex" style={{ borderTop: "1px solid rgba(9,20,76,0.05)" }}>
            {/* Home column */}
            <div className="flex-1 min-w-0" style={{ borderRight: "1px solid rgba(9,20,76,0.05)" }}>
              {/* Team header */}
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}>
                {match.homeTeam?.logoUrl ? (
                  <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-5 h-5 object-contain shrink-0" />
                ) : match.homeTeam?.countryCode ? (
                  <img src={`https://flagcdn.com/w40/${match.homeTeam.countryCode.toLowerCase()}.png`} alt={match.homeTeam.name} className="w-5 h-3 object-contain rounded-sm shrink-0" />
                ) : null}
                <span className="text-xs font-semibold text-(--text-primary) truncate">
                  {match.homeTeam?.shortName ?? match.homeTeam?.name ?? "Casa"}
                </span>
              </div>
              {homePlayers.map(({ player }) => (
                <div key={player.id} className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid rgba(9,20,76,0.03)" }}>
                  <i className="pi pi-user shrink-0" style={{ fontSize: 12, color: "rgba(9,20,76,0.3)" }} />
                  <span className="text-sm text-black truncate">{player.name}</span>
                </div>
              ))}
            </div>

            {/* Away column */}
            <div className="flex-1 min-w-0">
              {/* Team header */}
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}>
                {match.awayTeam?.logoUrl ? (
                  <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-5 h-5 object-contain shrink-0" />
                ) : match.awayTeam?.countryCode ? (
                  <img src={`https://flagcdn.com/w40/${match.awayTeam.countryCode.toLowerCase()}.png`} alt={match.awayTeam.name} className="w-5 h-3 object-contain rounded-sm shrink-0" />
                ) : null}
                <span className="text-xs font-semibold text-(--text-primary) truncate">
                  {match.awayTeam?.shortName ?? match.awayTeam?.name ?? "Ospiti"}
                </span>
              </div>
              {awayPlayers.map(({ player }) => (
                <div key={player.id} className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid rgba(9,20,76,0.03)" }}>
                  <i className="pi pi-user shrink-0" style={{ fontSize: 12, color: "rgba(9,20,76,0.3)" }} />
                  <span className="text-sm text-black truncate">{player.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
