import { db } from "@/lib/db";
import NuovoGiocatoreForm from "./_form";

export default async function NuovoGiocatorePage() {
  const teams = await db.footballTeam.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return <NuovoGiocatoreForm teams={teams} />;
}
