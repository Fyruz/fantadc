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
          <span className="text-sm font-medium text-[var(--text-primary)]">{user.name}</span>
        )}
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            user.role === "ADMIN"
              ? ""
              : "bg-[var(--primary-light)] text-[var(--primary)]"
          }`}
          style={user.role === "ADMIN" ? { background: 'rgba(255,214,10,0.12)', color: '#FFD60A' } : undefined}
        >
          {user.role}
        </span>
        {user.isSuspended && (
          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,69,58,0.12)', color: '#FF453A' }}>
            Sospeso
          </span>
        )}
      </div>

      <UserActionsForm userId={user.id} isSuspended={user.isSuspended} />

      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Squadra fantasy</h2>
        {!user.fantasyTeam && (
          <p className="text-sm text-[var(--text-muted)]">Nessuna squadra fantasy.</p>
        )}
        {user.fantasyTeam && (
          <div className="admin-card p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-sm text-[var(--text-primary)]">{user.fantasyTeam.name}</span>
              <Link
                href={`/admin/squadre-fantasy/${user.fantasyTeam.id}`}
                className="text-sm font-medium text-[var(--primary)] hover:underline flex-shrink-0"
              >
                Gestisci rosa →
              </Link>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {user.fantasyTeam.players.length} giocatori
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

