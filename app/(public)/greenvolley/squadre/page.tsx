import { getPublicVolleyTeams } from "@/lib/data/public/volley";
import VolleySquadreAccordion from "./_accordion";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function VolleySquadrePublicPage() {
  const teams = await getPublicVolleyTeams();

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
