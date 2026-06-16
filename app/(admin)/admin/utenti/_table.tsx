"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Accordion, AccordionTab } from "primereact/accordion";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

type Row = {
  id: number;
  email: string;
  name: string | null;
  isSuspended: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  fantasyTeam: { id: number; name: string } | null;
};

function formatDateTime(d: Date | null) {
  if (!d) return null;
  return d.toLocaleString("it-IT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function filterAndSort(rows: Row[], search: string, newestFirst: boolean): Row[] {
  const q = search.trim().toLowerCase();
  const filtered = q
    ? rows.filter(
        (r) =>
          r.email.toLowerCase().includes(q) ||
          (r.name ?? "").toLowerCase().includes(q)
      )
    : rows;
  return [...filtered].sort((a, b) =>
    newestFirst
      ? b.createdAt.getTime() - a.createdAt.getTime()
      : a.createdAt.getTime() - b.createdAt.getTime()
  );
}

function UserRow({ row, href }: { row: Row; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-1)] transition-colors cursor-pointer"
    >
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
          <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
            · registrato {formatDateTime(row.createdAt)}
          </span>
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
    </Link>
  );
}

function RowList({ rows, emptyLabel }: { rows: Row[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return <p className="text-sm py-2 text-center" style={{ color: "var(--text-muted)" }}>{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-col" style={{ borderTop: "1px solid var(--border-soft)" }}>
      {rows.map((u, idx) => (
        <div key={u.id} style={{ borderBottom: idx < rows.length - 1 ? "1px solid var(--border-soft)" : undefined }}>
          <UserRow row={u} href={`/admin/utenti/${u.id}`} />
        </div>
      ))}
    </div>
  );
}

export default function UtentiTable({ admins, users }: { admins: Row[]; users: Row[] }) {
  const [search, setSearch] = useState("");
  const [newestFirst, setNewestFirst] = useState(false);

  const filteredAdmins = useMemo(() => filterAndSort(admins, search, newestFirst), [admins, search, newestFirst]);
  const filteredUsers  = useMemo(() => filterAndSort(users,  search, newestFirst), [users,  search, newestFirst]);

  const adminHeader = (
    <div className="flex items-center gap-2">
      <i className="pi pi-shield text-sm" style={{ color: "#92400E" }} />
      <span className="font-display font-black text-sm uppercase" style={{ color: "var(--text-primary)" }}>Admin</span>
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1"
        style={{ background: "rgba(234,179,8,0.15)", color: "#92400E" }}
      >
        {filteredAdmins.length}
      </span>
    </div>
  );

  const usersHeader = (
    <div className="flex items-center gap-2">
      <i className="pi pi-users text-sm" style={{ color: "var(--text-secondary)" }} />
      <span className="font-display font-black text-sm uppercase" style={{ color: "var(--text-primary)" }}>Utenti</span>
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1"
        style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
      >
        {filteredUsers.length}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar: ricerca + ordinamento */}
      <div className="flex items-center gap-2">
        <span className="p-input-icon-left flex-1">
          <i className="pi pi-search" />
          <InputText
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome o email…"
            className="w-full"
          />
        </span>
        <Button
          icon={newestFirst ? "pi pi-sort-amount-down" : "pi pi-sort-amount-up-alt"}
          tooltip={newestFirst ? "Più recenti prima" : "Meno recenti prima"}
          tooltipOptions={{ position: "left" }}
          text
          onClick={() => setNewestFirst((v) => !v)}
          style={{ color: "var(--text-secondary)" }}
          aria-label="Inverti ordinamento"
        />
      </div>

      <Accordion multiple activeIndex={[0, 1]} className="flex flex-col gap-2">
        <AccordionTab header={adminHeader}>
          <RowList rows={filteredAdmins} emptyLabel={search ? "Nessun admin corrisponde alla ricerca." : "Nessun admin."} />
        </AccordionTab>
        <AccordionTab header={usersHeader}>
          <RowList rows={filteredUsers} emptyLabel={search ? "Nessun utente corrisponde alla ricerca." : "Nessun utente."} />
        </AccordionTab>
      </Accordion>
    </div>
  );
}
