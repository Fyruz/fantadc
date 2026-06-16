import "server-only";

import { db } from "@/lib/db";
import { measureServerTiming } from "@/lib/perf";
import {
  computeCumulativeRankings,
  computeCurrentPhaseRankings,
  computePhaseRankings,
  computeTeamHistory,
  getTeamPhaseBreakdown,
  type RankEntry,
} from "@/lib/scoring";

export type PublicFantasyRankingPhase = {
  id: number;
  name: string;
};

export type PublicFantasyRankingPageData = {
  phases: PublicFantasyRankingPhase[];
  rankings: RankEntry[];
};

export type PublicFantasyTeamDetail = {
  team: {
    id: number;
    name: string;
    captainPlayerId: number;
    ownerLabel: string;
    players: Array<{
      player: {
        id: number;
        name: string;
        role: string;
        footballTeam: {
          name: string;
          shortName: string | null;
          countryCode: string | null;
          logoUrl: string | null;
        };
      };
    }>;
  };
  history: Awaited<ReturnType<typeof computeTeamHistory>>;
  totalPoints: number;
};

export async function getPublicFantasyRankingPageData(
  selected: string
): Promise<PublicFantasyRankingPageData> {
  return measureServerTiming("data.public.fantasy-rankings.page.fetch", async () => {
    const phases = await db.scoringPhase.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    });

    let rankings: RankEntry[];
    if (selected === "corrente") {
      rankings = await computeCurrentPhaseRankings();
    } else if (/^\d+$/.test(selected) && phases.some((phase) => String(phase.id) === selected)) {
      rankings = await computePhaseRankings(Number(selected));
    } else {
      rankings = await computeCumulativeRankings();
    }

    return { phases, rankings };
  });
}

export async function getPublicFantasyTeamRankings(): Promise<RankEntry[]> {
  return measureServerTiming("data.public.fantasy-rankings.teams.fetch", () =>
    computeCumulativeRankings()
  );
}

export async function getPublicFantasyTeamDetail(teamId: number): Promise<PublicFantasyTeamDetail | null> {
  return measureServerTiming("data.public.fantasy-rankings.team-detail.fetch", async () => {
    const team = await db.fantasyTeam.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        captainPlayerId: true,
        user: { select: { name: true, email: true } },
        players: {
          select: {
            player: {
              select: {
                id: true,
                name: true,
                role: true,
                footballTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
              },
            },
          },
        },
      },
    });

    if (!team) return null;

    const [history, phaseBreakdown] = await Promise.all([
      computeTeamHistory(teamId),
      getTeamPhaseBreakdown(teamId),
    ]);
    const totalPoints = phaseBreakdown.reduce((sum, phase) => sum + phase.points, 0);

    return {
      team: {
        id: team.id,
        name: team.name,
        captainPlayerId: team.captainPlayerId,
        ownerLabel: team.user.name ?? team.user.email,
        players: team.players,
      },
      history,
      totalPoints,
    };
  });
}
