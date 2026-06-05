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
  date: Date | null;
  result: string;
  groupId: number | null;
  knockoutRoundId: number | null;
  groupName: string | null;
  knockoutRoundName: string | null;
  setCount: number;
};

type Tab = "all" | "group" | "knockout" | "none";

const PAGE_SIZE = 15;
const GV = "#15803D";
const GV_LIGHT = "rgba(21,128,61,0.08)";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  DRAFT:     { bg: "var(--surface-2)",          text: "var(--text-muted)"   },
  SCHEDULED: { bg: "rgba(21,128,61,0.10)",       text: GV                    },
  CONCLUDED: { bg: "rgba(61,217,7,0.14)",        text: "#166534"             },
};

export default function VolleyMatchesTable({ matches }: { matches: Row[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(0);

  const filtered = matches.filter((row) => {
    if (tab === "all") return true;
    if (tab === "group") return row.groupId !== null;
    if (tab === "knockout") return row.knockoutRoundId !== null;
    if (tab === "none") return row.groupId === null && row.knockoutRoundId === null;
    return true;
  });

  const total = filtered.length;
  const start = page * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const counts = {
    all: matches.length,
    group: matches.filter((row) => row.groupId !== null).length,
    knockout: matches.filter((row) => row.knockoutRoundId !== null).length,
    none: matches.filter((row) => row.groupId === null && row.knockoutRoundId === null).length,
  };
  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: `Tutte (${counts.all})` },
    { key: "group", label: `Gironi (${counts.group})` },
    { key: "knockout", label: `Eliminazione (${counts.knockout})` },
    { key: "none", label: `Senza fase (${counts.none})` },
  ];

  const changeTab = (nextTab: Tab) => {
    setTab(nextTab);
    setPage(0);
  };

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center gap-0.5 px-3 py-2 overflow-x-auto"
        style={{ borderBottom: "1px solid var(--border-soft)", background: "var(--surface-1)" }}
      >
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => changeTab(item.key)}
            className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
            style={
              tab === item.key
                ? { background: GV, color: "#fff" }
                : { color: "var(--text-muted)" }
            }
          >
            {item.label}
          </button>
        ))}
      </div>

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
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: statusColors.bg, color: statusColors.text }}
                    >
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                    {row.groupName && (
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: GV_LIGHT, color: GV }}
                      >
                        {row.groupName}
                      </span>
                    )}
                    {row.knockoutRoundName && (
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(61,217,7,0.12)", color: "#166534" }}
                      >
                        {row.knockoutRoundName}
                      </span>
                    )}
                  </div>
                  <div className="font-display font-black text-sm uppercase flex items-baseline gap-1.5 flex-wrap" style={{ color: "var(--text-primary)" }}>
                    <span>{row.homeTeamName}</span>
                    <span className="font-sans font-bold text-xs" style={{ color: row.result !== "—" ? GV : "var(--text-disabled)" }}>
                      {row.result !== "—" ? row.result : "vs"}
                    </span>
                    <span>{row.awayTeamName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    {row.date && (
                      <span>
                        {row.date.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                        {" · "}
                        {row.date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                    <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
                      {row.setCount} set
                    </span>
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
