"use client";

type RosterRow = {
  id: number;
  name: string;
  role: string;
  footballTeamName: string;
  isCaptain: boolean;
  totalPoints?: number;
};

export default function RosterTable({ rows }: { rows: RosterRow[] }) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3"
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[9px] font-black uppercase tracking-wide ${
              row.role === "P"
                ? "bg-amber-100 text-amber-700"
                : "bg-[var(--surface-1)] text-[var(--text-muted)]"
            }`}
          >
            {row.role === "P" ? "POR" : "ATT"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {row.isCaptain && (
                <span className="text-[11px] text-amber-500">★</span>
              )}
              <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {row.name}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">
              {row.footballTeamName}
            </span>
          </div>
          {row.totalPoints !== undefined && (
            <span className="shrink-0 font-display text-sm font-black tabular-nums" style={{ color: "var(--primary)" }}>
              {row.totalPoints.toFixed(1)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
