import { db } from "@/lib/db";
import VolleySquadreAccordion from "./_accordion";
export default async function VolleySquadrePublicPage() {
  const teams = await db.volleyTeam.findMany({
    orderBy: { name: "asc" },
    include: {
      players: { orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {teams.length === 0 ? (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessuna squadra presente.
        </div>
      ) : (
        <VolleySquadreAccordion teams={teams} />
      )}
    </div>
  );
}
