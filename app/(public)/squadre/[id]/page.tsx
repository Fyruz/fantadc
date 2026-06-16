import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicFootballTeamDetail } from "@/lib/data/public/teams";
import type { PublicMatchRow } from "@/lib/data/public/matches";
import { BackButton } from "./BackButton";
import { resolveTeamFlag } from "@/lib/flags";
import MatchCard from "@/components/match-card";
import GroupStandingCard from "@/components/group-standing-card";

export const revalidate = 60;

type Tab = "sommario" | "partite" | "classifica" | "rosa";

type MatchTeam = {
  id: number;
  name: string;
  shortName: string | null;
  countryCode: string | null;
  logoUrl: string | null;
};

type MatchRow = PublicMatchRow;

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

  const detail = await getPublicFootballTeamDetail(teamId);
  if (!detail) notFound();

  const { team, nextMatch, teamMatches, scorerRows, group } = detail;
  const standings = group?.rows ?? [];

  const flagSrc = resolveTeamFlag(team);
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
          <img
            src={flagSrc}
            alt={team.name}
            width={64}
            height={43}
          />
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
        <SommarioTab nextMatch={nextMatch} lastMatch={teamMatches[0] ?? null} players={team.players} scorerRows={scorerRows} />
      )}
      {activeTab === "partite" && <PartiteTab matches={teamMatches} />}
      {activeTab === "classifica" && (
        standings.length === 0
          ? <p className="text-sm text-center py-12" style={{ color: "rgba(0,0,0,0.4)" }}>Classifica non disponibile.</p>
          : <GroupStandingCard group={{ id: group!.id, name: group!.name, rows: standings }} highlightTeamId={teamId} />
      )}
      {activeTab === "rosa" && <RosaTab players={team.players} />}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function roleIcon(role: string) {
  return role === "P" ? "/icons/goalkeeper.svg" : "/icons/player.svg";
}

function roleLabel(role: string) {
  return role === "P" ? "Portiere" : "Giocatore";
}


// ─── Sommario ────────────────────────────────────────────────────────────────

function SommarioTab({
  nextMatch,
  lastMatch,
  players,
  scorerRows,
}: {
  nextMatch: MatchRow | null;
  lastMatch: MatchRow | null;
  players: { id: number; name: string; role: string }[];
  scorerRows: { name: string; goals: number }[];
}) {
  const featuredMatch = nextMatch ?? lastMatch;
  const featuredLabel = nextMatch ? "Prossima partita" : "Ultima partita";

  return (
    <div className="flex flex-col gap-10">
      {/* Prossima / Ultima partita */}
      {featuredMatch && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-medium text-black">{featuredLabel}</h2>
            <Link href="?tab=partite" replace className="text-xs font-semibold text-black">Vedi tutto</Link>
          </div>
          <MatchCard match={featuredMatch} showDate />
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
              <div key={p.id} className="flex flex-col items-center gap-2 shrink-0 w-18">
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
      {matches.map((m) => <MatchCard key={m.id} match={m} showDate />)}
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
