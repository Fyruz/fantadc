import { db } from "@/lib/db";
import { buildGroupStandings } from "@/lib/standings";
import PartiteClient from "./_partite-client";

export const dynamic = 'force-dynamic'
export const revalidate = 60;

export default async function PartitePublicPage() {
  const [matches, groups] = await Promise.all([
    db.match.findMany({
      where: { status: { not: "DRAFT" } },
      orderBy: { startsAt: "asc" },
      select: {
        id: true, status: true, startsAt: true, homeScore: true, awayScore: true,
        homeSeed: true, awaySeed: true,
        homeTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
        awayTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
        group: { select: { name: true, slug: true } },
        knockoutRound: { select: { name: true } },
      },
    }),
    db.group.findMany({
      orderBy: { order: "asc" },
      include: {
        teams: {
          include: { footballTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } } },
        },
        matches: {
          where: { status: "CONCLUDED", homeScore: { not: null }, awayScore: { not: null } },
          select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true },
        },
      },
    }),
  ]);

  const groupStandings = groups.map((g) => ({
    id: g.id, name: g.name,
    rows: buildGroupStandings(g.teams, g.matches),
  }));

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
