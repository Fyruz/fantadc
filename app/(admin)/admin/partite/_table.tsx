"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { deleteMatch } from "@/app/actions/admin/matches";
import ConfirmDeleteForm from "@/components/confirm-delete-form";
import StatusBadge from "@/components/status-badge";

type Row = {
  id: number;
  status: string;
  startsAt: Date;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { name: string; shortName: string | null } | null;
  awayTeam: { name: string; shortName: string | null } | null;
  homeSeed: string | null;
  awaySeed: string | null;
  _count: { players: number };
};

const PAGE_SIZE = 15;

export default function PartiteTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const total = rows.length;
  const start = page * PAGE_SIZE;
  const slice = rows.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="card overflow-hidden">
      {total === 0 ? (
        <p className="px-4 py-10 text-center over-label">Nessuna partita.</p>
      ) : (
        <>
          {slice.map((row, idx) => {
            const isAnomaly = row.status === "CONCLUDED" && row._count.players === 0;
            return (
              <div
                key={row.id}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-1)] transition-colors cursor-pointer"
                style={idx < slice.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
                onClick={() => router.push(`/admin/partite/${row.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <StatusBadge status={row.status} />
                    {isAnomaly && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(234,179,8,0.12)", color: "#854d0e", border: "1px solid rgba(234,179,8,0.3)" }}
                      >
                        ⚠ no giocatori
                      </span>
                    )}
                  </div>
                  <div className="font-display font-black text-sm uppercase flex items-baseline gap-1.5 flex-wrap" style={{ color: "var(--text-primary)" }}>
                    <span>{row.homeTeam?.shortName ?? row.homeTeam?.name ?? row.homeSeed ?? "TBD"}</span>
                    <span className="font-sans font-bold text-xs" style={{ color: row.homeScore !== null && row.awayScore !== null ? "var(--primary)" : "var(--text-disabled)" }}>
                      {row.homeScore !== null && row.awayScore !== null ? `${row.homeScore}—${row.awayScore}` : "vs"}
                    </span>
                    <span>{row.awayTeam?.shortName ?? row.awayTeam?.name ?? row.awaySeed ?? "TBD"}</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {new Date(row.startsAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}{row._count.players} giocatori
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <ConfirmDeleteForm
                    action={deleteMatch}
                    hiddenInputs={{ id: row.id }}
                    confirmMessage="Eliminare la partita? L'operazione è irreversibile."
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
