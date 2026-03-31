import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
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
      <AdminPageHeader title={user.email} backHref="/admin/utenti" />

      <div className="admin-card p-4 flex flex-wrap items-center gap-3">
        {user.name && (
          <span className="text-sm font-medium text-[#111827]">{user.name}</span>
        )}
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            user.role === "ADMIN"
              ? "bg-amber-100 text-amber-700"
              : "bg-[#E8E9F8] text-[#0107A3]"
          }`}
        >
          {user.role}
        </span>
        {user.isSuspended && (
          <span className="text-xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-medium">
            Sospeso
          </span>
        )}
      </div>

      <UserActionsForm userId={user.id} isSuspended={user.isSuspended} />

      <div>
        <h2 className="text-base font-semibold text-[#111827] mb-3">Squadra fantasy</h2>
        {!user.fantasyTeam && (
          <p className="text-sm text-[#9CA3AF]">Nessuna squadra fantasy.</p>
        )}
        {user.fantasyTeam && (
          <div className="admin-card p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-sm text-[#111827]">{user.fantasyTeam.name}</span>
              <Link
                href={`/admin/squadre-fantasy/${user.fantasyTeam.id}`}
                className="text-sm font-medium text-[#0107A3] hover:underline flex-shrink-0"
              >
                Gestisci rosa →
              </Link>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              {user.fantasyTeam.players.length} giocatori
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

