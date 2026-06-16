import "server-only";

import { db } from "@/lib/db";
import { buildGroupStandings, type GroupStandingRow } from "@/lib/standings";
import { cachePublicData, PUBLIC_CACHE_TAGS, PUBLIC_CACHE_TTL_SECONDS, revivePublicDates } from "./cache";

export type PublicMatchTeam = {
  id: number;
  name: string;
  shortName: string | null;
  countryCode: string | null;
  logoUrl: string | null;
};

export type PublicMatchRow = {
  id: number;
  status: string;
  startsAt: Date;
  homeScore: number | null;
  awayScore: number | null;
  homeSeed: string | null;
  awaySeed: string | null;
  homeTeam: PublicMatchTeam | null;
  awayTeam: PublicMatchTeam | null;
  group: { name: string; slug: string } | null;
  knockoutRound: { name: string } | null;
};

export type PublicMatchesPageData = {
  matches: PublicMatchRow[];
  groupStandings: Array<{
    id: number;
    name: string;
    rows: GroupStandingRow[];
  }>;
};

export type PublicKnockoutRound = {
  id: number;
  name: string;
  order: number;
  matches: Array<{
    id: number;
    homeTeamId: number | null;
    awayTeamId: number | null;
    homeScore: number | null;
    awayScore: number | null;
    homeSeed: string | null;
    awaySeed: string | null;
    homeTeam: { name: string; shortName: string | null } | null;
    awayTeam: { name: string; shortName: string | null } | null;
  }>;
};

export type PublicMatchDetail = Awaited<ReturnType<typeof getPublicMatchDetail>>;

export const getPublicMatchesPageData = cachePublicData(
  "data.public.matches.index.fetch",
  async (): Promise<PublicMatchesPageData> => {
    const [matches, groups] = await Promise.all([
      db.match.findMany({
        where: { status: { not: "DRAFT" } },
        orderBy: { startsAt: "asc" },
        select: {
          id: true,
          status: true,
          startsAt: true,
          homeScore: true,
          awayScore: true,
          homeSeed: true,
          awaySeed: true,
          homeTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
          awayTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
          group: { select: { name: true, slug: true } },
          knockoutRound: { select: { name: true } },
        },
      }),
      db.group.findMany({
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
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
      }),
    ]);

    return {
      matches,
      groupStandings: groups.map((group) => ({
        id: group.id,
        name: group.name,
        rows: buildGroupStandings(group.teams, group.matches),
      })),
    };
  },
  ["data.public.matches.index"],
  {
    tags: [PUBLIC_CACHE_TAGS.dcup, PUBLIC_CACHE_TAGS.dcupMatches, PUBLIC_CACHE_TAGS.dcupStandings],
    revalidate: PUBLIC_CACHE_TTL_SECONDS.live,
    hydrate: revivePublicDates,
  }
);

export const getPublicMatchDetail = cachePublicData(
  "data.public.matches.detail.fetch",
  async (matchId: number) => db.match.findUnique({
      where: { id: matchId, status: { not: "DRAFT" } },
      select: {
        id: true,
        status: true,
        startsAt: true,
        homeScore: true,
        awayScore: true,
        concludedAt: true,
        mvpOverridePlayerId: true,
        homeSeed: true,
        awaySeed: true,
        homeTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
        group: { select: { name: true, slug: true } },
        knockoutRound: { select: { name: true } },
        goals: {
          select: {
            id: true,
            minute: true,
            isOwnGoal: true,
            scorer: { select: { id: true, name: true, footballTeamId: true } },
          },
          orderBy: { minute: "asc" },
        },
        players: {
          select: {
            playerId: true,
            player: { select: { id: true, name: true, role: true, footballTeamId: true } },
          },
          orderBy: { player: { name: "asc" } },
        },
        votes: { select: { playerId: true } },
      },
    }),
  ["data.public.matches.detail"],
  {
    tags: [PUBLIC_CACHE_TAGS.dcup, PUBLIC_CACHE_TAGS.dcupMatches],
    revalidate: PUBLIC_CACHE_TTL_SECONDS.live,
    hydrate: revivePublicDates,
  }
);

export const getPublicKnockoutRounds = cachePublicData(
  "data.public.matches.knockout.fetch",
  async (): Promise<PublicKnockoutRound[]> => db.knockoutRound.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        order: true,
        matches: {
          where: { status: { not: "DRAFT" } },
          orderBy: { bracketPosition: "asc" },
          select: {
            id: true,
            homeTeamId: true,
            awayTeamId: true,
            homeScore: true,
            awayScore: true,
            homeSeed: true,
            awaySeed: true,
            homeTeam: { select: { name: true, shortName: true } },
            awayTeam: { select: { name: true, shortName: true } },
          },
        },
      },
    }),
  ["data.public.matches.knockout"],
  {
    tags: [PUBLIC_CACHE_TAGS.dcup, PUBLIC_CACHE_TAGS.dcupMatches],
    revalidate: PUBLIC_CACHE_TTL_SECONDS.live,
  }
);
