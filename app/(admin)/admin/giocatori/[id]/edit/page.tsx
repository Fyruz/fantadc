import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import EditGiocatoreForm from "./_form";

export default async function EditGiocatorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [player, teams] = await Promise.all([
    db.player.findUnique({ where: { id: Number(id) } }),
    db.footballTeam.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!player) notFound();

  return <EditGiocatoreForm player={player} teams={teams} />;
}
