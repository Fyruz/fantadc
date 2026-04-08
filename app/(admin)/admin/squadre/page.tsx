import { db } from "@/lib/db";
import SquadreTable from "./_table";
import AdminPageHeader from "@/components/admin-page-header";

export default async function SquadrePage() {
  const teams = await db.footballTeam.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          players: true,
          homeMatches: { where: { status: { not: "DRAFT" } } },
          awayMatches: { where: { status: { not: "DRAFT" } } },
        },
      },
    },
  });

  const rows = teams.map((t) => ({
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    playerCount: t._count.players,
    matchCount: t._count.homeMatches + t._count.awayMatches,
  }));

  return (
    <div>
      <AdminPageHeader title="Squadre" cta={{ href: "/admin/squadre/new", label: "Nuova squadra" }} />
      <SquadreTable rows={rows} />
    </div>
  );
}
