import { db } from "@/lib/db";
import SquadreAccordion from "./_accordion";

export default async function SquadrePublicPage() {
  const teams = await db.footballTeam.findMany({
    orderBy: { name: "asc" },
    include: {
      players: {
        orderBy: [{ role: "asc" }, { name: "asc" }],
        select: { id: true, name: true, role: true },
      },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="over-label mb-1">Stagione 2025</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          SQUADRE REALI
        </h1>
      </div>

      {teams.length === 0 ? (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessuna squadra presente.
        </div>
      ) : (
        <SquadreAccordion teams={teams} />
      )}
    </div>
  );
}
