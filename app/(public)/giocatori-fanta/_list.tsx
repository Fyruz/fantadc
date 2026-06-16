"use client";

import { useState, useMemo } from "react";
import PlayerPickRow, { type PlayerPickRowData } from "./_player-row";

export default function PlayerPickList({ rows }: { rows: PlayerPickRowData[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.playerName.toLowerCase().includes(q) ||
        r.footballTeamName.toLowerCase().includes(q) ||
        (r.footballTeamShortName ?? "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <i
          className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
          style={{ color: "rgba(0,0,0,0.35)" }}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca giocatore o squadra…"
          className="w-full rounded-xl border py-2.5 pl-8 pr-3 text-sm outline-none transition-colors"
          style={{
            borderColor: "rgba(9,20,76,0.12)",
            background: "#fff",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Column headers */}
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: "1px solid rgba(9,20,76,0.1)" }}
      >
        <span className="text-xs uppercase" style={{ color: "rgba(0,0,0,0.65)" }}>Rank</span>
        <span className="text-xs uppercase" style={{ color: "rgba(0,0,0,0.65)" }}>Preso</span>
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <p className="py-8 text-sm text-center" style={{ color: "rgba(0,0,0,0.45)" }}>
          Nessun giocatore trovato.
        </p>
      ) : (
        <div className="flex flex-col">
          {filtered.map((row, idx) => (
            <PlayerPickRow key={row.playerId} row={row} isLast={idx === filtered.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}
