"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/status-badge";

type MatchRow = {
  id: number;
  status: string;
  date: Date | null;
  homeSets: number | null;
  awaySets: number | null;
  homeTeam: string;
  awayTeam: string;
  groupName: string | null;
  knockoutName: string | null;
};

type Tab = "all" | "group" | "knockout" | "none";

function formatMatchDate(date: Date | null) {
  if (!date) return { day: "—", time: "—" };
  const day = date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  const time = date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  return { day, time };
}

export default function VolleyMatchList({ matches }: { matches: MatchRow[] }) {
  const [tab, setTab] = useState<Tab>("all");

  const counts = {
    all: matches.length,
    group: matches.filter((m) => m.groupName !== null).length,
    knockout: matches.filter((m) => m.knockoutName !== null).length,
    none: matches.filter((m) => m.groupName === null && m.knockoutName === null).length,
  };

  const hasPhases = counts.group > 0 || counts.knockout > 0;

  const filtered = matches.filter((m) => {
    if (tab === "all") return true;
    if (tab === "group") return m.groupName !== null;
    if (tab === "knockout") return m.knockoutName !== null;
    if (tab === "none") return m.groupName === null && m.knockoutName === null;
    return true;
  });

  if (matches.length === 0) {
    return <div className="card p-10 text-center over-label">Nessuna partita disponibile.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs — only when phase data exists */}
      {hasPhases && (
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {(
            [
              { key: "all" as Tab, label: `Tutte (${counts.all})` },
              { key: "group" as Tab, label: `Gironi (${counts.group})`, show: counts.group > 0 },
              { key: "knockout" as Tab, label: `Eliminazione (${counts.knockout})`, show: counts.knockout > 0 },
              { key: "none" as Tab, label: `Senza fase (${counts.none})`, show: counts.none > 0 },
            ] as { key: Tab; label: string; show?: boolean }[]
          )
            .filter((t) => t.show !== false)
            .map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0"
                style={
                  tab === t.key
                    ? { background: "var(--primary)", color: "#fff" }
                    : { background: "var(--surface-1)", color: "var(--text-muted)", border: "1px solid var(--border-soft)" }
                }
              >
                {t.label}
              </button>
            ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card p-8 text-center over-label">Nessuna partita in questa categoria.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((m) => {
            const { day, time } = formatMatchDate(m.date);
            const scored = m.homeSets !== null && m.awaySets !== null;

            return (
              <Link
                key={m.id}
                href={`/greenvolley/partite/${m.id}`}
                className="block rounded-[20px] overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "#fff",
                  border: "1.5px solid var(--border-medium)",
                  boxShadow: "0 2px 12px rgba(21,128,61,0.07)",
                }}
              >
                {/* Top bar */}
                <div
                  className="flex items-center justify-between px-4 py-2.5 gap-2"
                  style={{ borderBottom: "1px solid var(--border-soft)" }}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <StatusBadge status={m.status} />
                    {m.groupName && (
                      <span
                        className="text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 truncate"
                        style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                      >
                        {m.groupName}
                      </span>
                    )}
                    {m.knockoutName && (
                      <span
                        className="text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 truncate"
                        style={{ background: "rgba(61,217,7,0.20)", color: "#0B5C2A" }}
                      >
                        {m.knockoutName}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[11px] font-semibold capitalize flex-shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {day}
                  </span>
                </div>

                {/* Match body */}
                <div className="px-4 py-5 flex items-center gap-2">
                  {/* Home */}
                  <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span
                      className="font-display font-black text-2xl uppercase leading-none tracking-tight text-center"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {m.homeTeam}
                    </span>
                  </div>

                  {/* Score / VS */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 px-2">
                    {scored ? (
                      <div
                        className="font-display font-black text-3xl leading-none"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {m.homeSets}
                        <span style={{ color: "var(--text-disabled)" }}> — </span>
                        {m.awaySets}
                      </div>
                    ) : (
                      <>
                        <div
                          className="font-display font-black text-xl leading-none"
                          style={{ color: "var(--primary)" }}
                        >
                          VS
                        </div>
                        <div
                          className="text-[11px] font-bold tabular-nums"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {time}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Away */}
                  <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span
                      className="font-display font-black text-2xl uppercase leading-none tracking-tight text-center"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {m.awayTeam}
                    </span>
                  </div>
                </div>

                {/* Bottom strip — only when concluded with score */}
                {scored && m.date && (
                  <div
                    className="px-4 py-2 text-center text-[11px] font-semibold"
                    style={{
                      borderTop: "1px solid var(--border-soft)",
                      background: "var(--surface-1)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {day} · {time}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
