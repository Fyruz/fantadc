import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { BackButton } from "./BackButton";
import { getFlagUrlFromCountryCode } from "@/lib/flags";

export const revalidate = 60;

type Tab = "sommario" | "partite" | "classifica" | "rosa";

type MatchTeam = {
  id: number;
  name: string;
  shortName: string | null;
  countryCode: string | null;
  logoUrl: string | null;
};

type MatchRow = {
  id: number;
  startsAt: Date | null;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeSeed: string | null;
  awaySeed: string | null;
  homeTeam: MatchTeam | null;
  awayTeam: MatchTeam | null;
  group: { name: string; slug: string } | null;
  knockoutRound: { name: string } | null;
};

export default async function SquadraPublicDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const teamId = Number(id);
  if (!Number.isInteger(teamId) || teamId <= 0) notFound();

  const rawTab = sp.tab;
  const activeTab: Tab = ["sommario", "partite", "classifica", "rosa"].includes(rawTab ?? "")
    ? (rawTab as Tab)
    : "sommario";

  const [team, nextMatch, teamGroup, scorerGroups, teamMatches] = await Promise.all([
    db.footballTeam.findUnique({
      where: { id: teamId },
      select: {
        id: true, name: true, shortName: true, countryCode: true, logoUrl: true,
        players: {
          orderBy: [{ role: "desc" }, { name: "asc" }],
          select: { id: true, name: true, role: true },
        },
      },
    }),
    db.match.findFirst({
      where: {
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        status: "SCHEDULED",
      },
      orderBy: { startsAt: "asc" },
      select: {
        id: true, startsAt: true, status: true, homeScore: true, awayScore: true, homeSeed: true, awaySeed: true,
        homeTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
        group: { select: { name: true, slug: true } },
        knockoutRound: { select: { name: true } },
      },
    }),
    db.group.findFirst({
      where: { teams: { some: { footballTeamId: teamId } } },
      include: {
        teams: {
          include: {
            footballTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
          },
        },
        matches: {
          where: { status: "CONCLUDED", homeScore: { not: null }, awayScore: { not: null } },
          select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true },
        },
      },
    }),
    db.matchGoal.groupBy({
      by: ["scorerId"],
      where: { scorer: { footballTeamId: teamId } },
      _count: { scorerId: true },
      orderBy: { _count: { scorerId: "desc" } },
      take: 5,
    }),
    db.match.findMany({
      where: {
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        status: "CONCLUDED",
      },
      orderBy: { startsAt: "desc" },
      select: {
        id: true, startsAt: true, status: true, homeScore: true, awayScore: true, homeSeed: true, awaySeed: true,
        homeTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
        group: { select: { name: true, slug: true } },
        knockoutRound: { select: { name: true } },
      },
    }),
  ]);

  if (!team) notFound();

  // Scorer names
  const scorerIds = scorerGroups.map((s) => s.scorerId);
  const scorerPlayers = scorerIds.length > 0
    ? await db.player.findMany({ where: { id: { in: scorerIds } }, select: { id: true, name: true } })
    : [];
  const scorerMap = new Map(scorerPlayers.map((p) => [p.id, p.name]));
  const scorerRows = scorerGroups.map((s) => ({
    name: scorerMap.get(s.scorerId) ?? "—",
    goals: s._count.scorerId,
  }));

  // Group standings
  type StandingRow = { teamId: number; name: string; shortName: string | null; countryCode: string | null; logoUrl: string | null; played: number; won: number; drawn: number; lost: number; goalDiff: number; points: number };
  let standings: StandingRow[] = [];
  if (teamGroup) {
    const map = new Map<number, StandingRow>();
    for (const gt of teamGroup.teams) {
      map.set(gt.footballTeamId, {
        teamId: gt.footballTeamId, name: gt.footballTeam.name,
        shortName: gt.footballTeam.shortName, countryCode: gt.footballTeam.countryCode, logoUrl: gt.footballTeam.logoUrl,
        played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0,
      });
    }
    for (const m of teamGroup.matches) {
      if (!m.homeTeamId || !m.awayTeamId) continue;
      const hs = m.homeScore!; const as_ = m.awayScore!;
      const home = map.get(m.homeTeamId); const away = map.get(m.awayTeamId);
      if (home) {
        home.played++; home.goalDiff += hs - as_;
        if (hs > as_) { home.won++; home.points += 3; } else if (hs === as_) { home.drawn++; home.points += 1; } else home.lost++;
      }
      if (away) {
        away.played++; away.goalDiff += as_ - hs;
        if (as_ > hs) { away.won++; away.points += 3; } else if (hs === as_) { away.drawn++; away.points += 1; } else away.lost++;
      }
    }
    standings = [...map.values()].sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || a.name.localeCompare(b.name, "it"));
  }

  const flagSrc = team.logoUrl ?? getFlagUrlFromCountryCode(team.countryCode);
  const TABS: { key: Tab; label: string }[] = [
    { key: "sommario", label: "Sommario" },
    { key: "partite", label: "Partite" },
    { key: "classifica", label: "Classifica" },
    { key: "rosa", label: "Rosa" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Back — mobile only (top nav is hidden on this route) */}
      <div className="md:hidden flex items-center">
        <BackButton />
      </div>

      {/* Team identity */}
      <div className="flex flex-col gap-4">
        {flagSrc && (
          <img src={flagSrc} alt={team.name} className="w-16 h-16 object-contain" />
        )}
        <h1 className="text-xl font-semibold text-black">{team.name}</h1>
      </div>

      {/* Tab bar */}
      <div className="flex -mx-4 px-4" style={{ borderBottom: "1px solid rgba(9,20,76,0.08)" }}>
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`?tab=${t.key}`}
            replace
            className={`shrink-0 text-sm pb-2 mr-6 transition-colors ${activeTab === t.key ? "font-semibold" : "font-normal"}`}
            style={{
              color: activeTab === t.key ? "var(--text-primary)" : "rgba(0,0,0,0.65)",
              borderBottom: activeTab === t.key ? "2px solid var(--text-primary)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === "sommario" && (
        <SommarioTab nextMatch={nextMatch} lastMatch={teamMatches[0] ?? null} players={team.players} scorerRows={scorerRows} teamId={teamId} />
      )}
      {activeTab === "partite" && <PartiteTab matches={teamMatches} />}
      {activeTab === "classifica" && (
        <ClassificaTab standings={standings} groupName={teamGroup?.name} teamId={teamId} />
      )}
      {activeTab === "rosa" && <RosaTab players={team.players} />}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function teamFlag(t: { countryCode: string | null; logoUrl: string | null } | null) {
  if (!t) return null;
  return t.logoUrl ?? getFlagUrlFromCountryCode(t.countryCode);
}

function roleIcon(role: string) {
  return role === "P" ? "/icons/goalkeeper.svg" : "/icons/player.svg";
}

function roleLabel(role: string) {
  return role === "P" ? "Portiere" : "Giocatore";
}

function formatTime(date: Date | null) {
  if (!date) return null;
  return date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}


// ─── Sommario ────────────────────────────────────────────────────────────────

function SommarioTab({
  nextMatch,
  lastMatch,
  players,
  scorerRows,
  teamId,
}: {
  nextMatch: MatchRow | null;
  lastMatch: MatchRow | null;
  players: { id: number; name: string; role: string }[];
  scorerRows: { name: string; goals: number }[];
  teamId: number;
}) {
  const featuredMatch = nextMatch ?? lastMatch;
  const featuredLabel = nextMatch ? "Prossima partita" : "Ultima partita";

  return (
    <div className="flex flex-col gap-10">
      {/* Prossima / Ultima partita */}
      {featuredMatch && featuredMatch.homeTeam && featuredMatch.awayTeam && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-medium text-black">{featuredLabel}</h2>
            <Link href={`?tab=partite`} replace className="text-xs font-semibold text-black">Vedi tutto</Link>
          </div>
          <Link
            href={`/partite/${featuredMatch.id}`}
            className="bg-white rounded-3xl p-6 flex flex-col gap-4"
            style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
          >
            {(() => {
              const label = featuredMatch.group?.name ?? featuredMatch.knockoutRound?.name ?? null;
              const date = featuredMatch.startsAt ? featuredMatch.startsAt.toLocaleDateString("it-IT", { day: "numeric", month: "short" }) : null;
              return (label || date) ? (
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}>
                  {label && <span className="text-sm text-black">{label}</span>}
                  {date && <span className="text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>{date}</span>}
                </div>
              ) : null;
            })()}
            <div className="flex gap-6 items-center">
              <div className="flex flex-col gap-3 flex-1 min-w-0 pr-6" style={{ borderRight: "1px solid rgba(9,20,76,0.05)" }}>
                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center p-1 w-8 h-8">
                    <PartiteTeamLogo team={featuredMatch.homeTeam} />
                  </div>
                  <span className="text-sm text-black flex-1 truncate">{featuredMatch.homeTeam.shortName ?? featuredMatch.homeTeam.name}</span>
                  {!nextMatch && <span className="text-sm font-semibold text-black shrink-0">{featuredMatch.homeScore}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center p-1 w-8 h-8">
                    <PartiteTeamLogo team={featuredMatch.awayTeam} />
                  </div>
                  <span className="text-sm text-black flex-1 truncate">{featuredMatch.awayTeam.shortName ?? featuredMatch.awayTeam.name}</span>
                  {!nextMatch && <span className="text-sm font-semibold text-black shrink-0">{featuredMatch.awayScore}</span>}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 shrink-0">
                {nextMatch
                  ? formatTime(featuredMatch.startsAt) && <span className="text-sm text-black">{formatTime(featuredMatch.startsAt)}</span>
                  : <span className="text-xs font-medium" style={{ color: "rgba(0,0,0,0.65)" }}>Fischio finale</span>
                }
                <span className="text-xs font-medium text-black">Vedi i dettagli</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Rosa preview */}
      {players.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-medium text-black">Rosa</h2>
            <Link href="?tab=rosa" replace className="text-xs font-semibold text-black">Vedi tutto</Link>
          </div>
          <div className="flex gap-5 overflow-x-auto -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
            {[...players].sort((a, b) => (a.role === "P" ? -1 : b.role === "P" ? 1 : 0)).slice(0, 6).map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-2 shrink-0 w-[72px]">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "#fff", border: "1px solid rgba(9,20,76,0.08)" }}
                >
                  <img src={roleIcon(p.role)} alt={roleLabel(p.role)} width={32} height={32} />
                </div>
                <span className="text-xs text-black text-center font-medium line-clamp-2">{p.name}</span>
                <span className="text-[10px] text-center" style={{ color: "rgba(0,0,0,0.45)" }}>{roleLabel(p.role)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marcatori */}
      {scorerRows.length > 0 && (
        <div>
          <h2 className="text-base font-medium text-black mb-6">Marcatori</h2>
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
          >
            {scorerRows.map((row, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4"
                style={{ borderTop: i > 0 ? "1px solid rgba(9,20,76,0.05)" : undefined }}
              >
                <span className="text-sm text-black w-5 shrink-0 tabular-nums">{i + 1}</span>
                <span className="text-sm text-black flex-1">{row.name}</span>
                <span className="text-sm font-bold text-black tabular-nums">{row.goals}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Partite ─────────────────────────────────────────────────────────────────

function PartiteTab({ matches }: { matches: MatchRow[] }) {
  if (matches.length === 0) {
    return <p className="text-sm text-center py-12" style={{ color: "rgba(0,0,0,0.4)" }}>Nessuna partita precedente.</p>;
  }
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-medium text-black">Partite precedenti</h2>
      {matches.map((m) => {
        const scored = m.homeScore !== null && m.awayScore !== null;
        const concluded = m.status === "CONCLUDED";
        const time = m.startsAt ? m.startsAt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) : null;
        const date = m.startsAt ? m.startsAt.toLocaleDateString("it-IT", { day: "numeric", month: "short" }) : null;
        const label = m.group?.name ?? m.knockoutRound?.name ?? null;
        return (
          <Link
            key={m.id}
            href={`/partite/${m.id}`}
            className="bg-white rounded-3xl p-6 flex flex-col gap-4"
            style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
          >
            {(label || date) && (
              <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}>
                {label && <span className="text-sm text-black">{label}</span>}
                {date && <span className="text-sm text-black" style={{ color: "rgba(0,0,0,0.45)" }}>{date}</span>}
              </div>
            )}
            <div className="flex gap-6 items-center">
              <div className="flex flex-col gap-3 flex-1 min-w-0 pr-6" style={{ borderRight: "1px solid rgba(9,20,76,0.05)" }}>
                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center p-1 w-8 h-8">
                    <PartiteTeamLogo team={m.homeTeam} />
                  </div>
                  <span className="text-sm text-black flex-1 truncate">{m.homeTeam?.shortName ?? m.homeTeam?.name ?? m.homeSeed ?? "TBD"}</span>
                  {scored && <span className="text-sm font-semibold text-black shrink-0">{m.homeScore}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center p-1 w-8 h-8">
                    <PartiteTeamLogo team={m.awayTeam} />
                  </div>
                  <span className="text-sm text-black flex-1 truncate">{m.awayTeam?.shortName ?? m.awayTeam?.name ?? m.awaySeed ?? "TBD"}</span>
                  {scored && <span className="text-sm font-semibold text-black shrink-0">{m.awayScore}</span>}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 shrink-0">
                {concluded
                  ? <span className="text-xs font-medium" style={{ color: "rgba(0,0,0,0.65)" }}>Fischio finale</span>
                  : time && <span className="text-sm text-black">{time}</span>
                }
                <span className="text-xs font-medium text-black">Vedi i dettagli</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function PartiteTeamLogo({ team }: { team: MatchTeam | null }) {
  if (!team) return null;
  if (team.logoUrl) return <img src={team.logoUrl} alt={team.name} style={{ width: 24, height: 24, objectFit: "contain" }} />;
  if (team.countryCode) { const flagSrc = getFlagUrlFromCountryCode(team.countryCode); if (flagSrc) return <img src={flagSrc} alt={team.name} style={{ width: 24, height: 16, objectFit: "contain" }} />; }
  return null;
}

// ─── Classifica ──────────────────────────────────────────────────────────────

function ClassificaTab({
  standings,
  groupName,
  teamId,
}: {
  standings: { teamId: number; name: string; shortName: string | null; countryCode: string | null; logoUrl: string | null; played: number; won: number; drawn: number; lost: number; goalDiff: number; points: number }[];
  groupName: string | undefined;
  teamId: number;
}) {
  if (standings.length === 0) {
    return <p className="text-sm text-center py-12" style={{ color: "rgba(0,0,0,0.4)" }}>Classifica non disponibile.</p>;
  }

  const cols: { key: keyof typeof standings[0]; label: string }[] = [
    { key: "played", label: "PG" },
    { key: "won", label: "V" },
    { key: "drawn", label: "N" },
    { key: "lost", label: "S" },
    { key: "goalDiff", label: "DR" },
    { key: "points", label: "PT" },
  ];

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden pb-3"
      style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
    >
      {groupName && (
        <div className="px-6 pt-6 pb-3">
          <h2
            className="uppercase text-base font-medium"
            style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)", wordSpacing: "0.3em" }}
          >
            {groupName}
          </h2>
        </div>
      )}

      {/* Table header */}
      <div className="flex items-center gap-2 px-6 pb-3">
        <span className="text-xs font-semibold uppercase text-black/40 w-5 shrink-0" />
        <span className="text-xs font-semibold uppercase text-black/40 flex-1">Squadra</span>
        {cols.map((c) => (
          <span key={c.key} className="text-xs font-semibold uppercase text-black/40 w-7 text-center shrink-0">{c.label}</span>
        ))}
      </div>

      {standings.map((row, i) => {
        const isCurrentTeam = row.teamId === teamId;
        const flagUrl = row.logoUrl ?? getFlagUrlFromCountryCode(row.countryCode);
        return (
          <div
            key={row.teamId}
            className="flex items-center gap-2 px-6 py-3"
            style={{
              borderTop: "1px solid rgba(9,20,76,0.05)",
              background: isCurrentTeam ? "rgba(1,7,163,0.04)" : undefined,
            }}
          >
            <span className="text-xs text-black/40 w-5 shrink-0 tabular-nums">{i + 1}</span>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {row.logoUrl ? (
                <img
                  src={row.logoUrl}
                  alt={row.name}
                  width={30}
                  height={20}
                  className=""
                />
              ) : row.countryCode ? (
                <img
                  src={getFlagUrlFromCountryCode(row.countryCode)!}
                  alt={row.name}
                  width={30}
                  height={20}
                  className=""
                />
              ) : null}
              <span className={`text-sm truncate ${isCurrentTeam ? "font-semibold" : "font-normal"}`} style={{ color: "var(--text-primary)" }}>
                {row.shortName ?? row.name}
              </span>
            </div>
            {cols.map((c) => {
              const val = row[c.key] as number;
              const display = c.key === "goalDiff" && val > 0 ? `+${val}` : val;
              return (
                <span
                  key={c.key}
                  className="text-sm w-7 text-center shrink-0 tabular-nums"
                  style={{ color: "var(--text-primary)", fontWeight: c.key === "points" ? 700 : 400 }}
                >
                  {display}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Rosa ────────────────────────────────────────────────────────────────────

function RosaTab({ players }: { players: { id: number; name: string; role: string }[] }) {
  if (players.length === 0) {
    return <p className="text-sm text-center py-12" style={{ color: "rgba(0,0,0,0.4)" }}>Nessun giocatore presente.</p>;
  }

  const goalkeepers = players.filter((p) => p.role === "P");
  const outfield = players.filter((p) => p.role !== "P");

  return (
    <div className="flex flex-col gap-6">
      {goalkeepers.length > 0 && <PlayerGroup title="Portieri" players={goalkeepers} />}
      {outfield.length > 0 && <PlayerGroup title="Giocatori" players={outfield} />}
    </div>
  );
}

function PlayerGroup({ title, players }: { title: string; players: { id: number; name: string; role: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-base font-medium text-black">{title}</p>
      <div className="flex flex-col">
        {players.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center gap-4 py-3"
            style={{ borderTop: i > 0 ? "1px solid rgba(9,20,76,0.05)" : undefined }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#fff", border: "1px solid rgba(9,20,76,0.08)" }}
            >
              <img src={roleIcon(p.role)} alt="" width={18} height={18} />
            </div>
            <span className="text-sm text-black flex-1 truncate">{p.name}</span>
            <span className="text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>{roleLabel(p.role)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
