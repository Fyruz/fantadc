import { db } from "@/lib/db";
import SquadreTable from "./_table";
import AdminPageHeader from "@/components/admin-page-header";

export default async function SquadrePage() {
  const teams = await db.footballTeam.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <AdminPageHeader title="Squadre reali" cta={{ href: "/admin/squadre/new", label: "+ Nuova squadra" }} />
      <SquadreTable rows={teams} />
    </div>
  );
}
