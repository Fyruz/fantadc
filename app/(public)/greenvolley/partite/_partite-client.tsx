"use client";

import Link from "next/link";
import { useState } from "react";

type Match = {
  id: number;
  status: string;
  date: Date | null;
  homeSets: number | null;
  awaySets: number | null;
  homeTeam: string;
  awayTeam: string;
  label: string | null;
};
type StandingRow = { teamId: number; teamName: string; played: number; setsWon: number; setsLost: number };
type Group = { id: number; name: string; rows: StandingRow[] };

function formatMatchTime(date: Date) {
  return date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

function formatDayPill(date: Date) {
  return date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
}

function formatDayHeading(date: Date) {
  return date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

function MatchCard({ m }: { m: Match }) {
  const scored = m.homeSets !== null && m.awaySets !== null;
  const time = m.date ? formatMatchTime(m.date) : "—";

  return (
    <Link
      href={`/greenvolley/partite/${m.id}`}
      className="bg-white rounded-3xl p-6 flex flex-col gap-4 block"
      style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
    >
      {m.label && (
        <div className="pb-3" style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}>
          <span className="text-sm text-black">{m.label}</span>
        </div>
      )}
      <div className="flex gap-6 items-center">
        {/* Teams + set scores */}
        <div className="flex flex-col gap-3 flex-1 min-w-0 pr-6" style={{ borderRight: "1px solid rgba(9,20,76,0.05)" }}>
          <div className="flex items-center gap-3">
            <span className="text-sm text-black flex-1 truncate">{m.homeTeam}</span>
            {scored && <span className="text-sm font-semibold shrink-0" style={{ color: "var(--primary)" }}>{m.homeSets}</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-black flex-1 truncate">{m.awayTeam}</span>
            {scored && <span className="text-sm font-semibold shrink-0" style={{ color: "var(--primary)" }}>{m.awaySets}</span>}
          </div>
        </div>
        {/* Time + link */}
        <div className="flex flex-col items-center justify-center gap-3 shrink-0">
          <span className="text-sm text-black">{time}</span>
          <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>Vedi i dettagli</span>
        </div>
      </div>
    </Link>
  );
}

export default function VolleyPartiteClient({ matches, groups }: { matches: Match[]; groups: Group[] }) {
  const [tab, setTab] = useState<"calendario" | "classifica">("calendario");

  // Unique days for pills (only matches with a date)
  const days = [...new Map(
    matches
      .filter((m) => m.date)
      .map((m) => {
        const key = formatDayPill(m.date!);
        return [key, { key, date: m.date!.toDateString() }];
      })
  ).values()];

  const [activeDay, setActiveDay] = useState<string | null>(null);

  const filteredMatches = activeDay
    ? matches.filter((m) => m.date && m.date.toDateString() === activeDay)
    : matches;

  const byDay = new Map<string, Match[]>();
  for (const m of filteredMatches) {
    const key = m.date
      ? formatDayHeading(m.date)
      : "Data da definire";
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(m);
  }

  return (
    <div className="flex flex-col gap-0">
      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex" style={{ borderBottom: "1px solid rgba(9,20,76,0.08)" }}>
        {(["calendario", "classifica"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="px-0 pb-2 text-sm transition-colors"
            style={{
              marginRight: t === "calendario" ? 24 : 0,
              color: tab === t ? "var(--primary)" : "rgba(0,0,0,0.45)",
              fontWeight: tab === t ? 500 : 400,
              borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t === "calendario" ? "Calendario e risultati" : "Classifica"}
          </button>
        ))}
      </div>

      {tab === "calendario" ? (
        <div className="flex flex-col gap-10 pt-6">
          {/* Day filter pills */}
          {days.length > 1 && (
            <div className="-mx-4 px-4 flex gap-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {days.map((d) => {
                const isActive = activeDay === d.date;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setActiveDay(isActive ? null : d.date)}
                    className="shrink-0 rounded-full text-white transition-colors"
                    style={{
                      fontSize: 12,
                      fontWeight: isActive ? 500 : 400,
                      background: isActive ? "var(--primary)" : "rgba(9,20,76,0.25)",
                      padding: isActive ? "5px 12px" : "4px 12px",
                    }}
                  >
                    {d.key.charAt(0).toUpperCase() + d.key.slice(1)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Matches by day */}
          {[...byDay.entries()].map(([day, dayMatches]) => (
            <div key={day} className="flex flex-col gap-6">
              <h2 className="capitalize text-base font-medium" style={{ color: "var(--text-primary)" }}>
                {day}
              </h2>
              <div className="flex flex-col gap-4">
                {dayMatches.map((m) => <MatchCard key={m.id} m={m} />)}
              </div>
            </div>
          ))}

          {filteredMatches.length === 0 && (
            <p className="text-sm text-center" style={{ color: "rgba(0,0,0,0.4)" }}>Nessuna partita disponibile.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6 pt-10">
          {groups.length === 0 && (
            <p className="text-sm text-center" style={{ color: "rgba(0,0,0,0.4)" }}>Nessun girone disponibile.</p>
          )}
          {groups.map((g) => {
            const cols = [
              { key: "played" as const,  label: "G"  },
              { key: "setsWon" as const, label: "SV" },
              { key: "setsLost" as const,label: "SP" },
            ];
            return (
              <div
                key={g.id}
                className="bg-white rounded-3xl overflow-hidden pb-3"
                style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
              >
                <div className="px-6 pt-6 pb-3">
                  <p className="uppercase text-base font-medium" style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)", wordSpacing: "0.3em" }}>
                    {g.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-6 pb-3">
                  <span className="text-xs font-semibold uppercase text-black/40 w-5 shrink-0" />
                  <span className="text-xs font-semibold uppercase text-black/40 flex-1">Squadra</span>
                  {cols.map((c) => (
                    <span key={c.key} className="text-xs font-semibold uppercase text-black/40 w-7 text-center shrink-0">{c.label}</span>
                  ))}
                  <span className="text-xs font-semibold uppercase w-7 text-center shrink-0" style={{ color: "var(--primary)" }}>Pt</span>
                </div>
                {g.rows.map((row, idx) => (
                  <div key={row.teamId} className="flex items-center gap-2 px-6 py-3" style={{ borderTop: "1px solid rgba(9,20,76,0.05)" }}>
                    <span className="text-xs text-black/40 w-5 shrink-0 tabular-nums">{idx + 1}</span>
                    <span className="text-sm font-normal flex-1 truncate" style={{ color: "var(--text-primary)" }}>{row.teamName}</span>
                    {cols.map((c) => (
                      <span key={c.key} className="text-sm w-7 text-center shrink-0 tabular-nums" style={{ color: "var(--text-primary)" }}>
                        {row[c.key]}
                      </span>
                    ))}
                    <span className="text-sm w-7 text-center shrink-0 tabular-nums font-bold" style={{ color: "var(--primary)" }}>{row.setsWon}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
