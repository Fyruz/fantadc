import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import UserActionsForm from "./_actions-form";

export default async function UtenteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id: Number(id) },
    include: {
      fantasyTeam: {
        include: {
          players: { select: { playerId: true } },
        },
      },
    },
    omit: { passwordHash: true },
  });
  if (!user) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold mb-1">{user.email}</h1>
        <p className="text-sm text-zinc-500">
          {user.name && <span className="mr-3">{user.name}</span>}
          <span className={`text-xs px-2 py-0.5 rounded ${user.role === "ADMIN" ? "bg-yellow-100 text-yellow-800" : "bg-zinc-100 text-zinc-600"}`}>{user.role}</span>
          {user.isSuspended && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded ml-2">Sospeso</span>}
        </p>
      </div>

      <UserActionsForm userId={user.id} isSuspended={user.isSuspended} />

      <div>
        <h2 className="text-base font-semibold mb-3">Squadra fantasy</h2>
        {!user.fantasyTeam && <p className="text-sm text-zinc-400">Nessuna squadra fantasy.</p>}
        {user.fantasyTeam && (
          <div className="border rounded p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{user.fantasyTeam.name}</span>
              <Link href={`/admin/squadre-fantasy/${user.fantasyTeam.id}`} className="text-blue-600 text-xs hover:underline">Gestisci rosa</Link>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {user.fantasyTeam.players.length} giocatori — Capitano ID: {user.fantasyTeam.captainPlayerId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
