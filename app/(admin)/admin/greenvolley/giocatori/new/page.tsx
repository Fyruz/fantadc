import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
import VolleyPlayerForm from "../_form";

export default async function NuovoVolleyGiocatorePage() {
  const teams = await db.volleyTeam.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <AdminPageHeader accentColor="#3DD907"
        title="Nuovo giocatore"
        backHref="/admin/greenvolley/giocatori"
      />
      <div className="admin-card p-5 max-w-lg">
        <VolleyPlayerForm teams={teams} />
      </div>
    </div>
  );
}
