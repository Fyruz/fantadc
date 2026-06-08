import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { computeVolleyStandings } from "@/lib/volley/standings";
import { BackButton } from "./BackButton";

export const revalidate = 60;

type Tab = "sommario" | "partite" | "classifica" | "rosa";

type VolleyMatchRow = {
  id: number;
  date: Date | null;
  status: string;
  homeSets: number;
  awaySets: number;
  homeTeam: { id: number; name: string } | null;
  awayTeam: { id: number; name: string } | null;
  group: { name: string } | null;
  knockoutRound: { name: string } | null;
};

function computeSets(sets: { homePoints: number; awayPoints: number }[]): { homeSets: number; awaySets: number } {
  return {
    homeSets: sets.filter((s) => s.homePoints > s.awayPoints).length,
    awaySets: sets.filter((s) => s.awayPoints > s.homePoints).length,
  };
}

export default async function VolleySquadraDetailPage({
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

  const [team, nextMatchRaw, teamGroup, teamMatchesRaw] = await Promise.all([
    db.volleyTeam.findUnique({
      where: { id: teamId },
      select: {
        id: true, name: true,
        players: { orderBy: { name: "asc" }, select: { id: true, name: true } },
      },
    }),
    db.volleyMatch.findFirst({
      where: {
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        status: "SCHEDULED",
      },
      orderBy: { date: "asc" },
      select: {
        id: true, date: true, status: true,
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        group: { select: { name: true } },
        knockoutRound: { select: { name: true } },
        sets: { select: { homePoints: true, awayPoints: true } },
      },
    }),
    db.volleyGroup.findFirst({
      where: { teams: { some: { teamId } } },
      select: {
        id: true, name: true,
        teams: { select: { team: { select: { id: true, name: true } } } },
        matches: {
          where: { status: "CONCLUDED" },
          select: {
            homeTeamId: true, awayTeamId: true, status: true,
            sets: { select: { homePoints: true, awayPoints: true } },
          },
        },
      },
    }),
    db.volleyMatch.findMany({
      where: {
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        status: "CONCLUDED",
      },
      orderBy: { date: "desc" },
      select: {
        id: true, date: true, status: true,
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        group: { select: { name: true } },
        knockoutRound: { select: { name: true } },
        sets: { select: { homePoints: true, awayPoints: true } },
      },
    }),
  ]);

  if (!team) notFound();

  function toMatchRow(m: typeof nextMatchRaw & {}): VolleyMatchRow {
    const { homeSets, awaySets } = computeSets(m!.sets);
    return {
      id: m!.id,
      date: m!.date,
      status: m!.status,
      homeSets,
      awaySets,
      homeTeam: m!.homeTeam,
      awayTeam: m!.awayTeam,
      group: m!.group,
      knockoutRound: m!.knockoutRound,
    };
  }

  const nextMatch: VolleyMatchRow | null = nextMatchRaw ? toMatchRow(nextMatchRaw) : null;
  const teamMatches: VolleyMatchRow[] = teamMatchesRaw.map(toMatchRow);

  // Group standings
  const standings = teamGroup
    ? computeVolleyStandings(
        teamGroup.teams.map((gt) => gt.team),
        teamGroup.matches
      )
    : [];

  const TABS: { key: Tab; label: string }[] = [
    { key: "sommario", label: "Sommario" },
    { key: "partite", label: "Partite" },
    { key: "classifica", label: "Classifica" },
    { key: "rosa", label: "Rosa" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Back — mobile only */}
      <div className="md:hidden flex items-center">
        <BackButton />
      </div>

      {/* Team identity */}
      <div className="flex flex-col gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
          style={{ background: "var(--primary)" }}
        >
          {team.name.charAt(0).toUpperCase()}
        </div>
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
              color: activeTab === t.key ? "var(--primary)" : "rgba(0,0,0,0.65)",
              borderBottom: activeTab === t.key ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === "sommario" && (
        <SommarioTab
          nextMatch={nextMatch}
          lastMatch={teamMatches[0] ?? null}
          players={team.players}
          teamId={teamId}
        />
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

function formatTime(date: Date | null) {
  if (!date) return null;
  return date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

// ─── Sommario ────────────────────────────────────────────────────────────────

function SommarioTab({
  nextMatch,
  lastMatch,
  players,
  teamId,
}: {
  nextMatch: VolleyMatchRow | null;
  lastMatch: VolleyMatchRow | null;
  players: { id: number; name: string }[];
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
            <Link href="?tab=partite" replace className="text-xs font-semibold text-black">Vedi tutto</Link>
          </div>
          <MatchCard m={featuredMatch} isNext={!!nextMatch} />
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
            {players.slice(0, 6).map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-2 shrink-0 w-18">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "#fff", border: "1px solid rgba(9,20,76,0.08)" }}
                >
                  <img src="/icons/volleyball-player.svg" alt="" width={32} height={32} />
                </div>
                <span className="text-xs text-black text-center font-medium line-clamp-2">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Match card ───────────────────────────────────────────────────────────────

function MatchCard({ m, isNext }: { m: VolleyMatchRow; isNext: boolean }) {
  const label = m.group?.name ?? m.knockoutRound?.name ?? null;
  const date = m.date ? m.date.toLocaleDateString("it-IT", { day: "numeric", month: "short" }) : null;
  const scored = m.status === "CONCLUDED";

  return (
    <Link
      href={`/greenvolley/partite/${m.id}`}
      className="bg-white rounded-3xl p-6 flex flex-col gap-4"
      style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
    >
      {(label || date) && (
        <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}>
          {label && <span className="text-sm text-black">{label}</span>}
          {date && <span className="text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>{date}</span>}
        </div>
      )}
      <div className="flex gap-6 items-center">
        <div className="flex flex-col gap-3 flex-1 min-w-0 pr-6" style={{ borderRight: "1px solid rgba(9,20,76,0.05)" }}>
          <div className="flex items-center gap-3">
            <span className="text-sm text-black flex-1 truncate">{m.homeTeam?.name ?? "—"}</span>
            {scored && <span className="text-sm font-semibold shrink-0" style={{ color: "var(--primary)" }}>{m.homeSets}</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-black flex-1 truncate">{m.awayTeam?.name ?? "—"}</span>
            {scored && <span className="text-sm font-semibold shrink-0" style={{ color: "var(--primary)" }}>{m.awaySets}</span>}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 shrink-0">
          {isNext
            ? formatTime(m.date) && <span className="text-sm text-black">{formatTime(m.date)}</span>
            : <span className="text-xs font-medium" style={{ color: "rgba(0,0,0,0.65)" }}>Fischio finale</span>
          }
          <span className="text-xs font-medium text-black">Vedi i dettagli</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Partite ─────────────────────────────────────────────────────────────────

function PartiteTab({ matches }: { matches: VolleyMatchRow[] }) {
  if (matches.length === 0) {
    return <p className="text-sm text-center py-12" style={{ color: "rgba(0,0,0,0.4)" }}>Nessuna partita precedente.</p>;
  }
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-medium text-black">Partite precedenti</h2>
      {matches.map((m) => (
        <MatchCard key={m.id} m={m} isNext={false} />
      ))}
    </div>
  );
}

// ─── Classifica ──────────────────────────────────────────────────────────────

function ClassificaTab({
  standings,
  groupName,
  teamId,
}: {
  standings: ReturnType<typeof computeVolleyStandings>;
  groupName: string | undefined;
  teamId: number;
}) {
  if (standings.length === 0) {
    return <p className="text-sm text-center py-12" style={{ color: "rgba(0,0,0,0.4)" }}>Classifica non disponibile.</p>;
  }

  const cols: { key: keyof typeof standings[0]; label: string }[] = [
    { key: "played",   label: "G"  },
    { key: "setsWon",  label: "SV" },
    { key: "setsLost", label: "SP" },
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
        <span className="text-xs font-semibold uppercase w-7 text-center shrink-0" style={{ color: "var(--primary)" }}>Pt</span>
      </div>

      {standings.map((row, i) => {
        const isCurrentTeam = row.teamId === teamId;
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
            <span className={`text-sm flex-1 truncate text-black ${isCurrentTeam ? "font-semibold" : "font-normal"}`}>
              {row.teamName}
            </span>
            {cols.map((c) => (
              <span key={c.key} className="text-sm w-7 text-center shrink-0 tabular-nums text-black">
                {row[c.key] as number}
              </span>
            ))}
            <span className="text-sm w-7 text-center shrink-0 tabular-nums font-bold" style={{ color: "var(--primary)" }}>
              {row.setsWon}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Rosa ────────────────────────────────────────────────────────────────────

function RosaTab({ players }: { players: { id: number; name: string }[] }) {
  if (players.length === 0) {
    return <p className="text-sm text-center py-12" style={{ color: "rgba(0,0,0,0.4)" }}>Nessun giocatore presente.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-black">Giocatori</p>
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
              <img src="/icons/volleyball-player.svg" alt="" width={18} height={18} />
            </div>
            <span className="text-sm text-black flex-1 truncate">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
