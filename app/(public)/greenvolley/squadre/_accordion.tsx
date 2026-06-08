"use client";

import { useState } from "react";
import Link from "next/link";

type Player = { id: number; name: string };
type Team = { id: number; name: string; players: Player[] };

function TeamCard({ team }: { team: Team }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-3xl overflow-hidden bg-white"
      style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
    >
      <div className="flex items-center gap-3 px-6 py-4">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
          style={{ background: "var(--primary)" }}
        >
          {team.name.slice(0, 2).toUpperCase()}
        </div>

        <Link href={`/greenvolley/squadre/${team.id}`} className="flex-1 min-w-0">
          <p className="text-sm font-medium text-black truncate">{team.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {team.players.length} {team.players.length === 1 ? "giocatore" : "giocatori"}
          </p>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="shrink-0 w-6 h-6 flex items-center justify-center"
        >
          <i
            className={`pi pi-chevron-down text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            style={{ color: "rgba(0,0,0,0.35)" }}
          />
        </button>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {team.players.length === 0 ? (
            <p className="px-6 py-4 text-sm text-center" style={{ color: "var(--text-muted)", borderTop: "1px solid rgba(9,20,76,0.05)" }}>
              Nessun giocatore in rosa.
            </p>
          ) : (
            <div style={{ borderTop: "1px solid rgba(9,20,76,0.05)" }}>
              {team.players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-6 py-3"
                  style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}
                >
                  <img src="/icons/jersey.svg" width={14} height={14} alt="" style={{ opacity: 0.7 }} />
                  <span className="text-sm text-black">{p.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VolleySquadreAccordion({ teams }: { teams: Team[] }) {
  return (
    <div className="flex flex-col gap-6">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
