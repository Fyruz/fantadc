import { db } from "@/lib/db";
import Link from "next/link";
import { measureServerTiming } from "@/lib/perf";
import { computeVolleyStandings } from "@/lib/volley/standings";
import VolleyMatchCard from "@/components/volley-match-card";
import VolleyStandingsCard from "@/components/volley-standings-card";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function GreenVolleyHomePage() {
  const [nextMatches, groups] = await measureServerTiming("public.greenvolley.home.fetch", () =>
    Promise.all([
      db.volleyMatch.findMany({
        where: { status: "SCHEDULED" },
        orderBy: { date: "asc" },
        take: 4,
        include: {
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          group: { select: { name: true } },
        },
      }),
      db.volleyGroup.findMany({
        orderBy: { name: "asc" },
        include: {
          teams: { include: { team: { select: { id: true, name: true } } } },
          matches: {
            where: { status: "CONCLUDED" },
            include: { sets: true },
          },
        },
      }),
    ])
  );

  return (
    <div>

      {/* Header */}
      <div className="mt-4 mb-10">
        <div className="over-label mb-1">Campionato</div>
        <h1 className="text-3xl uppercase" style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}>
          GREEN<span style={{ color: "var(--primary)" }}>VOLLEY</span>
        </h1>
      </div>

      {/* Prossime partite */}
      {nextMatches.length > 0 && (
        <div className="my-10">
          <div className="flex items-center justify-between mb-6">
            <div
              className="uppercase text-(--text-primary) text-xl leading-8.5 font-medium flex items-center gap-1"
              style={{ fontFamily: "var(--font-tallica)" }}
            >
              <span>Prossime</span>
              <span>partite</span>
            </div>
            <Link
              href="/greenvolley/partite"
              className="inline-flex items-center gap-2 text-sm font-semibold text-(--text-primary)"
            >
              Vedi tutto
              <i className="pi pi-chevron-right" style={{ fontSize: 10 }} />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {nextMatches.map((m) => (
              <VolleyMatchCard
                key={m.id}
                id={m.id}
                homeTeam={m.homeTeam.name}
                awayTeam={m.awayTeam.name}
                homeSets={null}
                awaySets={null}
                label={m.group?.name ?? null}
                date={m.date}
                status={m.status}
                showHeaderDate
              />
            ))}
          </div>
        </div>
      )}

      {/* Classifiche rapide per girone */}
      {groups.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="uppercase text-xl font-medium text-(--text-primary)"
              style={{ fontFamily: "var(--font-tallica)" }}
            >
              Classifica
            </h2>
            <Link
              href="/greenvolley/classifica"
              className="inline-flex items-center gap-2 text-sm font-semibold text-(--text-primary)"
            >
              Vedi tutto
              <i className="pi pi-chevron-right" style={{ fontSize: 10 }} />
            </Link>
          </div>

          <div
            className="flex gap-4 overflow-x-auto -mx-4 px-4 py-3 -my-3 md:grid md:grid-cols-2 md:overflow-visible md:mx-0 md:px-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
          >
            {groups.map((group) => {
              const teamList = group.teams.map((gt) => gt.team);
              const matches = group.matches.map((m) => ({
                homeTeamId: m.homeTeamId,
                awayTeamId: m.awayTeamId,
                status: m.status,
                sets: m.sets,
              }));
              const standings = computeVolleyStandings(teamList, matches).slice(0, 4);

              return (
                <div key={group.id} className="shrink-0 w-90 md:w-auto">
                  <VolleyStandingsCard name={group.name} rows={standings} compact />
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
