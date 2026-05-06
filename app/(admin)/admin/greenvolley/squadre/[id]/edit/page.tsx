import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin-page-header";
import VolleyTeamForm from "../../_form";

export default async function EditVolleySquadraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await db.volleyTeam.findUnique({ where: { id: Number(id) } });
  if (!team) notFound();

  return (
    <div>
      <AdminPageHeader accentColor="#3DD907"
        title="Modifica squadra"
        backHref="/admin/greenvolley/squadre"
      />
      <div className="admin-card p-5 max-w-lg">
        <VolleyTeamForm team={team} />
      </div>
    </div>
  );
}
