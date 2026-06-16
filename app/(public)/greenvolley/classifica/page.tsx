import { getPublicVolleyClassifica } from "@/lib/data/public/volley";
import VolleyStandingsCard from "@/components/volley-standings-card";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function VolleyClassificaPage() {
  const groups = await getPublicVolleyClassifica();

  return (
    <div className="flex flex-col gap-6">
      {groups.length === 0 && (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun girone disponibile.
        </div>
      )}

      {groups.length > 0 && (
        <p className="text-[10px]" style={{ color: "rgba(0,0,0,0.40)" }}>
          G=Giocate · SV=Set Vinti · SP=Set Persi · Pt=Punti (set vinti)
        </p>
      )}

      {groups.map((group) => (
        <VolleyStandingsCard key={group.id} name={group.name} rows={group.rows} />
      ))}
    </div>
  );
}
