"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import RoleBadge from "@/components/role-badge";

type MatchStat = {
  matchId: number;
  startsAt: string;
  isHome: boolean;
  opponent: string;
  hs: number | null;
  as_: number | null;
  won: boolean;
  lost: boolean;
  matchGoals: number;
  matchBonusPoints: number;
  status: string;
};

type Player = {
  id: number;
  name: string;
  role: string;
  footballTeam: { name: string; shortName: string | null };
  totalGoals: number;
  totalOwnGoals: number;
  totalBonusPoints: number;
  presenze: number;
  matchStats: MatchStat[];
};

type Group = { teamName: string; players: Player[] };

function PlayerDialog({ player, onHide }: { player: Player; onHide: () => void }) {
  const pts = player.totalBonusPoints;
  const ptsStr = pts % 1 === 0 ? String(pts) : pts.toFixed(1);

  return (
    <Dialog
      visible
      onHide={onHide}
      header={null}
      closable={false}
      style={{ width: "min(28rem, 94vw)", padding: 0 }}
      contentStyle={{ padding: 0 }}
      pt={{ root: { style: { borderRadius: "20px", overflow: "hidden" } } }}
      modal
      draggable={false}
      resizable={false}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-soft)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
          style={{
            background: player.role === "GK" ? "rgba(232,160,0,0.12)" : "rgba(1,7,163,0.08)",
            color: player.role === "GK" ? "#C87800" : "var(--primary)",
          }}
        >
          {player.role === "GK" ? "P" : "A"}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-display font-black text-base uppercase leading-tight truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {player.name}
          </div>
          <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            {player.footballTeam.name}
          </div>
        </div>
        <button
          type="button"
          onClick={onHide}
          className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition-colors"
          style={{ background: "var(--surface-1)", color: "var(--text-muted)" }}
        >
          <i className="pi pi-times text-xs" />
        </button>
      </div>

      {/* ── Stats strip ── */}
      <div
        className="grid grid-cols-3"
        style={{ borderBottom: "1px solid var(--border-soft)" }}
      >
        {[
          { label: "Presenze", value: player.presenze },
          { label: "Goal", value: player.totalGoals + (player.totalOwnGoals > 0 ? ` (+${player.totalOwnGoals} AG)` : "") },
          { label: "Punti fanta", value: ptsStr },
        ].map(({ label, value }, i) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center py-3 gap-0.5"
            style={i < 2 ? { borderRight: "1px solid var(--border-soft)" } : undefined}
          >
            <span
              className="font-display font-black text-xl leading-none"
              style={{ color: "var(--text-primary)" }}
            >
              {value}
            </span>
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Match history ── */}
      <div className="flex flex-col">
        {player.matchStats.length === 0 ? (
          <p className="px-5 py-6 text-sm text-center" style={{ color: "var(--text-muted)" }}>
            Nessuna partita giocata.
          </p>
        ) : (
          <>
            <div
              className="px-5 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Ultime partite
            </div>
            {player.matchStats.map((m, idx) => (
              <div
                key={m.matchId}
                className="flex items-center gap-3 px-5 py-3"
                style={{
                  borderTop: idx > 0 ? "1px solid var(--border-soft)" : undefined,
                }}
              >
                {/* W/D/L dot */}
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5"
                  style={{
                    background:
                      m.hs === null
                        ? "var(--text-disabled)"
                        : m.won
                        ? "#10B981"
                        : m.lost
                        ? "#EF4444"
                        : "#94A3B8",
                  }}
                />
                {/* Opponent */}
                <span
                  className="text-sm font-semibold flex-1 truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {m.isHome ? "vs" : "@"} {m.opponent}
                </span>
                {/* Badges */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {m.matchGoals > 0 && (
                    <span
                      className="text-[11px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(1,7,163,0.08)", color: "var(--primary)" }}
                    >
                      ⚽ {m.matchGoals}
                    </span>
                  )}
                  {m.matchBonusPoints !== 0 && (
                    <span
                      className="text-[11px] font-black px-2 py-0.5 rounded-full"
                      style={{
                        background: m.matchBonusPoints > 0 ? "#ECFDF5" : "#FEF2F2",
                        color: m.matchBonusPoints > 0 ? "#065F46" : "#991B1B",
                      }}
                    >
                      {m.matchBonusPoints > 0 ? "+" : ""}
                      {m.matchBonusPoints % 1 === 0
                        ? m.matchBonusPoints
                        : m.matchBonusPoints.toFixed(1)}
                      pt
                    </span>
                  )}
                  {/* Score */}
                  {m.hs !== null && m.as_ !== null && (
                    <span
                      className="text-xs font-display font-black tabular-nums"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {m.hs}–{m.as_}
                    </span>
                  )}
                </div>
                {/* Date */}
                <span
                  className="text-[10px] flex-shrink-0 hidden sm:block"
                  style={{ color: "var(--text-muted)" }}
                >
                  {new Date(m.startsAt).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </Dialog>
  );
}

export default function PlayersGrid({ groups }: { groups: Group[] }) {
  const [selected, setSelected] = useState<Player | null>(null);

  return (
    <>
      {selected && (
        <PlayerDialog player={selected} onHide={() => setSelected(null)} />
      )}

      <div className="flex flex-col gap-3">
        {groups.map(({ teamName, players }) => (
          <div key={teamName} className="card overflow-hidden">
            {/* Team header */}
            <div
              className="px-4 py-2.5"
              style={{ borderBottom: "1px solid var(--border-soft)", background: "var(--surface-1)" }}
            >
              <span
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                {teamName}
              </span>
            </div>

            {/* Player grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3">
              {players.map((p, idx) => {
                const col = players.length <= 2 ? 2 : 3;
                const lastRowStart = players.length - (players.length % col || col);
                const isInLastRow = idx >= lastRowStart;

                return (
                  <button
                    key={p.id}
                    type="button"
                    className="flex items-center gap-2.5 px-4 py-3 text-left w-full transition-colors hover:bg-[var(--surface-1)] active:bg-[var(--surface-2)]"
                    style={{
                      borderBottom: !isInLastRow ? "1px solid var(--border-soft)" : undefined,
                      borderRight:
                        (idx + 1) % 2 !== 0 && idx !== players.length - 1
                          ? "1px solid var(--border-soft)"
                          : undefined,
                    }}
                    onClick={() => setSelected(p)}
                  >
                    <RoleBadge role={p.role} />
                    <div className="min-w-0">
                      <div
                        className="text-sm font-semibold truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {p.name}
                      </div>
                      {(p.totalGoals > 0 || p.totalBonusPoints !== 0) && (
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.totalGoals > 0 && (
                            <span className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
                              ⚽ {p.totalGoals}
                            </span>
                          )}
                          {p.totalBonusPoints !== 0 && (
                            <span
                              className="text-[10px] font-semibold"
                              style={{ color: p.totalBonusPoints > 0 ? "#065F46" : "#991B1B" }}
                            >
                              {p.totalBonusPoints > 0 ? "+" : ""}
                              {p.totalBonusPoints % 1 === 0
                                ? p.totalBonusPoints
                                : p.totalBonusPoints.toFixed(1)}
                              pt
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
