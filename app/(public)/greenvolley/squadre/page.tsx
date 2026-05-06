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
      <div>
        <div className="over-label mb-1">GreenVolley</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          SQUADRE
        </h1>
      </div>

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
