"use client";

import { useState } from "react";
import Link from "next/link";

type FantaTeam = { id: number; name: string; ownerLabel: string };

export type PlayerPickRowData = {
  rank: number;
  playerId: number;
  playerName: string;
  role: string;
  footballTeamName: string;
  footballTeamShortName: string | null;
  flagSrc: string | null;
  pickCount: number;
  pickRate: number;
  fantasyTeams: FantaTeam[];
};

export default function PlayerPickRow({ row, isLast }: { row: PlayerPickRowData; isLast: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: !isLast ? "1px solid rgba(0,0,0,0.05)" : undefined }}>
      <button
        type="button"
        className="w-full flex gap-4 items-center py-3 text-left transition-colors hover:bg-(--surface-1)"
        style={{ paddingLeft: 8, borderLeft: "2px solid transparent" }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-xs shrink-0 w-5 text-black">{row.rank}</span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
          {row.flagSrc ? (
            <img
              src={row.flagSrc}
              alt={row.footballTeamName}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <span className="text-[10px] font-semibold uppercase" style={{ color: "rgba(0,0,0,0.55)" }}>
              {(row.footballTeamShortName ?? row.footballTeamName).slice(0, 2)}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-sm truncate font-medium text-black">{row.playerName}</span>
          <span className="text-xs truncate" style={{ color: "rgba(0,0,0,0.65)" }}>
            {row.footballTeamShortName ?? row.footballTeamName}
            {" · "}
            {row.role === "P" ? "Portiere" : "Giocatore"}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-semibold text-black">{row.pickCount}</span>
          <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.45)" }}>
            {row.pickRate.toFixed(0)}%
          </span>
        </div>
        <i
          className={`pi pi-chevron-down text-xs shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "rgba(0,0,0,0.35)" }}
        />
      </button>

      {/* Collapsible content (CSS grid trick for smooth animation) */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {row.fantasyTeams.length === 0 ? (
            <p className="pb-3 pl-12 text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>
              Nessuna squadra fanta lo ha preso.
            </p>
          ) : (
            <div className="flex flex-col pb-2 pl-12">
              {row.fantasyTeams.map((team) => (
                <Link
                  key={team.id}
                  href={`/squadre-fanta/${team.id}`}
                  className="flex items-center gap-2.5 py-2 transition-colors hover:bg-(--surface-1)"
                  style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
                >
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold uppercase text-white"
                    style={{ background: "var(--primary)" }}
                  >
                    {team.name.slice(0, 2)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs truncate font-medium text-black">{team.name}</span>
                    <span className="text-[10px] truncate" style={{ color: "rgba(0,0,0,0.45)" }}>
                      {team.ownerLabel}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
