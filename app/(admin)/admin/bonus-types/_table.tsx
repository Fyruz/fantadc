"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { deleteBonusType } from "@/app/actions/admin/bonus-types";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

type Row = { id: number; code: string; name: string; points: unknown };

const PAGE_SIZE = 20;

export default function BonusTypesTable({ rows }: { rows: Row[] }) {
  const [page, setPage] = useState(0);
  const total = rows.length;
  const start = page * PAGE_SIZE;
  const slice = rows.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="card overflow-hidden">
      {total === 0 ? (
        <p className="px-4 py-10 text-center over-label">Nessun tipo bonus.</p>
      ) : (
        <>
          {slice.map((row, idx) => {
            const pts = Number(row.points);
            const pointsBg = pts > 0 ? "#ECFDF5" : pts < 0 ? "#FEF2F2" : "var(--surface-2)";
            const pointsColor = pts > 0 ? "#065F46" : pts < 0 ? "#991B1B" : "var(--text-muted)";
            const ptsLabel = pts > 0 ? `+${pts}` : String(pts);
            return (
              <div
                key={row.id}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-1)] transition-colors"
                style={idx < slice.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-sm uppercase" style={{ color: "var(--text-primary)" }}>
                      {row.code}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: pointsBg, color: pointsColor }}
                    >
                      {ptsLabel} pt
                    </span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {row.name}
                  </div>
                </div>
                <ConfirmDeleteForm
                  action={deleteBonusType}
                  hiddenInputs={{ id: row.id }}
                  confirmMessage="Eliminare questo tipo bonus?"
                />
              </div>
            );
          })}
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
