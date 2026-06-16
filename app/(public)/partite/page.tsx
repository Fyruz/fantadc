import { getPublicMatchesPageData } from "@/lib/data/public/matches";
import PartiteClient from "./_partite-client";

export const dynamic = 'force-dynamic'
export const revalidate = 60;

export default async function PartitePublicPage() {
  const { matches, groupStandings } = await getPublicMatchesPageData();

  if (matches.length === 0 && groupStandings.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-10">
        <p className="text-sm text-center" style={{ color: "rgba(0,0,0,0.40)" }}>Nessuna partita disponibile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <PartiteClient matches={matches} groups={groupStandings} />
    </div>
  );
}
