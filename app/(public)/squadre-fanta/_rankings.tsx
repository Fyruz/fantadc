"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RankEntry } from "@/lib/scoring";

export default function SquadreFantasyRankings({ rankings }: { rankings: RankEntry[] }) {
  const [email, setEmail] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: "1px solid rgba(9,20,76,0.1)" }}
      >
        <span className="text-xs uppercase" style={{ color: "rgba(0,0,0,0.65)" }}>Rank</span>
        <span className="text-xs uppercase" style={{ color: "rgba(0,0,0,0.65)" }}>P.ti totali</span>
      </div>

      <div className="flex flex-col">
        {rankings.map((r, idx) => {
          const isMe = email === r.userEmail;
          return (
            <Link
              key={r.fantasyTeamId}
              href={`/squadre-fanta/${r.fantasyTeamId}`}
              className="flex gap-4 items-center py-3 transition-colors hover:bg-(--surface-1)"
              style={{
                borderBottom: idx < rankings.length - 1 ? "1px solid rgba(0,0,0,0.05)" : undefined,
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
    </div>
  );
}
