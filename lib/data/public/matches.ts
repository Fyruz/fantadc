import "server-only";

import { db } from "@/lib/db";
import { measureServerTiming } from "@/lib/perf";
import { buildGroupStandings, type GroupStandingRow } from "@/lib/standings";

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

export async function getPublicMatchesPageData(): Promise<PublicMatchesPageData> {
  return measureServerTiming("data.public.matches.index.fetch", async () => {
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
  });
}

export async function getPublicMatchDetail(matchId: number) {
  return measureServerTiming("data.public.matches.detail.fetch", () =>
    db.match.findUnique({
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
    })
  );
}

export async function getPublicKnockoutRounds(): Promise<PublicKnockoutRound[]> {
  return measureServerTiming("data.public.matches.knockout.fetch", () =>
    db.knockoutRound.findMany({
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
    })
  );
}
