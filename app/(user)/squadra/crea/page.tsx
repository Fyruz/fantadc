import Link from "next/link";
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
    <div className="flex flex-col gap-4">
      <Link
        href="/dashboard"
        className="flex w-fit items-center gap-1 text-sm text-[#6B7280] transition-colors hover:text-[#111827]"
      >
        <i className="pi pi-arrow-left text-xs" /> Dashboard
      </Link>

      <div className="admin-card p-5 sm:p-6">
        <div className="mb-6">
          <h1 className="mb-2 text-[22px] font-bold text-[#111827]">Crea la tua squadra</h1>
          <p className="max-w-2xl text-sm text-[#6B7280]">
            Seleziona 1 portiere e 4 giocatori da 5 squadre diverse. Scegli il tuo capitano.
            La rosa sarà bloccata dopo la conferma.
          </p>
        </div>

        <CreaSquadraForm players={players} />
      </div>
    </div>
  );
}
