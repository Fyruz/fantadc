"use client";

type ScoreRow = {
  playerId: number;
  playerName: string;
  bonusPoints: number;
  isMvp: boolean;
  mvpPoints: number;
  basePoints: number;
  isCaptain: boolean;
  finalPoints: number;
};

export default function ScoreTable({ rows }: { rows: ScoreRow[] }) {
  return (
    <div className="flex flex-col">
      {rows.map((row) => (
        <div
          key={row.playerId}
          className="flex items-center justify-between gap-3 border-t border-[var(--border-soft)] py-2.5 first:border-t-0"
        >
          <div className="flex min-w-0 items-center gap-1.5">
            {row.isCaptain && (
              <span className="shrink-0 text-[11px] text-amber-500">★</span>
            )}
            <span className="truncate text-sm font-medium text-[var(--text-primary)]">
              {row.playerName}
            </span>
            {row.isMvp && (
              <span className="shrink-0 rounded bg-yellow-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-yellow-700">
                MVP
              </span>
            )}
          </div>
          <span className="shrink-0 text-sm font-bold text-[var(--text-primary)]">
            {row.finalPoints.toFixed(1)}
            {row.isCaptain && row.basePoints !== 0 && (
              <span className="ml-0.5 text-[10px] text-amber-500">×2</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
