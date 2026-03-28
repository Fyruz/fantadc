import { db } from "@/lib/db";
import SquadreFantasyTable from "./_table";

export default async function SquadreFantasyPage() {
  const teams = await db.fantasyTeam.findMany({
    orderBy: { name: "asc" },
    include: {
      user: { select: { email: true } },
      _count: { select: { players: true } },
    },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Squadre fantasy</h1>
      <SquadreFantasyTable rows={teams} />
    </div>
  );
}
