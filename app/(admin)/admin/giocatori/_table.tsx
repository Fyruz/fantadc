"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { deletePlayer } from "@/app/actions/admin/players";
import ConfirmDeleteForm from "@/components/confirm-delete-form";
import RoleBadge from "@/components/role-badge";

type Row = { id: number; name: string; role: string; footballTeam: { name: string } };

const PAGE_SIZE = 15;

export default function GiocatoriTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const total = rows.length;
  const start = page * PAGE_SIZE;
  const slice = rows.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="card overflow-hidden">
      {total === 0 ? (
        <p className="px-4 py-10 text-center over-label">Nessun giocatore.</p>
      ) : (
        <>
          {slice.map((row, idx) => (
            <div
              key={row.id}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-1)] transition-colors cursor-pointer"
              style={idx < slice.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
              onClick={() => router.push(`/admin/giocatori/${row.id}/edit`)}
            >
              <RoleBadge role={row.role} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  {row.name}
                </div>
                <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                  {row.footballTeam.name}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <ConfirmDeleteForm
                  action={deletePlayer}
                  hiddenInputs={{ id: row.id }}
                  confirmMessage="Eliminare il giocatore?"
                />
              </div>
              <i className="pi pi-chevron-right text-xs flex-shrink-0" style={{ color: "var(--text-disabled)" }} />
            </div>
          ))}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderTop: "1px solid var(--border-soft)", background: "var(--surface-1)" }}
            >
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {start + 1}–{Math.min(start + PAGE_SIZE, total)} di {total}
              </span>
              <div className="flex gap-1">
                <Button icon="pi pi-chevron-left" text size="small" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Precedente" />
                <Button icon="pi pi-chevron-right" text size="small" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Successiva" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
