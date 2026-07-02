import { getPublicVolleyMatchesPageData, getPublicVolleyEliminationRounds } from "@/lib/data/public/volley";
import VolleyPartiteClient from "./_partite-client";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function VolleyPartitePublicPage() {
  const [{ matches, groups }, knockoutRounds] = await Promise.all([
    getPublicVolleyMatchesPageData(),
    getPublicVolleyEliminationRounds(),
  ]);

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
      <VolleyPartiteClient matches={matches} groups={groups} knockoutRounds={knockoutRounds} />
    </div>
  );
}
