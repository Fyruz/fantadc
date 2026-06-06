import { notFound } from "next/navigation";
import BackChevron from "@/components/back-chevron";
import Link from "next/link";
import { db } from "@/lib/db";
import { resolveTeamFlag } from "@/lib/flags";

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
  homeTeam: MatchTeam | null;
  awayTeam: MatchTeam | null;
  group: { name: string } | null;
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
        id: true, startsAt: true, status: true, homeScore: true, awayScore: true,
        homeTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
        group: { select: { name: true } },
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
        NOT: { status: "DRAFT" },
      },
      orderBy: { startsAt: "asc" },
      select: {
        id: true, startsAt: true, status: true, homeScore: true, awayScore: true,
        homeTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
        group: { select: { name: true } },
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
  type StandingRow = { teamId: number; name: string; played: number; won: number; drawn: number; lost: number; goalDiff: number; points: number };
  let standings: StandingRow[] = [];
  if (teamGroup) {
    const map = new Map<number, StandingRow>();
    for (const gt of teamGroup.teams) {
      map.set(gt.footballTeamId, {
        teamId: gt.footballTeamId, name: gt.footballTeam.name,
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
    <div className="flex flex-col gap-10">
      {/* Back — mobile only (top nav is hidden on this route) */}
      <div className="md:hidden h-12 flex items-center">
        <BackChevron />
      </div>

      {/* Team identity */}
      <div className="flex flex-col gap-4">
        {flagSrc && (
          <img src={flagSrc} alt={team.name} className="w-16 h-16 object-contain" />
        )}
        <h1 className="text-base font-semibold text-black">{team.name}</h1>
      </div>

      {/* Tab bar */}
      <div className="flex -mx-4 px-4" style={{ borderBottom: "1px solid rgba(9,20,76,0.08)" }}>
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`?tab=${t.key}`}
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
        <SommarioTab nextMatch={nextMatch} players={team.players} scorerRows={scorerRows} teamId={teamId} />
      )}
      {activeTab === "partite" && <PartiteTab matches={teamMatches} teamId={teamId} />}
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

function formatDate(date: Date | null) {
  if (!date) return null;
  return date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
}

// ─── Sommario ────────────────────────────────────────────────────────────────

function SommarioTab({
  nextMatch,
  players,
  scorerRows,
  teamId,
}: {
  nextMatch: MatchRow | null;
  players: { id: number; name: string; role: string }[];
  scorerRows: { name: string; goals: number }[];
  teamId: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Prossima partita */}
      {nextMatch && nextMatch.homeTeam && nextMatch.awayTeam && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-black">Prossima partita</h2>
            <Link href={`?tab=partite`} className="text-xs font-semibold text-black">Vedi tutto</Link>
          </div>
          <Link
            href={`/partite/${nextMatch.id}`}
            className="bg-white rounded-3xl p-6 flex flex-col gap-4 block"
            style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
          >
            {(nextMatch.group || nextMatch.knockoutRound) && (
              <div className="pb-3" style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}>
                <span className="text-sm text-black">{nextMatch.group?.name ?? nextMatch.knockoutRound?.name}</span>
              </div>
            )}
            <div className="flex gap-6 items-center">
              <div className="flex flex-col gap-3 flex-1 min-w-0 pr-4" style={{ borderRight: "1px solid rgba(9,20,76,0.05)" }}>
                <div className="flex items-center gap-3">
                  {teamFlag(nextMatch.homeTeam) && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center p-1 shrink-0 overflow-hidden" style={{ border: "1px solid rgba(9,20,76,0.06)" }}>
                      <img src={teamFlag(nextMatch.homeTeam)!} alt="" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <span className="text-sm text-black truncate">{nextMatch.homeTeam.shortName ?? nextMatch.homeTeam.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {teamFlag(nextMatch.awayTeam) && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center p-1 shrink-0 overflow-hidden" style={{ border: "1px solid rgba(9,20,76,0.06)" }}>
                      <img src={teamFlag(nextMatch.awayTeam)!} alt="" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <span className="text-sm text-black truncate">{nextMatch.awayTeam.shortName ?? nextMatch.awayTeam.name}</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 shrink-0">
                {formatTime(nextMatch.startsAt) && (
                  <span className="text-sm font-semibold text-black">{formatTime(nextMatch.startsAt)}</span>
                )}
                <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>Vedi i dettagli</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Rosa preview */}
      {players.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-black">Rosa</h2>
            <Link href="?tab=rosa" className="text-xs font-semibold text-black">Vedi tutto</Link>
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
          <h2 className="text-base font-medium text-black mb-4">Marcatori</h2>
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

function PartiteTab({ matches, teamId }: { matches: MatchRow[]; teamId: number }) {
  if (matches.length === 0) {
    return <p className="text-sm text-center py-12" style={{ color: "rgba(0,0,0,0.4)" }}>Nessuna partita disponibile.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {matches.map((m) => {
        const concluded = m.status === "CONCLUDED";
        const label = m.group?.name ?? m.knockoutRound?.name;
        return (
          <Link
            key={m.id}
            href={`/partite/${m.id}`}
            className="bg-white rounded-3xl p-5 flex flex-col gap-4"
            style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
          >
            {label && (
              <div className="pb-3" style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}>
                <span className="text-sm text-black">{label}</span>
              </div>
            )}
            <div className="flex gap-4 items-center">
              <div className="flex flex-col gap-3 flex-1 min-w-0 pr-4" style={{ borderRight: "1px solid rgba(9,20,76,0.05)" }}>
                <div className="flex items-center gap-2">
                  {teamFlag(m.homeTeam) && <img src={teamFlag(m.homeTeam)!} alt="" className="w-6 h-6 object-contain shrink-0" />}
                  <span className="text-sm text-black truncate">{m.homeTeam?.shortName ?? m.homeTeam?.name ?? "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {teamFlag(m.awayTeam) && <img src={teamFlag(m.awayTeam)!} alt="" className="w-6 h-6 object-contain shrink-0" />}
                  <span className="text-sm text-black truncate">{m.awayTeam?.shortName ?? m.awayTeam?.name ?? "—"}</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 shrink-0">
                {concluded ? (
                  <span className="text-lg font-bold text-black tabular-nums">
                    {m.homeScore} – {m.awayScore}
                  </span>
                ) : (
                  <>
                    {formatDate(m.startsAt) && <span className="text-xs text-black capitalize">{formatDate(m.startsAt)}</span>}
                    {formatTime(m.startsAt) && <span className="text-sm font-semibold text-black">{formatTime(m.startsAt)}</span>}
                  </>
                )}
                <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>Vedi i dettagli</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Classifica ──────────────────────────────────────────────────────────────

function ClassificaTab({
  standings,
  groupName,
  teamId,
}: {
  standings: { teamId: number; name: string; played: number; won: number; drawn: number; lost: number; goalDiff: number; points: number }[];
  groupName: string | undefined;
  teamId: number;
}) {
  if (standings.length === 0) {
    return <p className="text-sm text-center py-12" style={{ color: "rgba(0,0,0,0.4)" }}>Classifica non disponibile.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {groupName && (
        <p className="text-sm font-semibold uppercase" style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}>{groupName}</p>
      )}
      <div
        className="bg-white rounded-3xl overflow-hidden"
        style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
      >
        <div className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}>
          <span className="text-xs font-semibold uppercase text-black/50 w-5 shrink-0">POS</span>
          <span className="text-xs font-semibold uppercase text-black/50 flex-1">Squadra</span>
          <span className="text-xs font-semibold uppercase text-black/50 w-6 text-center shrink-0">G</span>
          <span className="text-xs font-semibold uppercase text-black/50 w-5 text-right shrink-0">PT</span>
        </div>
        {standings.map((row, i) => {
          const isCurrentTeam = row.teamId === teamId;
          return (
            <div
              key={row.teamId}
              className="flex items-center gap-4 px-5 py-4"
              style={{
                borderTop: i > 0 ? "1px solid rgba(9,20,76,0.05)" : undefined,
                background: isCurrentTeam ? "rgba(1,7,163,0.04)" : undefined,
              }}
            >
              <span className="text-xs text-black w-5 shrink-0 tabular-nums">{i + 1}</span>
              <span className={`text-sm flex-1 truncate ${isCurrentTeam ? "font-semibold" : "font-normal"} text-black`}>{row.name}</span>
              <span className="text-sm text-black w-6 text-center shrink-0 tabular-nums">{row.played}</span>
              <span className="text-sm font-bold text-black w-5 text-right shrink-0 tabular-nums">{row.points}</span>
            </div>
          );
        })}
      </div>
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
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(0,0,0,0.45)" }}>{title}</p>
      <div
        className="bg-white rounded-3xl overflow-hidden"
        style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
      >
        {players.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center gap-4 px-5 py-4"
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
