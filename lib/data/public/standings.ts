import "server-only";

import { db } from "@/lib/db";
import { buildGroupStandings, computeStandings, type GroupStandingRow, type StandingEntry } from "@/lib/standings";
import { cachePublicData, PUBLIC_CACHE_TAGS, PUBLIC_CACHE_TTL_SECONDS } from "./cache";

export type PublicGroupStanding = {
  id: number;
  name: string;
  slug: string;
  rows: GroupStandingRow[];
};

export const getPublicTournamentStandings = cachePublicData(
  "data.public.standings.tournament.fetch",
  async (): Promise<StandingEntry[]> => computeStandings(),
  ["data.public.standings.tournament"],
  {
    tags: [PUBLIC_CACHE_TAGS.dcup, PUBLIC_CACHE_TAGS.dcupStandings],
    revalidate: PUBLIC_CACHE_TTL_SECONDS.live,
  }
);

export const getPublicGroupStandings = cachePublicData(
  "data.public.standings.groups.fetch",
  async (): Promise<PublicGroupStanding[]> => {
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
  },
  ["data.public.standings.groups"],
  {
    tags: [PUBLIC_CACHE_TAGS.dcup, PUBLIC_CACHE_TAGS.dcupStandings],
    revalidate: PUBLIC_CACHE_TTL_SECONDS.live,
  }
);
