type MatchStatus = "DRAFT" | "SCHEDULED" | "CONCLUDED" | "PUBLISHED";

const CONFIG: Record<MatchStatus, { label: string; className: string }> = {
  DRAFT:     { label: "Bozza",       className: "badge-draft"     },
  SCHEDULED: { label: "Programmata", className: "badge-scheduled" },
  CONCLUDED: { label: "Conclusa",    className: "badge-concluded" },
  PUBLISHED: { label: "Pubblicata",  className: "badge-published" },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = CONFIG[status as MatchStatus] ?? CONFIG.DRAFT;
  return <span className={cfg.className}>{cfg.label}</span>;
}
