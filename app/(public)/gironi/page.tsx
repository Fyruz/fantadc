import Link from "next/link";
import { getPublicGroupStandings } from "@/lib/data/public/standings";
import PageHeader from "@/components/page-header";
import GroupStandingCard from "@/components/group-standing-card";

export const dynamic = 'force-dynamic'
export const revalidate = 60;

export default async function GironiPublicPage() {
  const groupStandings = await getPublicGroupStandings();

  if (groupStandings.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <p className="text-sm text-black/40 text-center">Fase a gironi non ancora iniziata.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Gironi" />

      <div className="flex flex-col gap-6 mt-10 md:mt-0">
        {groupStandings.map((g) => (
          <GroupStandingCard key={g.id} group={g} />
        ))}
      </div>
    </div>
  );
}
