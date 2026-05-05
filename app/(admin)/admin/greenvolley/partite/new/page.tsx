import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
import NewVolleyMatchForm from "./_form";

export default async function NuovaVolleyPartitaPage() {
  const [teams, groups, rounds] = await Promise.all([
    db.volleyTeam.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.volleyGroup.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.volleyKnockoutRound.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Nuova partita"
        backHref="/admin/greenvolley/partite"
      />
      <div className="admin-card p-5 max-w-lg">
        <NewVolleyMatchForm teams={teams} groups={groups} rounds={rounds} />
      </div>
    </div>
  );
}
