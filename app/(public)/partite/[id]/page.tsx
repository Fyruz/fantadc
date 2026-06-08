import BackChevron from "@/components/back-chevron";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { isMvpWindowOpen } from "@/lib/domain/vote";
import { resolveMvp } from "@/lib/domain/mvp";
import { getCurrentUser } from "@/lib/session";
import { resolveTeamFlag } from "@/lib/flags";

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
          scorer: { select: { id: true, name: true, footballTeamId: true } },
        },
        orderBy: { minute: "asc" },
      },
      players: {
        include: {
          player: { select: { id: true, name: true, role: true, footballTeamId: true } },
        },
        orderBy: { player: { name: "asc" } },
      },
      votes: { select: { playerId: true } },
    },
  });
  if (!match) notFound();

  const windowOpen = isMvpWindowOpen(match.concludedAt);
  const user = await getCurrentUser();
  const userId = user ? Number(user.id) : null;

  const userVote = windowOpen && userId
    ? await db.vote.findUnique({
        where: { userId_matchId: { userId, matchId } },
        select: {
          player: {
            select: {
              name: true,
              footballTeam: { select: { countryCode: true, logoUrl: true, name: true } },
            },
          },
        },
      })
    : null;

  let mvpPlayer: { name: string; footballTeamId: number } | null = null;
  let mvpTeam: { name: string; countryCode: string | null; logoUrl: string | null } | null = null;
  let mvpPendingAdminDecision = false;
  if (!windowOpen && match.status === "CONCLUDED") {
    const resolution = resolveMvp({
      concludedAt: match.concludedAt,
      votes: match.votes,
      mvpOverridePlayerId: match.mvpOverridePlayerId,
      eligiblePlayerIds: match.players.map((p) => p.playerId),
    });
    if (resolution.status === "resolved") {
      const mp = match.players.find((p) => p.playerId === resolution.playerId);
      if (mp) mvpPlayer = mp.player;
    } else if (resolution.status === "tied") {
      mvpPendingAdminDecision = true;
    }
  }

  const homeId = match.homeTeam?.id ?? null;
  const awayId = match.awayTeam?.id ?? null;

  if (mvpPlayer) {
    mvpTeam = mvpPlayer.footballTeamId === homeId ? match.homeTeam : match.awayTeam;
  }

  const homeGoals = match.goals
    .filter((g) => !g.isOwnGoal && g.scorer.footballTeamId === homeId)
    .concat(match.goals.filter((g) => g.isOwnGoal && g.scorer.footballTeamId === awayId));
  const awayGoals = match.goals
    .filter((g) => !g.isOwnGoal && g.scorer.footballTeamId === awayId)
    .concat(match.goals.filter((g) => g.isOwnGoal && g.scorer.footballTeamId === homeId));

  const homePlayers = match.players.filter((p) => p.player.footballTeamId === homeId);
  const awayPlayers = match.players.filter((p) => p.player.footballTeamId === awayId);

  const scored = match.homeScore !== null && match.awayScore !== null;

  const TeamLogo = ({ team, size = 64 }: { team: { name: string; countryCode: string | null; logoUrl: string | null } | null; size?: number }) => {
    if (!team) return <div style={{ width: size, height: size }} />;
    const src = resolveTeamFlag(team);
    return (
      <div className="flex items-center justify-center shrink-0" style={{ width: size, height: size, padding: 4 }}>
        {src ? (
          <img src={src} alt={team.name} className="w-full h-auto object-contain rounded-sm" />
        ) : (
          <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-black text-lg">{team.name.slice(0, 2).toUpperCase()}</div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-10 max-w-lg mx-auto">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center relative py-2">
        <BackChevron />
        <h1
          className="uppercase mx-auto font-medium"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          Dettagli Partita
        </h1>
      </div>

      {/* ── Match card ─────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-3xl overflow-hidden"
        style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
      >
        <div className="p-6 flex flex-col gap-4">
          {/* Teams + score */}
          <div className="flex items-center gap-3">
            {/* Home */}
            <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
              <TeamLogo team={match.homeTeam} />
              <span className="text-sm text-black text-center leading-tight">
                {match.homeTeam?.shortName ?? match.homeTeam?.name ?? match.homeSeed ?? "TBD"}
              </span>
            </div>

            {/* Center */}
            <div className="flex flex-col items-center gap-2 shrink-0 text-center overflow-hidden whitespace-nowrap">
              {(match.group ?? match.knockoutRound) && (
                <span className="text-xs font-light" style={{ color: "rgba(0,0,0,0.65)" }}>
                  {match.group?.name ?? match.knockoutRound?.name}
                </span>
              )}
              {scored ? (
                <span className="font-bold text-black tabular-nums" style={{ fontSize: 24 }}>
                  {match.homeScore} - {match.awayScore}
                </span>
              ) : (
                <span className="font-bold text-black" style={{ fontSize: 24 }}>
                  {match.startsAt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <span className="text-xs font-light" style={{ color: "rgba(0,0,0,0.65)" }}>
                {match.startsAt.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </span>
            </div>

            {/* Away */}
            <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
              <TeamLogo team={match.awayTeam} />
              <span className="text-sm text-black text-center leading-tight">
                {match.awayTeam?.shortName ?? match.awayTeam?.name ?? match.awaySeed ?? "TBD"}
              </span>
            </div>
          </div>

          {/* Fischio finale */}
          {match.status === "CONCLUDED" && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs" style={{ color: "rgba(0,0,0,0.65)" }}>Fischio finale</span>
            </div>
          )}

          {/* Scorers */}
          {match.goals.length > 0 && (
            <div className="flex gap-3 items-start">
              <div className="flex-1 flex flex-col items-end gap-2">
                {homeGoals.map((g, i) => (
                  <span key={i} className="text-xs text-black">
                    {g.scorer.name}{g.isOwnGoal ? " (A)" : ""}
                    {g.minute ? ` ${g.minute}'` : ""}
                  </span>
                ))}
              </div>
              <div className="shrink-0 flex items-start justify-center w-10">
                <img src="/icons/ball.svg" alt="goal" className="w-3 h-3" />
              </div>
              <div className="flex-1 flex flex-col items-start gap-2">
                {awayGoals.map((g, i) => (
                  <span key={i} className="text-xs text-black">
                    {g.scorer.name}{g.isOwnGoal ? " (A)" : ""}
                    {g.minute ? ` ${g.minute}'` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MVP ufficiale ───────────────────────────────────────────── */}
      {mvpPlayer && (
        <div
          className="bg-white rounded-3xl p-6 flex items-center gap-4"
          style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
        >
          <img src="/images/mvp.webp" alt="MVP" className="shrink-0" />
          <div>
            <p className="text-xs mb-1" style={{ color: "rgba(0,0,0,0.40)" }}>MVP della partita</p>
            <div className="flex items-center gap-2">
              {mvpTeam && resolveTeamFlag(mvpTeam) ? (
                <img src={resolveTeamFlag(mvpTeam)!} alt={mvpTeam.name} className="h-3 w-auto object-contain rounded-sm shrink-0" />
              ) : null}
              <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{mvpPlayer.name}</p>
            </div>
          </div>
        </div>
      )}

      {mvpPendingAdminDecision && (
        <div
          className="bg-white rounded-3xl p-6"
          style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
        >
          <p className="text-xs mb-1" style={{ color: "rgba(0,0,0,0.40)" }}>MVP della partita</p>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>In attesa di conferma admin per pari voti.</p>
        </div>
      )}

      {/* ── Vota MVP ───────────────────────────────────────────────── */}
      {windowOpen && (
        userVote ? (
          <div
            className="bg-white rounded-3xl p-6 flex items-center gap-4"
            style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
          >
            <img src="/images/mvp.webp" alt="MVP" className="shrink-0" />
            <div>
              <p className="text-xs mb-1" style={{ color: "rgba(0,0,0,0.40)" }}>Il tuo MVP</p>
              <div className="flex items-center gap-2">
                {resolveTeamFlag(userVote.player.footballTeam) ? (
                  <img src={resolveTeamFlag(userVote.player.footballTeam)!} alt={userVote.player.footballTeam.name} className="h-3 w-auto object-contain rounded-sm shrink-0" />
                ) : null}
                <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{userVote.player.name}</p>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href={user ? `/vota/${matchId}` : "/profilo"}
            className="bg-white rounded-3xl p-6 flex items-center gap-4"
            style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
          >
            <img src="/images/mvp.webp" alt="MVP" className="shrink-0" />
            <div className="flex-1">
              <h2
                className="uppercase text-base font-medium mb-2"
                style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
              >
                Vota l&apos;MVP della giornata
              </h2>
              <p className="text-sm text-black mb-2">
                Scegli il migliore in campo e fai contare il tuo voto!
              </p>
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {user ? "Vota" : "Accedi e vota"}
              </span>
            </div>
          </Link>
        )
      )}

      {/* ── Giocatori ──────────────────────────────────────────────── */}
      {match.players.length > 0 && (
        <div
          className="bg-white rounded-3xl overflow-hidden"
          style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
        >
          <div className="px-6 pt-6 pb-4">
            <h2
              className="uppercase font-medium text-base"
              style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
            >
              Giocatori
            </h2>
          </div>

          <div className="flex pb-6">
            {/* Home column */}
            <div className="flex-1 min-w-0 px-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="shrink-0 flex items-center justify-center" style={{ width: 32, height: 32, padding: 4 }}>
                  {match.homeTeam && resolveTeamFlag(match.homeTeam) ? (
                    <img src={resolveTeamFlag(match.homeTeam)!} alt={match.homeTeam.name} className="w-full h-auto object-contain rounded-sm" />
                  ) : null}
                </div>
                <span className="text-sm font-medium text-black truncate">
                  {match.homeTeam?.shortName ?? match.homeTeam?.name ?? "Casa"}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {homePlayers.map(({ player }) => (
                  <div key={player.id} className="flex items-center gap-2">
                    <img src="/icons/jersey.svg" width={14} height={14} alt="" style={{ color: "var(--text-primary)", opacity: 0.7 }} />
                    <span className="text-sm text-black truncate">{player.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Away column */}
            <div className="flex-1 min-w-0 px-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="shrink-0 flex items-center justify-center" style={{ width: 32, height: 32, padding: 4 }}>
                  {match.awayTeam && resolveTeamFlag(match.awayTeam) ? (
                    <img src={resolveTeamFlag(match.awayTeam)!} alt={match.awayTeam.name} className="w-full h-auto object-contain rounded-sm" />
                  ) : null}
                </div>
                <span className="text-sm font-medium text-black truncate">
                  {match.awayTeam?.shortName ?? match.awayTeam?.name ?? "Ospiti"}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {awayPlayers.map(({ player }) => (
                  <div key={player.id} className="flex items-center gap-2">
                    <img src="/icons/jersey.svg" width={14} height={14} alt="" style={{ color: "var(--text-primary)", opacity: 0.7 }} />
                    <span className="text-sm text-black truncate">{player.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
