"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PublicMvpData } from "@/lib/data/public/mvp";

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Flag({ flagSrc, name }: { flagSrc: string | null; name: string }) {
  if (flagSrc) {
    return (
      <img src={flagSrc} alt={name} width={24} height={16} className="object-contain flex-shrink-0" />
    );
  }
  return (
    <span className="text-[10px] font-black uppercase flex-shrink-0" style={{ color: "var(--primary)", minWidth: 24 }}>
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function TabBar({ active }: { active: "partita" | "giocatore" }) {
  const pathname = usePathname();

  const tabs = [
    { key: "partita" as const, label: "Per partita", href: pathname },
    { key: "giocatore" as const, label: "Per giocatore", href: `${pathname}?vista=giocatore` },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            scroll={false}
            className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors"
            style={
              isActive
                ? { background: "var(--primary)", color: "#fff" }
                : { background: "var(--surface-1)", color: "var(--text-secondary)" }
            }
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

function ByMatchView({ byMatch }: { byMatch: PublicMvpData["byMatch"] }) {
  if (byMatch.length === 0) {
    return (
      <div className="card p-10 text-center over-label">Nessun MVP assegnato.</div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {byMatch.map((row, idx) => (
        <div
          key={row.matchId}
          className="flex items-center gap-3 px-4 py-3.5"
          style={idx < byMatch.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : undefined}
        >
          {/* Date */}
          <span className="text-xs tabular-nums flex-shrink-0 w-14" style={{ color: "var(--text-muted)" }}>
            {formatDate(row.concludedAt)}
          </span>

          {/* Match label */}
          <span
            className="flex-1 min-w-0 truncate text-sm font-semibold uppercase"
            style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
          >
            {row.label}
          </span>

          {/* MVP */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <i className="pi pi-star-fill text-[10px]" style={{ color: "#E8A000" }} />
            <Flag flagSrc={row.mvpPlayer.flagSrc} name={row.mvpPlayer.footballTeamName} />
            <span className="text-sm text-black">{row.mvpPlayer.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ByPlayerView({ byPlayer }: { byPlayer: PublicMvpData["byPlayer"] }) {
  if (byPlayer.length === 0) {
    return (
      <div className="card p-10 text-center over-label">Nessun MVP assegnato.</div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {byPlayer.map((row) => (
        <details
          key={row.playerId}
          className="group card overflow-hidden"
        >
          <summary className="flex items-center gap-3 px-4 py-3.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none hover:bg-[var(--surface-1)] transition-colors">
            <i
              className="pi pi-chevron-right text-[10px] flex-shrink-0 transition-transform group-open:rotate-90"
              style={{ color: "var(--text-disabled)" }}
            />
            <Flag flagSrc={row.flagSrc} name={row.footballTeamName} />
            <span className="flex-1 min-w-0 text-sm text-black truncate">{row.playerName}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <i className="pi pi-star-fill text-[10px]" style={{ color: "#E8A000" }} />
              <span className="font-display font-black text-sm" style={{ color: "var(--text-primary)" }}>
                ×{row.count}
              </span>
            </div>
          </summary>

          <div style={{ borderTop: "1px solid var(--border-soft)" }}>
            {row.matches.map((m, idx) => (
              <div
                key={m.matchId}
                className="flex items-center justify-between gap-4 px-4 py-3 pl-11"
                style={idx > 0 ? { borderTop: "1px solid var(--border-soft)" } : undefined}
              >
                <span
                  className="text-sm font-semibold uppercase truncate"
                  style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
                >
                  {m.label}
                </span>
                <span className="text-xs flex-shrink-0 tabular-nums" style={{ color: "var(--text-muted)" }}>
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
