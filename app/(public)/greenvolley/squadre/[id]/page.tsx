import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicVolleyTeamDetail, type VolleyTeamMatchRow } from "@/lib/data/public/volley";
import type { VolleyStandingRow } from "@/lib/volley/standings";
import VolleyMatchCard from "@/components/volley-match-card";
import VolleyStandingsCard from "@/components/volley-standings-card";
import BackButton from "@/components/back-button";

export const revalidate = 60;

type Tab = "sommario" | "partite" | "classifica" | "rosa";

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

  const detail = await getPublicVolleyTeamDetail(teamId);
  if (!detail) notFound();

  const { team, nextMatch, teamMatches, standings, groupName } = detail;

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
        />
      )}
      {activeTab === "partite" && <PartiteTab matches={teamMatches} />}
      {activeTab === "classifica" && (
        <ClassificaTab standings={standings} groupName={groupName} teamId={teamId} />
      )}
      {activeTab === "rosa" && <RosaTab players={team.players} />}
    </div>
  );
}

// ─── Sommario ────────────────────────────────────────────────────────────────

function SommarioTab({
  nextMatch,
  lastMatch,
  players,
}: {
  nextMatch: VolleyTeamMatchRow | null;
  lastMatch: VolleyTeamMatchRow | null;
  players: { id: number; name: string }[];
}) {
  const featuredMatch = nextMatch ?? lastMatch;
  const featuredLabel = nextMatch ? "Prossima partita" : "Ultima partita";
  const isNext = !!nextMatch;

  return (
    <div className="flex flex-col gap-10">
      {featuredMatch && featuredMatch.homeTeam && featuredMatch.awayTeam && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-medium text-black">{featuredLabel}</h2>
            <Link href="?tab=partite" replace className="text-xs font-semibold text-black">Vedi tutto</Link>
          </div>
          <VolleyMatchCard
            id={featuredMatch.id}
            homeTeam={featuredMatch.homeTeam.name}
            awayTeam={featuredMatch.awayTeam.name}
            homeSets={isNext ? null : featuredMatch.homeSets}
            awaySets={isNext ? null : featuredMatch.awaySets}
            label={featuredMatch.group?.name ?? featuredMatch.knockoutRound?.name ?? null}
            date={featuredMatch.date}
            status={featuredMatch.status}
            showHeaderDate
          />
        </div>
      )}

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

// ─── Partite ─────────────────────────────────────────────────────────────────

function PartiteTab({ matches }: { matches: VolleyTeamMatchRow[] }) {
  if (matches.length === 0) {
    return <p className="text-sm text-center py-12" style={{ color: "rgba(0,0,0,0.4)" }}>Nessuna partita precedente.</p>;
  }
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-medium text-black">Partite precedenti</h2>
      <div className="flex flex-col gap-4">
        {matches.map((m) => (
          <VolleyMatchCard
            key={m.id}
            id={m.id}
            homeTeam={m.homeTeam?.name ?? "—"}
            awayTeam={m.awayTeam?.name ?? "—"}
            homeSets={m.homeSets}
            awaySets={m.awaySets}
            label={m.group?.name ?? m.knockoutRound?.name ?? null}
            date={m.date}
            status={m.status}
            showHeaderDate
          />
        ))}
      </div>
    </div>
  );
}

// ─── Classifica ──────────────────────────────────────────────────────────────

function ClassificaTab({
  standings,
  groupName,
  teamId,
}: {
  standings: VolleyStandingRow[];
  groupName: string | undefined;
  teamId: number;
}) {
  if (standings.length === 0) {
    return <p className="text-sm text-center py-12" style={{ color: "rgba(0,0,0,0.4)" }}>Classifica non disponibile.</p>;
  }
  return (
    <VolleyStandingsCard
      name={groupName ?? "Classifica"}
      rows={standings}
      highlightTeamId={teamId}
    />
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
