import { db } from "@/lib/db";
import NuovaPartitaForm from "./_form";
import AdminPageHeader from "@/components/admin-page-header";

export default async function NuovaPartitaPage({ searchParams }: { searchParams: Promise<{ groupId?: string; knockoutRoundId?: string }> }) {
  const sp = await searchParams;
  const [teams, groups, rounds] = await Promise.all([
    db.footballTeam.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.group.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true, slug: true } }),
    db.knockoutRound.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <div>
      <AdminPageHeader title="Nuova partita" backHref="/admin/partite" />
      <div className="admin-card p-5">
        <NuovaPartitaForm
          teams={teams}
          groups={groups}
          rounds={rounds}
          defaultGroupId={sp.groupId ? Number(sp.groupId) : null}
          defaultKnockoutRoundId={sp.knockoutRoundId ? Number(sp.knockoutRoundId) : null}
        />
      </div>
    </div>
  );
}
