import { db } from "@/lib/db";
import SquadreFantasyTable from "./_table";
import AdminPageHeader from "@/components/admin-page-header";

export default async function SquadreFantasyPage() {
  const teams = await db.fantasyTeam.findMany({
    orderBy: { name: "asc" },
    include: {
      user: { select: { email: true } },
      _count: { select: { players: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader title="Squadre Fanta" />
      <SquadreFantasyTable rows={teams} />
    </div>
  );
}
