"use client";

import { useState } from "react";
import { formatVolleyDayPill, formatVolleyDayHeading } from "@/lib/volley/format";
import VolleyMatchCard from "@/components/volley-match-card";
import VolleyStandingsCard from "@/components/volley-standings-card";
import VolleyKnockoutBracket from "@/components/volley-knockout-bracket";
import type { VolleyStandingRow } from "@/lib/volley/standings";
import type { getPublicVolleyEliminationRounds } from "@/lib/data/public/volley";

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
type KnockoutRound = Awaited<ReturnType<typeof getPublicVolleyEliminationRounds>>[number];

// Le etichette dei giorni sono formattate in UTC: la chiave di raggruppamento deve usare lo stesso fuso,
// altrimenti un orario vicino alla mezzanotte fa "scivolare" la partita sul giorno locale sbagliato.
function utcDayKey(date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
}

const TABS = ["calendario", "classifica", "tabellone"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABELS: Record<Tab, string> = {
  calendario: "Calendario e risultati",
  classifica: "Classifica",
  tabellone: "Tabellone",
};

export default function VolleyPartiteClient({ matches, groups, knockoutRounds }: { matches: Match[]; groups: Group[]; knockoutRounds: KnockoutRound[] }) {
  const [tab, setTab] = useState<Tab>("calendario");

  const days = [...new Map(
    matches
      .filter((m) => m.date)
      .map((m) => {
        const key = formatVolleyDayPill(m.date!);
        return [key, { key, date: utcDayKey(m.date!) }];
      })
  ).values()];

  const [activeDay, setActiveDay] = useState<string | null>(() => {
    const dated = matches.filter((m): m is Match & { date: Date } => m.date !== null);
    if (dated.length === 0) return null;
    const now = new Date();
    const upcoming = dated.filter((m) => m.date >= now);
    if (upcoming.length > 0) {
      return utcDayKey(upcoming.reduce((min, m) => (m.date < min.date ? m : min)).date);
    }
    return utcDayKey(dated.reduce((max, m) => (m.date > max.date ? m : max)).date);
  });

  const filteredMatches = activeDay
    ? matches.filter((m) => m.date && utcDayKey(m.date) === activeDay)
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
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="px-0 pb-2 text-sm transition-colors"
            style={{
              marginRight: t === "tabellone" ? 0 : 24,
              color: tab === t ? "var(--primary)" : "rgba(0,0,0,0.45)",
              fontWeight: tab === t ? 500 : 400,
              borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {TAB_LABELS[t]}
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
                    ref={
                      isActive
                        ? (el) => el?.scrollIntoView({ block: "nearest", inline: "center" })
                        : undefined
                    }
                    type="button"
                    onClick={() => setActiveDay(isActive ? null : d.date)}
                    className="shrink-0 rounded-full text-white transition-colors"
                    style={{
                      fontSize: 12,
                      fontWeight: isActive ? 500 : 400,
                      background: isActive ? "var(--primary)" : "rgba(9,20,76,0.25)",
                      padding: isActive ? "5px 12px" : "4px 12px",
                      scrollMarginInlineStart: 16,
                      scrollMarginInlineEnd: 16,
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
      ) : tab === "classifica" ? (
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
      ) : (
        <div className="pt-6">
          <VolleyKnockoutBracket rounds={knockoutRounds} />
        </div>
      )}
    </div>
  );
}
