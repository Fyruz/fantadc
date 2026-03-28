import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import EditFootballTeamForm from "./_form";
import AdminPageHeader from "@/components/admin-page-header";

export default async function EditSquadraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await db.footballTeam.findUnique({ where: { id: Number(id) } });
  if (!team) notFound();

  return (
    <div>
      <AdminPageHeader title="Modifica squadra" backHref="/admin/squadre" />
      <div className="admin-card p-5 max-w-lg">
        <EditFootballTeamForm team={team} />
      </div>
    </div>
  );
}
