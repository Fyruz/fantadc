import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import EditGiocatoreForm from "./_form";
import AdminPageHeader from "@/components/admin-page-header";

export default async function EditGiocatorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [player, teams] = await Promise.all([
    db.player.findUnique({ where: { id: Number(id) } }),
    db.footballTeam.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!player) notFound();
  return (
    <div>
      <AdminPageHeader title="Modifica giocatore" backHref="/admin/giocatori" />
      <div className="admin-card p-5 max-w-lg">
        <EditGiocatoreForm player={player} teams={teams} />
      </div>
    </div>
  );
}
