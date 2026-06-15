import { db } from "@/lib/db";
import { computeVolleyStandings } from "@/lib/volley/standings";
import VolleyPartiteClient from "./_partite-client";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function VolleyPartitePublicPage() {
  const [matchesRaw, groupsRaw] = await Promise.all([
    db.volleyMatch.findMany({
      where: { status: { not: "DRAFT" } },
      orderBy: { date: "asc" },
      include: {
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
        sets: { select: { homePoints: true, awayPoints: true } },
        group: { select: { name: true } },
        knockoutRound: { select: { name: true } },
      },
    }),
    db.volleyGroup.findMany({
      orderBy: { name: "asc" },
      include: {
        teams: { include: { team: { select: { id: true, name: true } } } },
        matches: { where: { status: "CONCLUDED" }, include: { sets: true } },
      },
    }),
  ]);

  const matches = matchesRaw.map((m) => {
    const scored = m.status === "CONCLUDED" && m.sets.length > 0;
    return {
      id: m.id,
      status: m.status,
      date: m.date,
      homeSets: scored ? m.sets.filter((s) => s.homePoints > s.awayPoints).length : null,
      awaySets: scored ? m.sets.filter((s) => s.awayPoints > s.homePoints).length : null,
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      label: m.group?.name ?? m.knockoutRound?.name ?? null,
    };
  });

  const groups = groupsRaw.map((g) => ({
    id: g.id,
    name: g.name,
    rows: computeVolleyStandings(
      g.teams.map((gt) => gt.team),
      g.matches.map((m) => ({
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        status: m.status,
        sets: m.sets,
      }))
    ),
  }));

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
      <VolleyPartiteClient matches={matches} groups={groups} />
    </div>
  );
}
