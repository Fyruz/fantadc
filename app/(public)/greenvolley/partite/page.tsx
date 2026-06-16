import { getPublicVolleyMatchesPageData } from "@/lib/data/public/volley";
import VolleyPartiteClient from "./_partite-client";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function VolleyPartitePublicPage() {
  const { matches, groups } = await getPublicVolleyMatchesPageData();

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
      <VolleyPartiteClient matches={matches} groups={groups} />
    </div>
  );
}
