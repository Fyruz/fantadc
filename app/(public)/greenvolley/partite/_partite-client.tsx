"use client";

import { useState } from "react";
import { formatVolleyDayPill, formatVolleyDayHeading } from "@/lib/volley/format";
import VolleyMatchCard from "@/components/volley-match-card";
import VolleyStandingsCard from "@/components/volley-standings-card";
import type { VolleyStandingRow } from "@/lib/volley/standings";

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

type Group = { id: number; name: string; rows: VolleyStandingRow[] };

export default function VolleyPartiteClient({ matches, groups }: { matches: Match[]; groups: Group[] }) {
  const [tab, setTab] = useState<"calendario" | "classifica">("calendario");

  const days = [...new Map(
    matches
      .filter((m) => m.date)
      .map((m) => {
        const key = formatVolleyDayPill(m.date!);
        return [key, { key, date: m.date!.toDateString() }];
      })
  ).values()];

  const [activeDay, setActiveDay] = useState<string | null>(null);

  const filteredMatches = activeDay
    ? matches.filter((m) => m.date && m.date.toDateString() === activeDay)
    : matches;

  const byDay = new Map<string, Match[]>();
  for (const m of filteredMatches) {
    const key = m.date ? formatVolleyDayHeading(m.date) : "Data da definire";
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
                {dayMatches.map((m) => (
                  <VolleyMatchCard
                    key={m.id}
                    id={m.id}
                    homeTeam={m.homeTeam}
                    awayTeam={m.awayTeam}
                    homeSets={m.homeSets}
                    awaySets={m.awaySets}
                    label={m.label}
                    date={m.date}
                    status={m.status}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredMatches.length === 0 && (
            <p className="text-sm text-center" style={{ color: "rgba(0,0,0,0.4)" }}>
              Nessuna partita disponibile.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6 pt-10">
          {groups.length === 0 && (
            <p className="text-sm text-center" style={{ color: "rgba(0,0,0,0.4)" }}>
              Nessun girone disponibile.
            </p>
          )}
          {groups.map((g) => (
            <VolleyStandingsCard key={g.id} name={g.name} rows={g.rows} />
          ))}
        </div>
      )}
    </div>
  );
}
