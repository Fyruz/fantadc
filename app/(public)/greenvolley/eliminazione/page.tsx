import Link from "next/link";
import { getPublicVolleyEliminationRounds } from "@/lib/data/public/volley";
import VolleyKnockoutBracket from "@/components/volley-knockout-bracket";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function VolleyEliminazionePublicPage() {
  const rounds = await getPublicVolleyEliminationRounds();

  return (
    <div className="flex flex-col gap-10 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center relative py-2">
        <Link href="/greenvolley" className="absolute left-0 flex items-center justify-center w-6 h-6">
          <img src="/icons/chevron_left.svg" width={24} height={24} alt="Indietro" />
        </Link>
        <h1
          className="uppercase mx-auto font-medium"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          Tabellone
        </h1>
      </div>

      <VolleyKnockoutBracket rounds={rounds} />
    </div>
  );
}
