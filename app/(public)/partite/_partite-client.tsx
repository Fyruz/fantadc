"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { type GroupStandingRow } from "@/lib/standings";
import type { PublicKnockoutRound } from "@/lib/data/public/matches";
import GroupStandingCard from "@/components/group-standing-card";
import MatchCard from "@/components/match-card";
import KnockoutBracket from "@/components/knockout-bracket";

type Team = { name: string; shortName: string | null; countryCode: string | null; logoUrl: string | null } | null;
type Match = {
  id: number; status: string; startsAt: Date;
  homeScore: number | null; awayScore: number | null;
  homeSeed: string | null; awaySeed: string | null;
  homeTeam: Team; awayTeam: Team;
  group: { name: string; slug: string } | null;
  knockoutRound: { name: string } | null;
};
type Group = { id: number; name: string; rows: GroupStandingRow[] };

const TABS = ["calendario", "classifica", "tabellone"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABELS: Record<Tab, string> = {
  calendario: "Calendario e risultati",
  classifica: "Classifica",
  tabellone: "Tabellone",
};

// Le etichette dei giorni sono formattate in UTC: la chiave di raggruppamento deve usare lo stesso fuso,
// altrimenti un orario vicino alla mezzanotte fa "scivolare" la partita sul giorno locale sbagliato.
function utcDayKey(date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
}

export default function PartiteClient({ matches, groups, knockoutRounds }: { matches: Match[]; groups: Group[]; knockoutRounds: PublicKnockoutRound[] }) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => {
    const fromUrl = searchParams.get("tab");
    return TABS.includes(fromUrl as Tab) ? (fromUrl as Tab) : "calendario";
  });

  // Unique days for pills
  const days = [...new Map(
    matches.map((m) => {
      const key = m.startsAt.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
      const full = m.startsAt.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
      return [key, { key, full, date: utcDayKey(m.startsAt) }];
    })
  ).values()];

  const [activeDay, setActiveDay] = useState<string | null>(() => {
    if (matches.length === 0) return null;
    const now = new Date();
    const upcoming = matches.filter((m) => m.startsAt >= now);
    if (upcoming.length > 0) {
      return utcDayKey(upcoming.reduce((min, m) => (m.startsAt < min.startsAt ? m : min)).startsAt);
    }
    return utcDayKey(matches.reduce((max, m) => (m.startsAt > max.startsAt ? m : max)).startsAt);
  });

  const filteredMatches = activeDay
    ? matches.filter((m) => utcDayKey(m.startsAt) === activeDay)
    : matches;

  const byDay = new Map<string, Match[]>();
  for (const m of filteredMatches) {
    const key = m.startsAt.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
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
              color: tab === t ? "var(--text-primary)" : "rgba(0,0,0,0.45)",
              fontWeight: tab === t ? 600 : 400,
              borderBottom: tab === t ? "2px solid var(--text-primary)" : "2px solid transparent",
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
                    className="shrink-0 rounded-full text-white transition-all duration-300 ease-out"
                    style={{
                      fontSize: 12,
                      fontWeight: isActive ? 500 : 400,
                      background: isActive ? "var(--text-primary)" : "rgba(9,20,76,0.25)",
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
                {dayMatches.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </div>
          ))}

          {filteredMatches.length === 0 && (
            <p className="text-sm text-center" style={{ color: "rgba(0,0,0,0.4)" }}>Nessuna partita per questo giorno.</p>
          )}
        </div>
      ) : tab === "classifica" ? (
        <div className="flex flex-col gap-6 pt-10">
          {groups.map((g) => (
            <GroupStandingCard key={g.id} group={g} />
          ))}
        </div>
      ) : (
        <div className="pt-6">
          <KnockoutBracket rounds={knockoutRounds} />
        </div>
      )}
    </div>
  );
}
