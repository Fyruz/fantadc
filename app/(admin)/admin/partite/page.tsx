import { db } from "@/lib/db";
import PartiteTable from "./_table";
import AdminPageHeader from "@/components/admin-page-header";

export default async function PartitePage() {
  const matches = await db.match.findMany({
    orderBy: { startsAt: "desc" },
    include: {
      homeTeam: { select: { name: true, shortName: true } },
      awayTeam: { select: { name: true, shortName: true } },
      _count: { select: { players: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader title="Partite" cta={{ href: "/admin/partite/new", label: "+ Nuova partita" }} />
      <PartiteTable rows={matches} />
    </div>
  );
}
