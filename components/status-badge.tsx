type MatchStatus = "DRAFT" | "SCHEDULED" | "CONCLUDED" | "PUBLISHED";

const CONFIG: Record<MatchStatus, { label: string; dot: string; bg: string; text: string }> = {
  DRAFT:     { label: "Bozza",        dot: "bg-gray-400",    bg: "bg-gray-100",   text: "text-gray-600"   },
  SCHEDULED: { label: "Programmata",  dot: "bg-blue-500",    bg: "bg-blue-50",    text: "text-blue-700"   },
  CONCLUDED: { label: "Conclusa",     dot: "bg-amber-500",   bg: "bg-amber-50",   text: "text-amber-700"  },
  PUBLISHED: { label: "Pubblicata",   dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = CONFIG[status as MatchStatus] ?? CONFIG.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
