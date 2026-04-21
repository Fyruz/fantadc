import { computeRankings } from "@/lib/scoring";
import ClassificaTable from "@/app/(public)/classifica/_table";

export const revalidate = 60;

export default async function ClassificaFantaPage() {
  const rankings = await computeRankings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">Stagione 2025</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          CLASSIFICA FANTA
        </h1>
      </div>

      {rankings.length === 0 ? (
        <div className="card p-10 text-center over-label">Nessun risultato ancora pubblicato.</div>
      ) : (
        <ClassificaTable rows={rankings} />
      )}
    </div>
  );
}
