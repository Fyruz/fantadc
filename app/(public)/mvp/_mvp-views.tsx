"use client";

import { useRouter, usePathname } from "next/navigation";
import type { PublicMvpData } from "@/lib/data/public/mvp";

const CARD: React.CSSProperties = {
  background: "#fff",
  border: "1px solid rgba(9,20,76,0.05)",
  boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)",
};

const ROW_BORDER: React.CSSProperties = {
  borderTop: "1px solid rgba(9,20,76,0.05)",
};

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function FlagOrInitial({ flagSrc, name }: { flagSrc: string | null; name: string }) {
  if (flagSrc) {
    return (
      <img
        src={flagSrc}
        alt={name}
        width={28}
        height={20}
        className="object-contain flex-shrink-0"
      />
    );
  }
  return (
    <span
      className="text-[10px] font-black uppercase flex-shrink-0"
      style={{ color: "var(--primary)", width: 28, textAlign: "center" }}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function TabBar({ active }: { active: "partita" | "giocatore" }) {
  const router = useRouter();
  const pathname = usePathname();

  function go(vista: "partita" | "giocatore") {
    const url = vista === "partita" ? pathname : `${pathname}?vista=giocatore`;
    router.push(url);
  }

  const baseStyle: React.CSSProperties = {
    padding: "6px 18px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    transition: "background 0.15s, color 0.15s",
  };

  const activeStyle: React.CSSProperties = {
    ...baseStyle,
    background: "var(--text-primary)",
    color: "#fff",
  };

  const inactiveStyle: React.CSSProperties = {
    ...baseStyle,
    background: "transparent",
    color: "var(--text-muted)",
  };

  return (
    <div
      className="flex gap-1 self-start rounded-full p-1"
      style={{ background: "rgba(9,20,76,0.06)" }}
    >
      <button
        type="button"
        style={active === "partita" ? activeStyle : inactiveStyle}
        onClick={() => go("partita")}
      >
        Per partita
      </button>
      <button
        type="button"
        style={active === "giocatore" ? activeStyle : inactiveStyle}
        onClick={() => go("giocatore")}
      >
        Per giocatore
      </button>
    </div>
  );
}

function ByMatchView({ byMatch }: { byMatch: PublicMvpData["byMatch"] }) {
  if (byMatch.length === 0) {
    return (
      <p className="text-sm text-center py-12" style={{ color: "rgba(0,0,0,0.45)" }}>
        Nessun MVP assegnato.
      </p>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden" style={CARD}>
      {byMatch.map((row, idx) => (
        <div
          key={row.matchId}
          className="flex items-center gap-4 px-5 py-4"
          style={idx > 0 ? ROW_BORDER : undefined}
        >
          {/* Date */}
          <span
            className="text-xs tabular-nums flex-shrink-0 w-16"
            style={{ color: "rgba(0,0,0,0.45)" }}
          >
            {formatDate(row.concludedAt)}
          </span>

          {/* Match label */}
          <span
            className="flex-1 text-sm font-semibold uppercase min-w-0 truncate"
            style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
          >
            {row.label}
          </span>

          {/* MVP player */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <i className="pi pi-star-fill text-[11px]" style={{ color: "#E8A000" }} />
            <FlagOrInitial flagSrc={row.mvpPlayer.flagSrc} name={row.mvpPlayer.footballTeamName} />
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {row.mvpPlayer.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ByPlayerView({ byPlayer }: { byPlayer: PublicMvpData["byPlayer"] }) {
  if (byPlayer.length === 0) {
    return (
      <p className="text-sm text-center py-12" style={{ color: "rgba(0,0,0,0.45)" }}>
        Nessun MVP assegnato.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {byPlayer.map((row) => (
        <details
          key={row.playerId}
          className="group rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 2px 8px rgba(9,20,76,0.07)" }}
        >
          <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none hover:bg-[var(--surface-1)] transition-colors">
            {/* Chevron */}
            <i
              className="pi pi-chevron-right text-[10px] flex-shrink-0 transition-transform group-open:rotate-90"
              style={{ color: "var(--text-disabled)" }}
            />

            {/* Flag + name */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FlagOrInitial flagSrc={row.flagSrc} name={row.footballTeamName} />
              <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {row.playerName}
              </span>
            </div>

            {/* Count badge */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <i className="pi pi-star-fill text-[11px]" style={{ color: "#E8A000" }} />
              <span
                className="font-black text-sm tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                ×{row.count}
              </span>
            </div>
          </summary>

          {/* Expanded match list */}
          <div style={{ borderTop: "1px solid rgba(9,20,76,0.05)" }}>
            {row.matches.map((m, idx) => (
              <div
                key={m.matchId}
                className="flex items-center justify-between gap-4 px-5 py-3"
                style={idx > 0 ? ROW_BORDER : undefined}
              >
                <span
                  className="text-sm uppercase font-medium"
                  style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
                >
                  {m.label}
                </span>
                <span className="text-xs tabular-nums flex-shrink-0" style={{ color: "rgba(0,0,0,0.45)" }}>
                  {formatDate(m.concludedAt)}
                </span>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

export default function MvpViews({
  data,
  activeView,
}: {
  data: PublicMvpData;
  activeView: "partita" | "giocatore";
}) {
  return (
    <div className="flex flex-col gap-6">
      <TabBar active={activeView} />

      {activeView === "partita" ? (
        <ByMatchView byMatch={data.byMatch} />
      ) : (
        <ByPlayerView byPlayer={data.byPlayer} />
      )}
    </div>
  );
}
