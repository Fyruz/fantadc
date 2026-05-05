"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { deleteVolleyMatchForm } from "@/app/actions/admin/volley";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

type Row = {
  id: number;
  homeTeamName: string;
  awayTeamName: string;
  status: string;
  date: string;
  result: string;
};

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  DRAFT:     { bg: "var(--surface-2)",          text: "var(--text-muted)"   },
  SCHEDULED: { bg: "rgba(245,158,11,0.12)",      text: "#92400e"             },
  CONCLUDED: { bg: "rgba(61,217,7,0.12)",        text: "#166534"             },
};

export default function VolleyMatchesTable({ matches }: { matches: Row[] }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const total = matches.length;
  const start = page * PAGE_SIZE;
  const slice = matches.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="card overflow-hidden">
      {total === 0 ? (
        <p className="px-4 py-10 text-center over-label">Nessuna partita.</p>
      ) : (
        <>
          {slice.map((row, idx) => {
            const statusColors = STATUS_COLOR[row.status] ?? STATUS_COLOR.DRAFT;
            return (
              <div
                key={row.id}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-1)] transition-colors cursor-pointer"
                style={idx < slice.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
                onClick={() => router.push(`/admin/greenvolley/partite/${row.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {row.homeTeamName} vs {row.awayTeamName}
                    </span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: statusColors.bg, color: statusColors.text }}
                    >
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    {row.date !== "—" && <span>{row.date}</span>}
                    {row.result !== "—" && (
                      <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
                        {row.result} set
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <ConfirmDeleteForm
                    action={deleteVolleyMatchForm}
                    hiddenInputs={{ id: row.id }}
                    confirmMessage="Eliminare questa partita?"
                  />
                </div>
                <i className="pi pi-chevron-right text-xs flex-shrink-0" style={{ color: "var(--text-disabled)" }} />
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
                <Button
                  icon="pi pi-chevron-left"
                  text
                  size="small"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Precedente"
                />
                <Button
                  icon="pi pi-chevron-right"
                  text
                  size="small"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Successiva"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
