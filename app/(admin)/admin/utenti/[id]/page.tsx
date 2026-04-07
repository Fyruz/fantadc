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

      {/* User info card */}
      <div className="card p-4 flex flex-wrap items-center gap-2">
        {user.name && (
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user.name}</span>
        )}
        {user.role === "ADMIN" ? (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(234,179,8,0.12)", color: "#92400E", border: "1px solid rgba(234,179,8,0.3)" }}
          >
            ADMIN
          </span>
        ) : (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
          >
            USER
          </span>
        )}
        {user.isSuspended && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(239,68,68,0.10)", color: "#991B1B", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            Sospeso
          </span>
        )}
      </div>

      <UserActionsForm userId={user.id} isSuspended={user.isSuspended} />

      {/* Fantasy team section */}
      <div>
        <p className="over-label mb-3">Squadra fanta</p>
        {!user.fantasyTeam ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Nessuna squadra fanta.</p>
        ) : (
          <div className="card p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-display font-black text-sm uppercase" style={{ color: "var(--text-primary)" }}>
                  {user.fantasyTeam.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {user.fantasyTeam.players.length} giocatori
                </p>
              </div>
              <Link
                href={`/admin/squadre-fantasy/${user.fantasyTeam.id}`}
                className="flex items-center gap-1.5 text-xs font-semibold flex-shrink-0"
                style={{ color: "var(--primary)" }}
              >
                Gestisci rosa
                <i className="pi pi-arrow-right text-[10px]" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
