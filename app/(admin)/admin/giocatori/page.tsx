import Link from "next/link";
import { db } from "@/lib/db";
import GiocatoriTable from "./_table";

export default async function GiocatoriPage() {
  const players = await db.player.findMany({
    orderBy: [{ footballTeam: { name: "asc" } }, { name: "asc" }],
    include: { footballTeam: { select: { name: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Giocatori</h1>
        <Link href="/admin/giocatori/new" className="btn-primary">+ Nuovo giocatore</Link>
      </div>
      <GiocatoriTable rows={players} />
    </div>
  );
}
