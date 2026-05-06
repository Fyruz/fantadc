import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
import KnockoutRoundsClient from "./_rounds-client";

export default async function VolleyEliminazionePage() {
  const rounds = await db.volleyKnockoutRound.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { matches: true } },
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader accentColor="#3DD907" title="Eliminazione GreenVolley" />
      <KnockoutRoundsClient
        rounds={rounds.map((r) => ({
          id: r.id,
          name: r.name,
          order: r.order,
          matchCount: r._count.matches,
        }))}
      />
    </div>
  );
}
