import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import CreaSquadraForm from "./_form";

export default async function CreaSquadraPage() {
  const user = await requireAuth();
  const userId = Number(user.id);

  const existing = await db.fantasyTeam.findUnique({ where: { userId } });
  if (existing) redirect("/squadra");

  const players = await db.player.findMany({
    orderBy: [
      { role: "asc" },
      { footballTeam: { name: "asc" } },
      { name: "asc" },
    ],
    select: {
      id: true,
      name: true,
      role: true,
      footballTeam: { select: { id: true, name: true, shortName: true } },
    },
  });

  return <CreaSquadraForm players={players} />;
}
