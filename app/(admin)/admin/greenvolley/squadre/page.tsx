import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
import VolleyTeamsTable from "./_table";

export default async function VolleySquadrePage() {
  const teams = await db.volleyTeam.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { players: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="Squadre GreenVolley"
        cta={{ href: "/admin/greenvolley/squadre/new", label: "Nuova squadra" }}
      />
      <VolleyTeamsTable
        teams={teams.map((t) => ({
          id: t.id,
          name: t.name,
          playerCount: t._count.players,
        }))}
      />
    </div>
  );
}
