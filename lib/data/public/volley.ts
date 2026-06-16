import "server-only";

import { db } from "@/lib/db";
import { measureServerTiming } from "@/lib/perf";
import { computeVolleyStandings, type VolleyStandingRow } from "@/lib/volley/standings";

type VolleySetScore = {
  homePoints: number;
  awayPoints: number;
};

export type PublicVolleyMatchCardRow = {
  id: number;
  status: string;
  date: Date | null;
  homeSets: number | null;
  awaySets: number | null;
  homeTeam: string;
  awayTeam: string;
  label: string | null;
};

export type PublicVolleyGroupStanding = {
  id: number;
  name: string;
  rows: VolleyStandingRow[];
  qualifiedIds?: number[];
};

export type PublicGreenVolleyHomeData = {
  nextMatches: Array<{
    id: number;
    homeTeam: { name: string };
    awayTeam: { name: string };
    group: { name: string } | null;
    date: Date | null;
    status: string;
  }>;
  groups: Array<{
    id: number;
    name: string;
    rows: VolleyStandingRow[];
  }>;
};

export type PublicVolleyMatchesPageData = {
  matches: PublicVolleyMatchCardRow[];
  groups: PublicVolleyGroupStanding[];
};

export type PublicVolleyTeamDetail = {
  team: {
    id: number;
    name: string;
    players: Array<{ id: number; name: string }>;
  };
  nextMatch: VolleyTeamMatchRow | null;
  teamMatches: VolleyTeamMatchRow[];
  groupName: string | undefined;
  standings: VolleyStandingRow[];
};

export type VolleyTeamMatchRow = {
  id: number;
  date: Date | null;
  status: string;
  homeSets: number;
  awaySets: number;
  homeTeam: { id: number; name: string } | null;
  awayTeam: { id: number; name: string } | null;
  group: { name: string } | null;
  knockoutRound: { name: string } | null;
};

function computeSets(sets: VolleySetScore[]): { homeSets: number; awaySets: number } {
  return {
    homeSets: sets.filter((set) => set.homePoints > set.awayPoints).length,
    awaySets: sets.filter((set) => set.awayPoints > set.homePoints).length,
  };
}

export async function getPublicGreenVolleyHomeData(): Promise<PublicGreenVolleyHomeData> {
  return measureServerTiming("data.public.volley.home.fetch", async () => {
    const [nextMatches, groups] = await Promise.all([
      db.volleyMatch.findMany({
        where: { status: "SCHEDULED" },
        orderBy: { date: "asc" },
        take: 4,
        select: {
          id: true,
          date: true,
          status: true,
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
          group: { select: { name: true } },
        },
      }),
      db.volleyGroup.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          teams: { select: { team: { select: { id: true, name: true } } } },
          matches: {
            where: { status: "CONCLUDED" },
            select: {
              homeTeamId: true,
              awayTeamId: true,
              status: true,
              sets: { select: { homePoints: true, awayPoints: true } },
            },
          },
        },
      }),
    ]);

    return {
      nextMatches,
      groups: groups.map((group) => ({
        id: group.id,
        name: group.name,
        rows: computeVolleyStandings(
          group.teams.map((groupTeam) => groupTeam.team),
          group.matches
        ),
      })),
    };
  });
}

export async function getPublicVolleyMatchesPageData(): Promise<PublicVolleyMatchesPageData> {
  return measureServerTiming("data.public.volley.matches.fetch", async () => {
    const [matchesRaw, groupsRaw] = await Promise.all([
      db.volleyMatch.findMany({
        where: { status: { not: "DRAFT" } },
        orderBy: { date: "asc" },
        select: {
          id: true,
          status: true,
          date: true,
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
          sets: { select: { homePoints: true, awayPoints: true } },
          group: { select: { name: true } },
          knockoutRound: { select: { name: true } },
        },
      }),
      db.volleyGroup.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          teams: { select: { team: { select: { id: true, name: true } } } },
          matches: {
            where: { status: "CONCLUDED" },
            select: {
              homeTeamId: true,
              awayTeamId: true,
              status: true,
              sets: { select: { homePoints: true, awayPoints: true } },
            },
          },
        },
      }),
    ]);

    return {
      matches: matchesRaw.map((match) => {
        const scored = match.status === "CONCLUDED" && match.sets.length > 0;
        const { homeSets, awaySets } = computeSets(match.sets);
        return {
          id: match.id,
          status: match.status,
          date: match.date,
          homeSets: scored ? homeSets : null,
          awaySets: scored ? awaySets : null,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          label: match.group?.name ?? match.knockoutRound?.name ?? null,
        };
      }),
      groups: groupsRaw.map((group) => ({
        id: group.id,
        name: group.name,
        rows: computeVolleyStandings(
          group.teams.map((groupTeam) => groupTeam.team),
          group.matches
        ),
      })),
    };
  });
}

export async function getPublicVolleyClassifica(): Promise<PublicVolleyGroupStanding[]> {
  return getPublicVolleyGroupStandings(false);
}

export async function getPublicVolleyGironi(): Promise<PublicVolleyGroupStanding[]> {
  return getPublicVolleyGroupStandings(true);
}

async function getPublicVolleyGroupStandings(withQualifiedIds: boolean): Promise<PublicVolleyGroupStanding[]> {
  return measureServerTiming("data.public.volley.groups.fetch", async () => {
    const groups = await db.volleyGroup.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        teams: {
          orderBy: { team: { name: "asc" } },
          select: {
            teamId: true,
            qualified: true,
            team: { select: { id: true, name: true } },
          },
        },
        matches: {
          where: { status: "CONCLUDED" },
          select: {
            homeTeamId: true,
            awayTeamId: true,
            status: true,
            sets: { select: { homePoints: true, awayPoints: true } },
          },
        },
      },
    });

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      rows: computeVolleyStandings(
        group.teams.map((groupTeam) => groupTeam.team),
        group.matches
      ),
      ...(withQualifiedIds
        ? { qualifiedIds: group.teams.filter((groupTeam) => groupTeam.qualified).map((groupTeam) => groupTeam.teamId) }
        : {}),
    }));
  });
}

export async function getPublicVolleyEliminationRounds() {
  return measureServerTiming("data.public.volley.elimination.fetch", () =>
    db.volleyKnockoutRound.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        order: true,
        matches: {
          where: { status: { not: "DRAFT" } },
          select: {
            id: true,
            status: true,
            date: true,
            homeTeam: { select: { id: true, name: true } },
            awayTeam: { select: { id: true, name: true } },
            sets: { orderBy: { setNumber: "asc" } },
          },
          orderBy: { date: "asc" },
        },
      },
    })
  );
}

export async function getPublicVolleyTeams() {
  return measureServerTiming("data.public.volley.teams.fetch", () =>
    db.volleyTeam.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        players: { orderBy: { name: "asc" }, select: { id: true, name: true } },
      },
    })
  );
}

export async function getPublicVolleyMatchDetail(matchId: number) {
  return measureServerTiming("data.public.volley.match-detail.fetch", () =>
    db.volleyMatch.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        status: true,
        date: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            players: { orderBy: { name: "asc" }, select: { id: true, name: true } },
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            players: { orderBy: { name: "asc" }, select: { id: true, name: true } },
          },
        },
        sets: { orderBy: { setNumber: "asc" } },
        group: { select: { name: true } },
        knockoutRound: { select: { name: true } },
      },
    })
  );
}

export async function getPublicVolleyTeamDetail(teamId: number): Promise<PublicVolleyTeamDetail | null> {
  return measureServerTiming("data.public.volley.team-detail.fetch", async () => {
    const [team, nextMatchRaw, teamGroup, teamMatchesRaw] = await Promise.all([
      db.volleyTeam.findUnique({
        where: { id: teamId },
        select: {
          id: true,
          name: true,
          players: { orderBy: { name: "asc" }, select: { id: true, name: true } },
        },
      }),
      db.volleyMatch.findFirst({
        where: {
          OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
          status: "SCHEDULED",
        },
        orderBy: { date: "asc" },
        select: {
          id: true,
          date: true,
          status: true,
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          group: { select: { name: true } },
          knockoutRound: { select: { name: true } },
          sets: { select: { homePoints: true, awayPoints: true } },
        },
      }),
      db.volleyGroup.findFirst({
        where: { teams: { some: { teamId } } },
        select: {
          name: true,
          teams: { select: { team: { select: { id: true, name: true } } } },
          matches: {
            where: { status: "CONCLUDED" },
            select: {
              homeTeamId: true,
              awayTeamId: true,
              status: true,
              sets: { select: { homePoints: true, awayPoints: true } },
            },
          },
        },
      }),
      db.volleyMatch.findMany({
        where: {
          OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
          status: "CONCLUDED",
        },
        orderBy: { date: "desc" },
        select: {
          id: true,
          date: true,
          status: true,
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          group: { select: { name: true } },
          knockoutRound: { select: { name: true } },
          sets: { select: { homePoints: true, awayPoints: true } },
        },
      }),
    ]);

    if (!team) return null;

    function toMatchRow(match: NonNullable<typeof nextMatchRaw>): VolleyTeamMatchRow {
      const { homeSets, awaySets } = computeSets(match.sets);
      return {
        id: match.id,
        date: match.date,
        status: match.status,
        homeSets,
        awaySets,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        group: match.group,
        knockoutRound: match.knockoutRound,
      };
    }

    return {
      team,
      nextMatch: nextMatchRaw ? toMatchRow(nextMatchRaw) : null,
      teamMatches: teamMatchesRaw.map(toMatchRow),
      groupName: teamGroup?.name,
      standings: teamGroup
        ? computeVolleyStandings(
            teamGroup.teams.map((groupTeam) => groupTeam.team),
            teamGroup.matches
          )
        : [],
    };
  });
}
