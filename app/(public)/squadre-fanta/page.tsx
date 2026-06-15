import { computeCumulativeRankings } from "@/lib/scoring";
import { measureServerTiming } from "@/lib/perf";
import SquadreFantasyRankings from "./_rankings";

export const dynamic = 'force-dynamic'
export const revalidate = 60;

export default async function SquadreFantasyPublicPage() {
  const rankings = await measureServerTiming("public.squadre-fanta.fetch", () =>
    computeCumulativeRankings()
  );

  if (rankings.length === 0) {
    return (
      <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>
        Nessuna squadra fanta registrata.
      </p>
    );
  }

  return <SquadreFantasyRankings rankings={rankings} />;
}
