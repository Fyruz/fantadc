import Link from "next/link";
import { db } from "@/lib/db";
import { buildGroupStandings } from "@/lib/standings";
import PageHeader from "@/components/page-header";
import GroupStandingCard from "@/components/group-standing-card";

export const dynamic = 'force-dynamic'

export default async function GironiPublicPage() {
  const groups = await db.group.findMany({
    orderBy: { order: "asc" },
    include: {
      teams: {
        include: {
          footballTeam: {
            select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true },
          },
        },
      },
      matches: {
        where: { status: "CONCLUDED", homeScore: { not: null }, awayScore: { not: null } },
        select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true },
      },
    },
  });

  if (groups.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <p className="text-sm text-black/40 text-center">Fase a gironi non ancora iniziata.</p>
      </div>
    );
  }

  const groupStandings = groups.map((g) => ({
    id: g.id, name: g.name, slug: g.slug,
    rows: buildGroupStandings(g.teams, g.matches),
  }));

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