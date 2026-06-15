import { db } from "@/lib/db";
import { measureServerTiming } from "@/lib/perf";
import { computeVolleyStandings } from "@/lib/volley/standings";
import VolleyStandingsCard from "@/components/volley-standings-card";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function VolleyClassificaPage() {
  const groups = await measureServerTiming("public.greenvolley.classifica.fetch", () =>
    db.volleyGroup.findMany({
      orderBy: { name: "asc" },
      include: {
        teams: { include: { team: { select: { id: true, name: true } } } },
        matches: {
          where: { status: "CONCLUDED" },
          include: { sets: true },
        },
      },
    })
  );

  return (
    <div className="flex flex-col gap-6">
      {groups.length === 0 && (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun girone disponibile.
        </div>
      )}

      {groups.length > 0 && (
        <p className="text-[10px]" style={{ color: "rgba(0,0,0,0.40)" }}>
          G=Giocate · SV=Set Vinti · SP=Set Persi · Pt=Punti (set vinti)
        </p>
      )}

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
        return <VolleyStandingsCard key={group.id} name={group.name} rows={standings} />;
      })}
    </div>
  );
}
