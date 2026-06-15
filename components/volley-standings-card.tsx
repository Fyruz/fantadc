import type { VolleyStandingRow } from "@/lib/volley/standings";

const CARD: React.CSSProperties = {
  border: "1px solid rgba(9,20,76,0.05)",
  boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)",
};

type Props = {
  name: string;
  rows: VolleyStandingRow[];
  highlightTeamId?: number;
  qualifiedIds?: number[];
  compact?: boolean;
  className?: string;
};

const FULL_COLS: { key: keyof VolleyStandingRow; label: string }[] = [
  { key: "played",   label: "G"  },
  { key: "setsWon",  label: "SV" },
  { key: "setsLost", label: "SP" },
];

const COMPACT_COLS: { key: keyof VolleyStandingRow; label: string }[] = [
  { key: "played", label: "G" },
];

export default function VolleyStandingsCard({
  name,
  rows,
  highlightTeamId,
  qualifiedIds,
  compact = false,
  className,
}: Props) {
  const qualified = new Set(qualifiedIds ?? []);
  const cols = compact ? COMPACT_COLS : FULL_COLS;

  return (
    <div
      className={`bg-white rounded-3xl overflow-hidden pb-3${className ? ` ${className}` : ""}`}
      style={CARD}
    >
      <div className="px-6 pt-6 pb-3">
        <p
          className="uppercase text-base font-medium"
          style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)", wordSpacing: "0.3em" }}
        >
          {name}
        </p>
      </div>

      <div className="flex items-center gap-2 px-6 pb-3">
        <span className="text-xs font-semibold uppercase text-black/40 w-5 shrink-0">Pos</span>
        <span className="text-xs font-semibold uppercase text-black/40 flex-1">Squadra</span>
        {cols.map((c) => (
          <span key={c.key as string} className="text-xs font-semibold uppercase text-black/40 w-7 text-center shrink-0">
            {c.label}
          </span>
        ))}
        <span className="text-xs font-semibold uppercase w-7 text-center shrink-0" style={{ color: "var(--primary)" }}>
          Pt
        </span>
      </div>

      {rows.map((row, idx) => {
        const isHighlighted = highlightTeamId === row.teamId;
        const isQualified = qualified.has(row.teamId);
        return (
          <div
            key={row.teamId}
            className="flex items-center gap-2 px-6 py-3"
            style={{
              borderTop: "1px solid rgba(9,20,76,0.05)",
              background: isHighlighted ? "rgba(1,7,163,0.04)" : undefined,
            }}
          >
            <span className="text-xs text-black/40 w-5 shrink-0 tabular-nums">{idx + 1}</span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className={`text-sm truncate text-black${isHighlighted ? " font-semibold" : " font-normal"}`}>
                {row.teamName}
              </span>
              {isQualified && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                >
                  Q
                </span>
              )}
            </div>
            {cols.map((c) => (
              <span key={c.key as string} className="text-sm w-7 text-center shrink-0 tabular-nums text-black">
                {row[c.key] as number}
              </span>
            ))}
            <span className="text-sm w-7 text-center shrink-0 tabular-nums font-bold" style={{ color: "var(--primary)" }}>
              {row.setsWon}
            </span>
          </div>
        );
      })}
    </div>
  );
}
