import { db } from "@/lib/db";
import Link from "next/link";
import { computeVolleyStandings } from "@/lib/volley/standings";
import VolleyStandingsCard from "@/components/volley-standings-card";

export const dynamic = "force-dynamic";

export default async function VolleyGironiPage() {
  const groups = await db.volleyGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      teams: {
        include: { team: { select: { id: true, name: true } } },
        orderBy: { team: { name: "asc" } },
      },
      matches: {
        where: { status: "CONCLUDED" },
        include: { sets: true },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center relative py-2">
        <Link href="/greenvolley" className="absolute left-0 flex items-center justify-center w-6 h-6">
          <img src="/icons/chevron_left.svg" width={24} height={24} alt="Indietro" />
        </Link>
        <h1
          className="uppercase mx-auto font-medium"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          Gironi
        </h1>
      </div>

      {groups.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
          Nessun girone disponibile.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => {
          const standings = computeVolleyStandings(
            group.teams.map((gt) => gt.team),
            group.matches.map((m) => ({
              homeTeamId: m.homeTeamId,
              awayTeamId: m.awayTeamId,
              status: m.status,
              sets: m.sets,
            }))
          );
          const qualifiedIds = group.teams
            .filter((gt) => gt.qualified)
            .map((gt) => gt.teamId);

          return (
            <VolleyStandingsCard
              key={group.id}
              name={group.name}
              rows={standings}
              qualifiedIds={qualifiedIds}
              compact
            />
          );
        })}
      </div>
    </div>
  );
}
