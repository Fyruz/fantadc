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

  if (mvpPlayer) {
    mvpTeam = mvpPlayer.footballTeamId === homeId ? match.homeTeam : match.awayTeam;
  }

  const homeGoals = match.goals.filter((g) => !g.isOwnGoal && g.scorer.footballTeamId === homeId)
    .concat(match.goals.filter((g) => g.isOwnGoal && g.scorer.footballTeamId === awayId));
  const awayGoals = match.goals.filter((g) => !g.isOwnGoal && g.scorer.footballTeamId === awayId)
    .concat(match.goals.filter((g) => g.isOwnGoal && g.scorer.footballTeamId === homeId));

  const homePlayers = match.players.filter((p) => p.player.footballTeamId === homeId);
  const awayPlayers = match.players.filter((p) => p.player.footballTeamId === awayId);

  const scored = match.homeScore !== null && match.awayScore !== null;

  const TeamLogo = ({ team }: { team: { name: string; countryCode: string | null; logoUrl: string | null } | null }) => {
    if (!team) return <div style={{ width: 64, height: 64 }} />;
    return (
      <div className="flex items-center justify-center shrink-0" style={{ width: 64, height: 64, padding: 4 }}>
        {team.logoUrl ? (
          <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
        ) : team.countryCode ? (
          <img src={`https://flagcdn.com/w80/${team.countryCode.toLowerCase()}.png`} alt={team.name} className="w-full h-auto object-contain rounded-sm" />
        ) : (
          <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-black text-lg">{team.name.slice(0, 2).toUpperCase()}</div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-10">

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
        <div className="p-6 flex flex-col gap-4">
          {/* Teams + score */}
          <div className="flex items-center gap-4">
            {/* Home */}
            <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
              <TeamLogo team={match.homeTeam} />
              <span className="text-sm text-black text-center leading-tight">
                {match.homeTeam?.shortName ?? match.homeTeam?.name ?? match.homeSeed ?? "TBD"}
              </span>
            </div>

            {/* Center */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              {(match.group ?? match.knockoutRound) && (
                <span className="text-xs text-black/65 font-light">
                  {match.group?.name ?? match.knockoutRound?.name}
                </span>
              )}
              {scored ? (
                <span className="font-bold text-(--text-primary) tabular-nums" style={{ fontSize: 24 }}>
                  {match.homeScore} - {match.awayScore}
                </span>
              ) : (
                <span className="font-bold text-(--text-primary)" style={{ fontSize: 24 }}>
                  {match.startsAt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <span className="text-xs text-black/65">
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
            <div className="flex justify-center">
              <span className="text-xs text-black/65">Fischio finale</span>
            </div>
          )}

          {/* Scorers */}
          {match.goals.length > 0 && (
            <div className="flex gap-3 items-start">
              {/* Home scorers */}
              <div className="flex-1 flex flex-col items-end gap-2">
                {homeGoals.map((g, i) => (
                  <span key={i} className="text-xs text-black">
                    {g.scorer.name}{g.isOwnGoal ? " (A)" : ""}
                    {g.minute ? ` ${g.minute}'` : ""}
                  </span>
                ))}
              </div>
              {/* Ball icon */}
              <div className="shrink-0 flex items-start justify-center w-10">
                <img src="/icons/ball.svg" alt="goal" className="w-3 h-3" />
              </div>
              {/* Away scorers */}
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

      {/* ── MVP ────────────────────────────────────────────────────── */}
      {mvpPlayer && (
        <div
          className="bg-white rounded-3xl p-6 flex items-center gap-4"
          style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
        >
          <img src="/images/mvp.webp" alt="MVP" className="shrink-0" />
          <div>
            <p className="text-xs text-black/40 mb-1">MVP della partita</p>
            <div className="flex items-center gap-2">
              {mvpTeam && (
                mvpTeam.logoUrl ? (
                  <img src={mvpTeam.logoUrl} alt={mvpTeam.name} className="w-5 h-5 object-contain shrink-0" />
                ) : mvpTeam.countryCode ? (
                  <img src={`https://flagcdn.com/w40/${mvpTeam.countryCode.toLowerCase()}.png`} alt={mvpTeam.name} className="h-3 w-auto object-contain rounded-sm shrink-0" />
                ) : null
              )}
              <p className="text-base font-semibold text-(--text-primary)">{mvpPlayer.name}</p>
            </div>
          </div>
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
              <p className="text-xs text-black/40 mb-1">Il tuo MVP</p>
              <div className="flex items-center gap-2">
                {userVote.player.footballTeam.logoUrl ? (
                  <img src={userVote.player.footballTeam.logoUrl} alt={userVote.player.footballTeam.name} className="w-5 h-5 object-contain shrink-0" />
                ) : userVote.player.footballTeam.countryCode ? (
                  <img src={`https://flagcdn.com/w40/${userVote.player.footballTeam.countryCode.toLowerCase()}.png`} alt={userVote.player.footballTeam.name} className="h-3 w-auto object-contain rounded-sm shrink-0" />
                ) : null}
                <p className="text-base font-semibold text-(--text-primary)">{userVote.player.name}</p>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href={user ? `/vota/${matchId}` : "/login"}
            className="bg-white rounded-3xl p-6 flex items-center gap-4"
            style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
          >
            <img src="/images/mvp.webp" alt="MVP" className="shrink-0" />
            <div className="flex-1">
              <h2
                className="uppercase text-base font-medium text-(--text-primary) mb-2"
                style={{ fontFamily: "var(--font-tallica)" }}
              >
                Vota l&apos;MVP della giornata
              </h2>
              <p className="text-sm text-black mb-2">
                Scegli il migliore in campo e fai contare il tuo voto!
              </p>
              <span className="text-sm font-semibold text-(--text-primary)">
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
              className="uppercase text-base font-medium text-(--text-primary)"
              style={{ fontFamily: "var(--font-tallica)" }}
            >
              Giocatori
            </h2>
          </div>

          <div className="flex">
            {/* Home column */}
            <div className="flex-1 min-w-0 px-6 pb-6">
              {/* Team header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="shrink-0 flex items-center justify-center" style={{ width: 32, height: 32, padding: 4 }}>
                  {match.homeTeam?.logoUrl ? (
                    <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-full h-full object-contain" />
                  ) : match.homeTeam?.countryCode ? (
                    <img src={`https://flagcdn.com/w40/${match.homeTeam.countryCode.toLowerCase()}.png`} alt={match.homeTeam.name} className="w-full h-auto object-contain rounded-sm" />
                  ) : null}
                </div>
                <span className="text-sm font-medium text-black truncate">
                  {match.homeTeam?.shortName ?? match.homeTeam?.name ?? "Casa"}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {homePlayers.map(({ player }) => (
                  <div key={player.id} className="flex items-center gap-3">
                    <i className="pi pi-user shrink-0" style={{ fontSize: 12, color: "rgba(9,20,76,0.3)" }} />
                    <span className="text-sm text-black truncate">{player.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Away column */}
            <div className="flex-1 min-w-0 px-6 pb-6">
              {/* Team header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="shrink-0 flex items-center justify-center" style={{ width: 32, height: 32, padding: 4 }}>
                  {match.awayTeam?.logoUrl ? (
                    <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-full h-full object-contain" />
                  ) : match.awayTeam?.countryCode ? (
                    <img src={`https://flagcdn.com/w40/${match.awayTeam.countryCode.toLowerCase()}.png`} alt={match.awayTeam.name} className="w-full h-auto object-contain rounded-sm" />
                  ) : null}
                </div>
                <span className="text-sm font-medium text-black truncate">
                  {match.awayTeam?.shortName ?? match.awayTeam?.name ?? "Ospiti"}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {awayPlayers.map(({ player }) => (
                  <div key={player.id} className="flex items-center gap-3">
                    <i className="pi pi-user shrink-0" style={{ fontSize: 12, color: "rgba(9,20,76,0.3)" }} />
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
