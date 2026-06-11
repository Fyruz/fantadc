"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { type GroupStandingRow } from "@/lib/standings";
import GroupStandingCard from "@/components/group-standing-card";
import MatchCard from "@/components/match-card";

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


export default function PartiteClient({ matches, groups }: { matches: Match[]; groups: Group[] }) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"calendario" | "classifica">(
    searchParams.get("tab") === "classifica" ? "classifica" : "calendario"
  );

  // Unique days for pills
  const days = [...new Map(
    matches.map((m) => {
      const key = m.startsAt.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
      const full = m.startsAt.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
      return [key, { key, full, date: m.startsAt.toDateString() }];
    })
  ).values()];

  const [activeDay, setActiveDay] = useState<string | null>(null);

  const filteredMatches = activeDay
    ? matches.filter((m) => m.startsAt.toDateString() === activeDay)
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
        {(["calendario", "classifica"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="px-0 pb-2 text-sm transition-colors"
            style={{
              marginRight: t === "calendario" ? 24 : 0,
              color: tab === t ? "var(--text-primary)" : "rgba(0,0,0,0.45)",
              fontWeight: tab === t ? 600 : 400,
              borderBottom: tab === t ? "2px solid var(--text-primary)" : "2px solid transparent",
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
                      background: isActive ? "var(--text-primary)" : "rgba(9,20,76,0.25)",
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
                {dayMatches.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </div>
          ))}

          {filteredMatches.length === 0 && (
            <p className="text-sm text-center" style={{ color: "rgba(0,0,0,0.4)" }}>Nessuna partita per questo giorno.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6 pt-10">
          {groups.map((g) => (
            <GroupStandingCard key={g.id} group={g} />
          ))}
        </div>
      )}
    </div>
  );
}
