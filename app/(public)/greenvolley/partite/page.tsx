import { db } from "@/lib/db";
import VolleyMatchList from "./_matches";

export default async function VolleyPartitePublicPage() {
  const matches = await db.volleyMatch.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { date: "asc" },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      sets: { select: { homePoints: true, awayPoints: true } },
      group: { select: { name: true } },
      knockoutRound: { select: { name: true } },
    },
  });

  const rows = matches.map((m) => {
    const scored = m.status === "CONCLUDED" && m.sets.length > 0;
    const homeSets = m.sets.filter((s) => s.homePoints > s.awayPoints).length;
    const awaySets = m.sets.filter((s) => s.awayPoints > s.homePoints).length;
    return {
      id: m.id,
      status: m.status,
      date: m.date,
      homeSets: scored ? homeSets : null,
      awaySets: scored ? awaySets : null,
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      groupName: m.group?.name ?? null,
      knockoutName: m.knockoutRound?.name ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="over-label mb-1">GreenVolley</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          PARTITE
        </h1>
      </div>

      <VolleyMatchList matches={rows} />
    </div>
  );
}
