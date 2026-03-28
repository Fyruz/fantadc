import { db } from "@/lib/db";
import UtentiTable from "./_table";
import AdminPageHeader from "@/components/admin-page-header";

export default async function UtentiPage() {
  const users = await db.user.findMany({
    orderBy: { id: "asc" },
    include: { fantasyTeam: { select: { id: true } } },
    omit: { passwordHash: true },
  });

  return (
    <div>
      <AdminPageHeader title="Utenti" />
      <UtentiTable rows={users} />
    </div>
  );
}
