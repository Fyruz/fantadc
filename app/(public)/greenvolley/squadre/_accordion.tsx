"use client";

import { useState } from "react";

type Player = { id: number; name: string };
type Team = { id: number; name: string; players: Player[] };

function TeamCard({ team }: { team: Team }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: "var(--surface-card, #fff)",
        border: "1.5px solid var(--border-soft)",
        borderLeft: "4px solid var(--primary)",
        boxShadow: open
          ? "0 6px 24px rgba(21,128,61,0.10)"
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-4 text-left select-none transition-colors hover:bg-[var(--surface-1)]"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-black text-sm flex-shrink-0"
          style={{ background: "var(--primary)" }}
        >
          {team.name.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="font-display font-black text-base uppercase leading-tight truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {team.name}
          </div>
          <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--text-muted)" }}>
            {team.players.length} {team.players.length === 1 ? "giocatore" : "giocatori"}
          </div>
        </div>

        <i
          className={`pi pi-chevron-down text-xs flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-disabled)" }}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div style={{ borderTop: "1px solid var(--border-soft)" }}>
            {team.players.length === 0 ? (
              <p className="px-4 py-5 text-sm text-center" style={{ color: "var(--text-muted)" }}>
                Nessun giocatore in rosa.
              </p>
            ) : (
              <div className="px-4 py-2">
                {team.players.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2.5 py-2.5"
                    style={{
                      borderBottom:
                        idx < team.players.length - 1
                          ? "1px solid var(--border-soft)"
                          : undefined,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: "var(--primary)" }}
                    />
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VolleySquadreAccordion({ teams }: { teams: Team[] }) {
  return (
    <div className="flex flex-col gap-3">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
