"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

type Row = {
  id: number;
  name: string;
  user: { email: string };
  _count: { players: number };
};

const PAGE_SIZE = 15;

export default function SquadreFantasyTable({ rows }: { rows: Row[] }) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.user.email.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const total = filteredRows.length;
  const start = page * PAGE_SIZE;
  const slice = filteredRows.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="relative mb-3">
        <i className="pi pi-search pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-muted)" }} />
        <InputText
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Cerca per nome o email…"
          className="w-full !pl-9"
        />
      </div>
      <div className="card overflow-hidden">
      {total === 0 ? (
        <p className="px-4 py-10 text-center over-label">
          {search ? "Nessuna squadra corrisponde alla ricerca." : "Nessuna squadra fanta."}
        </p>
      ) : (
        <>
          {slice.map((row, idx) => {
            const full = row._count.players === 5;
            return (
              <div
                key={row.id}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-1)] transition-colors"
                style={idx < slice.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-display font-black text-sm uppercase truncate" style={{ color: "var(--text-primary)" }}>
                    {row.name}
                  </div>
                  <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                    {row.user.email}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: full ? "#ECFDF5" : "var(--surface-2)",
                      color: full ? "#065F46" : "var(--text-secondary)",
                    }}
                  >
                    {row._count.players}/5
                  </span>
                  <Link
                    href={`/admin/squadre-fantasy/${row.id}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                    style={{ color: "var(--primary)" }}
                    title="Gestisci rosa"
                  >
                    <i className="pi pi-pencil text-sm" />
                  </Link>
                </div>
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
    </div>
  );
}
