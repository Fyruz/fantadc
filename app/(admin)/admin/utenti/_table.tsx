"use client";

import { useRouter } from "next/navigation";
import { Accordion, AccordionTab } from "primereact/accordion";

type Row = {
  id: number;
  email: string;
  name: string | null;
  isSuspended: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  fantasyTeam: { id: number; name: string } | null;
};

function formatDate(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(d: Date | null) {
  if (!d) return null;
  return d.toLocaleString("it-IT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function UserRow({ row, onClick }: { row: Row; onClick: () => void }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-1)] transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Avatar monogram */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 text-white"
        style={{ background: row.isSuspended ? "#EF4444" : "var(--primary)" }}
      >
        {(row.name ?? row.email).charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {row.email}
          </span>
          {row.isSuspended && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: "rgba(239,68,68,0.10)", color: "#991B1B", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              Sospeso
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {row.name && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{row.name}</span>
          )}
          {row.lastLoginAt ? (
            <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
              · accesso {formatDateTime(row.lastLoginAt)}
            </span>
          ) : (
            <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
              · mai acceduto
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {row.fantasyTeam && (
          <span className="text-[10px] font-semibold hidden sm:inline-flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <i className="pi pi-shield text-[10px]" />
            {row.fantasyTeam.name}
          </span>
        )}
        <i className="pi pi-chevron-right text-xs" style={{ color: "var(--text-disabled)" }} />
      </div>
    </div>
  );
}

export default function UtentiTable({ admins, users }: { admins: Row[]; users: Row[] }) {
  const router = useRouter();

  const adminHeader = (
    <div className="flex items-center gap-2">
      <i className="pi pi-shield text-sm" style={{ color: "#92400E" }} />
      <span className="font-display font-black text-sm uppercase" style={{ color: "var(--text-primary)" }}>
        Admin
      </span>
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1"
        style={{ background: "rgba(234,179,8,0.15)", color: "#92400E" }}
      >
        {admins.length}
      </span>
    </div>
  );

  const usersHeader = (
    <div className="flex items-center gap-2">
      <i className="pi pi-users text-sm" style={{ color: "var(--text-secondary)" }} />
      <span className="font-display font-black text-sm uppercase" style={{ color: "var(--text-primary)" }}>
        Utenti
      </span>
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1"
        style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
      >
        {users.length}
      </span>
    </div>
  );

  return (
    <Accordion multiple activeIndex={[0, 1]} className="flex flex-col gap-2">
      <AccordionTab header={adminHeader}>
        {admins.length === 0 ? (
          <p className="text-sm py-2 text-center" style={{ color: "var(--text-muted)" }}>Nessun admin.</p>
        ) : (
          <div className="flex flex-col divide-y" style={{ borderTop: "1px solid var(--border-soft)" }}>
            {admins.map((u, idx) => (
              <div key={u.id} style={{ borderBottom: idx < admins.length - 1 ? "1px solid var(--border-soft)" : undefined }}>
                <UserRow row={u} onClick={() => router.push(`/admin/utenti/${u.id}`)} />
              </div>
            ))}
          </div>
        )}
      </AccordionTab>

      <AccordionTab header={usersHeader}>
        {users.length === 0 ? (
          <p className="text-sm py-2 text-center" style={{ color: "var(--text-muted)" }}>Nessun utente.</p>
        ) : (
          <div className="flex flex-col">
            {users.map((u, idx) => (
              <div key={u.id} style={{ borderBottom: idx < users.length - 1 ? "1px solid var(--border-soft)" : undefined }}>
                <UserRow row={u} onClick={() => router.push(`/admin/utenti/${u.id}`)} />
              </div>
            ))}
          </div>
        )}
      </AccordionTab>
    </Accordion>
  );
}
