import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import EditFootballTeamForm from "./_form";

export default async function EditSquadraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await db.footballTeam.findUnique({ where: { id: Number(id) } });
  if (!team) notFound();

  return <EditFootballTeamForm team={team} />;
}
