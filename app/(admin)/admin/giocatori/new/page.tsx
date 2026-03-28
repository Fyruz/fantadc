import { db } from "@/lib/db";
import NuovoGiocatoreForm from "./_form";
import AdminPageHeader from "@/components/admin-page-header";

export default async function NuovoGiocatorePage() {
  const teams = await db.footballTeam.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <AdminPageHeader title="Nuovo giocatore" backHref="/admin/giocatori" />
      <div className="admin-card p-5 max-w-lg">
        <NuovoGiocatoreForm teams={teams} />
      </div>
    </div>
  );
}
