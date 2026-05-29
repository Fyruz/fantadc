"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { deleteFootballTeam } from "@/app/actions/admin/football-teams";
import ConfirmDeleteForm from "@/components/confirm-delete-form";
import { getFlagUrlFromCountryCode } from "@/lib/flags";

type Row = {
  id: number;
  name: string;
  shortName: string | null;
  countryCode: string | null;
  logoUrl: string | null;
  playerCount: number;
  matchCount: number;
};

const PAGE_SIZE = 15;

export default function SquadreTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const total = rows.length;
  const start = page * PAGE_SIZE;
  const slice = rows.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="card overflow-hidden">
      {total === 0 ? (
        <p className="px-4 py-10 text-center over-label">Nessuna squadra.</p>
      ) : (
        <>
          {slice.map((row, idx) => (
            <div
              key={row.id}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-1)] transition-colors cursor-pointer"
              style={idx < slice.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
              onClick={() => router.push(`/admin/squadre/${row.id}/edit`)}
            >
              <TeamFlagAvatar row={row} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {row.name}
                  </span>
                  {row.shortName && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                    >
                      {row.shortName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                    <i className="pi pi-users text-[10px]" />
                    {row.playerCount} {row.playerCount === 1 ? "giocatore" : "giocatori"}
                  </span>
                  <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                    <i className="pi pi-calendar text-[10px]" />
                    {row.matchCount} {row.matchCount === 1 ? "partita" : "partite"}
                  </span>
                  {row.playerCount === 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(234,179,8,0.12)", color: "#854d0e", border: "1px solid rgba(234,179,8,0.3)" }}
                    >
                      ⚠ nessun giocatore
                    </span>
                  )}
                  {!row.countryCode && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--surface-2)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-medium)",
                      }}
                    >
                      <i className="pi pi-globe text-[9px]" />
                      Nazione non impostata
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <ConfirmDeleteForm
                  action={deleteFootballTeam}
                  hiddenInputs={{ id: row.id }}
                  confirmMessage="Eliminare la squadra?"
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

function TeamFlagAvatar({ row }: { row: Row }) {
  const [broken, setBroken] = useState(false);
  const fallback = (row.shortName ?? row.name).slice(0, 2).toUpperCase();
  const src = row.logoUrl ?? getFlagUrlFromCountryCode(row.countryCode);

  if (!src || broken) {
    return (
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[11px] flex-shrink-0"
        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
      >
        {fallback}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={row.name}
      className="w-9 h-9 object-contain rounded-lg border border-[var(--border-soft)] bg-white p-0.5 flex-shrink-0"
      onError={() => setBroken(true)}
    />
  );
}
