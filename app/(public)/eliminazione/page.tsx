import { getPublicKnockoutRounds } from "@/lib/data/public/matches";
import PageHeader from "@/components/page-header";
import KnockoutBracket from "@/components/knockout-bracket";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function EliminazionePublicPage() {
  const rounds = await getPublicKnockoutRounds();

  return (
    <div className="flex flex-col">
      <PageHeader title="Tabellone" />

      <div className="mt-10 md:mt-0">
        <KnockoutBracket rounds={rounds} />
      </div>
    </div>
  );
}
