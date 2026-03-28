import Link from "next/link";
import { db } from "@/lib/db";
import PartiteTable from "./_table";

export default async function PartitePage() {
  const matches = await db.match.findMany({
    orderBy: { startsAt: "desc" },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      _count: { select: { players: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Partite</h1>
        <Link href="/admin/partite/new" className="btn-primary">
          + Nuova partita
        </Link>
      </div>
      <PartiteTable rows={matches} />
    </div>
  );
}
