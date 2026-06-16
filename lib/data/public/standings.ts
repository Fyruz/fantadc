import "server-only";

import { db } from "@/lib/db";
import { measureServerTiming } from "@/lib/perf";
import { buildGroupStandings, computeStandings, type GroupStandingRow, type StandingEntry } from "@/lib/standings";

export type PublicGroupStanding = {
  id: number;
  name: string;
  slug: string;
  rows: GroupStandingRow[];
};

export async function getPublicTournamentStandings(): Promise<StandingEntry[]> {
  return measureServerTiming("data.public.standings.tournament.fetch", () =>
    computeStandings()
  );
}

export async function getPublicGroupStandings(): Promise<PublicGroupStanding[]> {
  return measureServerTiming("data.public.standings.groups.fetch", async () => {
    const groups = await db.group.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        teams: {
          select: {
            footballTeamId: true,
            qualified: true,
            footballTeam: {
              select: { name: true, shortName: true, countryCode: true, logoUrl: true },
            },
          },
        },
        matches: {
          where: { status: "CONCLUDED", homeScore: { not: null }, awayScore: { not: null } },
          select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true },
        },
      },
    });

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      slug: group.slug,
      rows: buildGroupStandings(group.teams, group.matches),
    }));
  });
}
