import Link from "next/link";
import { db } from "@/lib/db";
import SquadreTable from "./_table";

export default async function SquadrePage() {
  const teams = await db.footballTeam.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Squadre reali</h1>
        <Link href="/admin/squadre/new" className="btn-primary">+ Nuova squadra</Link>
      </div>
      <SquadreTable rows={teams} />
    </div>
  );
}
