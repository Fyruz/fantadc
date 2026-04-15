import { db } from "@/lib/db";
import PublicMatchList from "./_matches";

export default async function PartitePublicPage() {
  const matches = await db.match.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { startsAt: "asc" },
    select: {
      id: true, status: true, startsAt: true, homeScore: true, awayScore: true,
      homeSeed: true, awaySeed: true, groupId: true, knockoutRoundId: true,
      homeTeam: { select: { name: true, shortName: true } },
      awayTeam: { select: { name: true, shortName: true } },
      group: { select: { slug: true } },
      knockoutRound: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">Stagione 2025</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          PARTITE
        </h1>
      </div>

      <PublicMatchList matches={matches} />
    </div>
  );
}
