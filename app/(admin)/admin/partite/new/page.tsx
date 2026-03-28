import { db } from "@/lib/db";
import NuovaPartitaForm from "./_form";

export default async function NuovaPartitaPage() {
  const teams = await db.footballTeam.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return <NuovaPartitaForm teams={teams} />;
}
