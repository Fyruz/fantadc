"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";

type Row = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  isSuspended: boolean;
  fantasyTeam: { id: number } | null;
};

const PAGE_SIZE = 15;

export default function UtentiTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const total = rows.length;
  const start = page * PAGE_SIZE;
  const slice = rows.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="card overflow-hidden">
      {total === 0 ? (
        <p className="px-4 py-10 text-center over-label">Nessun utente.</p>
      ) : (
        <>
          {slice.map((row, idx) => (
            <div
              key={row.id}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-1)] transition-colors cursor-pointer"
              style={idx < slice.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
              onClick={() => router.push(`/admin/utenti/${row.id}`)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  {row.email}
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {row.name && (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {row.name}
                    </span>
                  )}
                  {row.role === "ADMIN" ? (
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
                  {row.isSuspended && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(239,68,68,0.10)", color: "#991B1B", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      Sospeso
                    </span>
                  )}
                  {row.fantasyTeam && (
                    <span className="text-[10px]" style={{ color: "var(--text-disabled)" }}>⚽ squadra</span>
                  )}
                </div>
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
