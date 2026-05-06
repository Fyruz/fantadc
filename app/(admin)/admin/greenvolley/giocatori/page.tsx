import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
import VolleyPlayersTable from "./_table";

export default async function VolleyGiocatoriPage() {
  const players = await db.volleyPlayer.findMany({
    orderBy: [{ team: { name: "asc" } }, { name: "asc" }],
    include: { team: { select: { id: true, name: true } } },
  });

  return (
    <div>
      <AdminPageHeader accentColor="#3DD907"
        title="Giocatori GreenVolley"
        cta={{ href: "/admin/greenvolley/giocatori/new", label: "Nuovo giocatore" }}
      />
      <VolleyPlayersTable
        players={players.map((p) => ({
          id: p.id,
          name: p.name,
          teamId: p.teamId,
          teamName: p.team.name,
        }))}
      />
    </div>
  );
}
