import Link from "next/link";
import { resolveTeamFlag } from "@/lib/flags";
import { type GroupStandingRow } from "@/lib/standings";

const COLS: { key: keyof GroupStandingRow; label: string }[] = [
  { key: "played",   label: "PG" },
  { key: "won",      label: "V"  },
  { key: "drawn",    label: "N"  },
  { key: "lost",     label: "S"  },
  { key: "goalDiff", label: "DR" },
  { key: "points",   label: "PT" },
];

type Props = {
  group: { id: number; name: string; rows: GroupStandingRow[] };
  highlightTeamId?: number;
};

export default function GroupStandingCard({ group, highlightTeamId }: Props) {
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden pb-3"
      style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
    >
      <div className="px-6 pt-6 pb-3">
        <h2
          className="uppercase text-base font-medium text-(--text-primary)"
          style={{ fontFamily: "var(--font-tallica)", wordSpacing: "0.3em" }}
        >
          {group.name}
        </h2>
      </div>

      <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <div className="min-w-max">
        {/* Header */}
        <div className="flex items-center gap-2 px-6 pb-3">
          <span className="text-xs font-semibold uppercase text-black/40 w-5 shrink-0" />
          <span className="text-xs font-semibold uppercase text-black/40 w-26 shrink-0">SQUADRA</span>
          {COLS.map((c) => (
            <span key={c.key as string} className="text-xs font-semibold uppercase text-black/40 w-7 text-center shrink-0">
              {c.label}
            </span>
          ))}
        </div>

        {/* Rows */}
        {group.rows.map((row, idx) => {
          const flag = resolveTeamFlag(row);
          const isHighlighted = highlightTeamId === row.teamId;
          return (
            <Link
              key={row.teamId}
              href={`/squadre/${row.teamId}`}
              className="flex items-center gap-2 px-6 py-3"
              style={{
                borderTop: "1px solid rgba(9,20,76,0.05)",
                background: isHighlighted ? "rgba(1,7,163,0.04)" : undefined,
              }}
            >
              <span className="text-xs text-black/40 w-5 shrink-0 tabular-nums">{idx + 1}</span>
              <div className="flex items-center gap-2 w-26 shrink-0 min-w-0">
                {flag && <img src={flag} alt={row.name} width={24} height={16} className="shrink-0" />}
                <span className="text-sm font-normal text-black truncate">{row.shortName ?? row.name}</span>
                {row.qualified && (
                  <span className="text-[10px] font-semibold shrink-0" style={{ color: "#10B981" }}>Q</span>
                )}
              </div>
              {COLS.map((c) => {
                const val = row[c.key] as number;
                const display = c.key === "goalDiff" && val > 0 ? `+${val}` : val;
                return (
                  <span
                    key={c.key as string}
                    className="text-sm w-7 text-center shrink-0 tabular-nums text-black"
                    style={{ fontWeight: c.key === "points" ? 700 : 400 }}
                  >
                    {display}
                  </span>
                );
              })}
            </Link>
          );
        })}
      </div>
      </div>
    </div>
  );
}
