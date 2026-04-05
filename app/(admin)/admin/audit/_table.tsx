"use client";

import { useState } from "react";
import { Button } from "primereact/button";

type LogRow = {
  id: number;
  createdAt: string;
  adminEmail: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
};

const PAGE_SIZE = 25;

export default function AuditTable({ rows }: { rows: LogRow[] }) {
  const [page, setPage] = useState(0);
  const total = rows.length;
  const start = page * PAGE_SIZE;
  const slice = rows.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="card overflow-hidden">
      {total === 0 ? (
        <p className="px-4 py-10 text-center over-label">Nessuna attività registrata.</p>
      ) : (
        <>
          {slice.map((row, idx) => (
            <div
              key={row.id}
              className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--surface-1)] transition-colors"
              style={idx < slice.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-mono font-bold text-xs" style={{ color: "var(--text-primary)" }}>
                    {row.action}
                  </span>
                  {row.entityType && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                    >
                      {row.entityType}{row.entityId ? ` #${row.entityId}` : ""}
                    </span>
                  )}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {row.adminEmail} · <span className="font-mono">{row.createdAt}</span>
                </div>
              </div>
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
