"use client";

import Link from "next/link";
import { useState } from "react";

type Team = { name: string; shortName: string | null; countryCode: string | null; logoUrl: string | null } | null;
type Match = {
  id: number; status: string; startsAt: Date;
  homeScore: number | null; awayScore: number | null;
  homeSeed: string | null; awaySeed: string | null;
  homeTeam: Team; awayTeam: Team;
  group: { name: string; slug: string } | null;
  knockoutRound: { name: string } | null;
};
type GroupRow = { teamId: number; name: string; shortName: string | null; countryCode: string | null; logoUrl: string | null; qualified: boolean; played: number; won: number; drawn: number; lost: number; goalDiff: number; points: number };
type Group = { id: number; name: string; rows: GroupRow[] };

function TeamLogo({ team, size = 28 }: { team: Team; size?: number }) {
  if (!team) return <div style={{ width: size, height: size }} />;
  if (team.logoUrl) return <img src={team.logoUrl} alt={team.name} style={{ width: size, height: size, objectFit: "contain" }} />;
  if (team.countryCode) return <img src={`https://flagcdn.com/w40/${team.countryCode.toLowerCase()}.png`} alt={team.name} style={{ width: size, height: size * 0.67, objectFit: "contain", borderRadius: 2 }} />;
  return null;
}

function MatchCard({ m }: { m: Match }) {
  const scored = m.homeScore !== null && m.awayScore !== null;
  const time = m.startsAt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  const label = m.group?.name ?? m.knockoutRound?.name ?? null;

  return (
    <Link
      href={`/partite/${m.id}`}
      className="bg-white rounded-3xl p-6 flex flex-col gap-4 block"
      style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
    >
      {label && (
        <div className="pb-3" style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}>
          <span className="text-sm text-black">{label}</span>
        </div>
      )}
      <div className="flex gap-6 items-center">
        {/* Teams + scores */}
        <div className="flex flex-col gap-3 flex-1 min-w-0 pr-6" style={{ borderRight: "1px solid rgba(9,20,76,0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="shrink-0 flex items-center justify-center p-1 rounded-full" style={{ width: 32, height: 32 }}>
              <TeamLogo team={m.homeTeam} size={24} />
            </div>
            <span className="text-sm text-black flex-1 truncate">{m.homeTeam?.shortName ?? m.homeTeam?.name ?? m.homeSeed ?? "TBD"}</span>
            {scored && <span className="text-sm font-semibold text-black shrink-0">{m.homeScore}</span>}
          </div>
          <div className="flex items-center gap-3">
            <div className="shrink-0 flex items-center justify-center p-1 rounded-full" style={{ width: 32, height: 32 }}>
              <TeamLogo team={m.awayTeam} size={24} />
            </div>
            <span className="text-sm text-black flex-1 truncate">{m.awayTeam?.shortName ?? m.awayTeam?.name ?? m.awaySeed ?? "TBD"}</span>
            {scored && <span className="text-sm font-semibold text-black shrink-0">{m.awayScore}</span>}
          </div>
        </div>
        {/* Time + link */}
        <div className="flex flex-col items-center justify-center gap-3 shrink-0">
          <span className="text-sm text-black">{time}</span>
          <span className="text-xs font-medium text-black">Vedi i dettagli</span>
        </div>
      </div>
    </Link>
  );
}

export default function PartiteClient({ matches, groups }: { matches: Match[]; groups: Group[] }) {
  const [tab, setTab] = useState<"calendario" | "classifica">("calendario");

  // Unique days for pills
  const days = [...new Map(
    matches.map((m) => {
      const key = m.startsAt.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
      const full = m.startsAt.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
      return [key, { key, full, date: m.startsAt.toDateString() }];
    })
  ).values()];

  const [activeDay, setActiveDay] = useState<string | null>(null);

  const filteredMatches = activeDay
    ? matches.filter((m) => m.startsAt.toDateString() === activeDay)
    : matches;

  const byDay = new Map<string, Match[]>();
  for (const m of filteredMatches) {
    const key = m.startsAt.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
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
              fontWeight: tab === t ? 500 : 400,
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
            <div className="flex gap-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
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
                {dayMatches.map((m) => <MatchCard key={m.id} m={m} />)}
              </div>
            </div>
          ))}

          {filteredMatches.length === 0 && (
            <p className="text-sm text-center" style={{ color: "rgba(0,0,0,0.4)" }}>Nessuna partita per questo giorno.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6 pt-10">
          {groups.map((g) => {
            const cols = [
              { key: "played" as const, label: "PG" },
              { key: "won"    as const, label: "V"  },
              { key: "drawn"  as const, label: "N"  },
              { key: "lost"   as const, label: "S"  },
              { key: "goalDiff" as const, label: "DR" },
              { key: "points" as const, label: "PT" },
            ];
            return (
              <div
                key={g.id}
                className="bg-white rounded-3xl overflow-hidden pb-3"
                style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
              >
                <div className="px-6 pt-6 pb-3">
                  <p className="uppercase text-base font-medium text-(--text-primary)" style={{ fontFamily: "var(--font-tallica)" }}>
                    {g.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-6 pb-3">
                  <span className="text-xs font-semibold uppercase text-black/40 w-5 shrink-0" />
                  <span className="text-xs font-semibold uppercase text-black/40 flex-1">SQUADRA</span>
                  {cols.map((c) => (
                    <span key={c.key} className="text-xs font-semibold uppercase text-black/40 w-7 text-center shrink-0">{c.label}</span>
                  ))}
                </div>
                {g.rows.map((row, idx) => (
                  <div key={row.teamId} className="flex items-center gap-2 px-6 py-3" style={{ borderTop: "1px solid rgba(9,20,76,0.05)" }}>
                    <span className="text-xs text-black/40 w-5 shrink-0 tabular-nums">{idx + 1}</span>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {row.logoUrl ? (
                        <img src={row.logoUrl} alt={row.name} className="w-6 h-6 object-contain shrink-0" />
                      ) : row.countryCode ? (
                        <img src={`https://flagcdn.com/w40/${row.countryCode.toLowerCase()}.png`} alt={row.name} className="w-6 h-4 object-contain rounded-sm shrink-0" />
                      ) : null}
                      <span className="text-sm font-normal text-(--text-primary) truncate">{row.shortName ?? row.name}</span>
                      {row.qualified && <span className="text-[9px] font-bold shrink-0" style={{ color: "#10B981" }}>Q</span>}
                    </div>
                    {cols.map((c) => {
                      const val = row[c.key] as number;
                      const display = c.key === "goalDiff" && val > 0 ? `+${val}` : val;
                      const isPoints = c.key === "points";
                      return (
                        <span key={c.key} className="text-sm w-7 text-center shrink-0 tabular-nums" style={{ color: "var(--text-primary)", fontWeight: isPoints ? 700 : 400 }}>
                          {display}
                        </span>
                      );
                    })}
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
