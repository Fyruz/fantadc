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
    orderBy: [{ role: "asc" }, { footballTeam: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      role: true,
      footballTeam: { select: { id: true, name: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Crea la tua squadra</h1>
      <p className="text-zinc-500 text-sm mb-6">
        Seleziona 1 portiere e 4 giocatori da 5 squadre diverse. Scegli il tuo capitano.
        La rosa sarà bloccata dopo la conferma.
      </p>
      <CreaSquadraForm players={players} />
    </div>
  );
}
