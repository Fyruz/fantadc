import { db } from "@/lib/db";
import UtentiTable from "./_table";

export default async function UtentiPage() {
  const users = await db.user.findMany({
    orderBy: { id: "asc" },
    include: { fantasyTeam: { select: { id: true } } },
    omit: { passwordHash: true },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Utenti</h1>
      <UtentiTable rows={users} />
    </div>
  );
}
