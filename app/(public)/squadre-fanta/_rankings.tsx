"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import type { RankEntry } from "@/lib/scoring";

export default function SquadreFantasyRankings({ rankings }: { rankings: RankEntry[] }) {
  const [email, setEmail] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const session = await response.json() as { user?: { email?: string | null } | null };
        if (!controller.signal.aborted) setEmail(session.user?.email ?? null);
      } catch {
        if (!controller.signal.aborted) setEmail(null);
      }
    }

    loadSession();
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rankings;
    return rankings.filter(
      (r) =>
        r.fantasyTeamName.toLowerCase().includes(q) ||
        (r.userName ?? "").toLowerCase().includes(q) ||
        r.userEmail.toLowerCase().includes(q)
    );
  }, [rankings, search]);

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
          placeholder="Cerca squadra o allenatore…"
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
        <span className="text-xs uppercase" style={{ color: "rgba(0,0,0,0.65)" }}>P.ti totali</span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-sm text-center" style={{ color: "rgba(0,0,0,0.45)" }}>
          Nessuna squadra trovata.
        </p>
      ) : (
        <div className="flex flex-col">
          {filtered.map((r, idx) => {
            const isMe = email === r.userEmail;
            return (
              <Link
                key={r.fantasyTeamId}
                href={`/squadre-fanta/${r.fantasyTeamId}`}
                className="flex gap-4 items-center py-3 transition-colors hover:bg-(--surface-1)"
                style={{
                  borderBottom: idx < filtered.length - 1 ? "1px solid rgba(0,0,0,0.05)" : undefined,
                  paddingLeft: isMe ? 6 : 8,
                  borderLeft: isMe ? "2px solid var(--text-primary)" : "2px solid transparent",
                }}
              >
                <span className="text-xs shrink-0 w-5 text-black">{r.rank}</span>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className="text-sm truncate font-medium text-black">{r.fantasyTeamName}</span>
                  <span className="text-xs truncate" style={{ color: "rgba(0,0,0,0.65)" }}>
                    {r.userName ?? r.userEmail}
                  </span>
                </div>
                <span className="text-sm font-semibold shrink-0 text-black">
                  {Number.isInteger(r.totalPoints) ? r.totalPoints : r.totalPoints.toFixed(1)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
