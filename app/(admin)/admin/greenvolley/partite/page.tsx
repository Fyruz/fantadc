import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
import VolleyMatchesTable from "./_table";

export default async function VolleyPartitePage() {
  const matches = await db.volleyMatch.findMany({
    orderBy: { date: "desc" },
    include: {
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
      sets: true,
    },
  });

  return (
    <div>
      <AdminPageHeader
        title="Partite GreenVolley"
        cta={{ href: "/admin/greenvolley/partite/new", label: "Nuova partita" }}
      />
      <VolleyMatchesTable
        matches={matches.map((m) => {
          const homeSets = m.sets.filter((s) => s.homePoints > s.awayPoints).length;
          const awaySets = m.sets.filter((s) => s.awayPoints > s.homePoints).length;
          return {
            id: m.id,
            homeTeamName: m.homeTeam.name,
            awayTeamName: m.awayTeam.name,
            status: m.status,
            date: m.date?.toLocaleDateString("it-IT") ?? "—",
            result: m.sets.length > 0 ? `${homeSets}-${awaySets}` : "—",
          };
        })}
      />
    </div>
  );
}
