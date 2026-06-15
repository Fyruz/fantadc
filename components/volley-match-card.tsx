import Link from "next/link";
import { formatVolleyMatchTime, formatVolleyDayPill, formatVolleyDate } from "@/lib/volley/format";

const CARD: React.CSSProperties = {
  border: "1px solid rgba(9,20,76,0.05)",
  boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)",
};

type Props = {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeSets: number | null;
  awaySets: number | null;
  label: string | null;
  date: Date | null;
  status: string;
  showHeaderDate?: boolean;
  showDateWithTime?: boolean;
};

export default function VolleyMatchCard({
  id,
  homeTeam,
  awayTeam,
  homeSets,
  awaySets,
  label,
  date,
  status,
  showHeaderDate = false,
  showDateWithTime = false,
}: Props) {
  const concluded = status === "CONCLUDED";
  const scored = concluded && homeSets !== null && awaySets !== null;
  const time = date ? formatVolleyMatchTime(date) : null;
  const headerDate = showHeaderDate && date ? formatVolleyDate(date) : null;

  let rightText: string | null = null;
  if (concluded) {
    rightText = "Fischio finale";
  } else if (showDateWithTime && date) {
    rightText = time ? `${formatVolleyDayPill(date)} · ${time}` : formatVolleyDayPill(date);
  } else {
    rightText = time;
  }

  const showHeader = !!(label || headerDate);

  return (
    <Link
      href={`/greenvolley/partite/${id}`}
      className="bg-white rounded-3xl p-6 flex flex-col gap-4"
      style={CARD}
    >
      {showHeader && (
        <div
          className="flex items-center justify-between pb-3"
          style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}
        >
          {label && <span className="text-sm text-black">{label}</span>}
          {headerDate && <span className="text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>{headerDate}</span>}
        </div>
      )}

      <div className="flex gap-6 items-center">
        <div
          className="flex flex-col gap-3 flex-1 min-w-0 pr-6"
          style={{ borderRight: "1px solid rgba(9,20,76,0.05)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-black flex-1 truncate">{homeTeam}</span>
            {scored && (
              <span className="text-sm font-semibold shrink-0" style={{ color: "var(--primary)" }}>
                {homeSets}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-black flex-1 truncate">{awayTeam}</span>
            {scored && (
              <span className="text-sm font-semibold shrink-0" style={{ color: "var(--primary)" }}>
                {awaySets}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 shrink-0">
          {rightText && (
            <span
              className="text-sm capitalize text-center"
              style={{ color: concluded ? "rgba(0,0,0,0.55)" : "var(--text-primary)" }}
            >
              {rightText}
            </span>
          )}
          <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
            Vedi i dettagli
          </span>
        </div>
      </div>
    </Link>
  );
}
