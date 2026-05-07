import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin-page-header";
import VolleyTeamForm from "../../_form";
import TeamPlayersSection from "../_team-players";

export default async function EditVolleySquadraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await db.volleyTeam.findUnique({
    where: { id: Number(id) },
    include: { players: { orderBy: { name: "asc" }, select: { id: true, name: true } } },
  });
  if (!team) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader accentColor="#3DD907"
        title="Modifica squadra"
        backHref="/admin/greenvolley/squadre"
      />
      <div className="admin-card p-5 max-w-lg">
        <VolleyTeamForm team={team} />
      </div>

      <div>
        <div
          className="text-[10px] font-black uppercase tracking-widest mb-3"
          style={{ color: "#3DD907" }}
        >
          Giocatori ({team.players.length})
        </div>
        <div className="max-w-lg">
          <TeamPlayersSection teamId={team.id} players={team.players} />
        </div>
      </div>
    </div>
  );
}
