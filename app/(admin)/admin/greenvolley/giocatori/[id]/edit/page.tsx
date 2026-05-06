import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin-page-header";
import VolleyPlayerForm from "../../_form";

export default async function EditVolleyGiocatorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [player, teams] = await Promise.all([
    db.volleyPlayer.findUnique({ where: { id: Number(id) } }),
    db.volleyTeam.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!player) notFound();

  return (
    <div>
      <AdminPageHeader accentColor="#3DD907"
        title="Modifica giocatore"
        backHref="/admin/greenvolley/giocatori"
      />
      <div className="admin-card p-5 max-w-lg">
        <VolleyPlayerForm player={player} teams={teams} />
      </div>
    </div>
  );
}
