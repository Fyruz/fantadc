const CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  P: { label: "P", bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
  A: { label: "A", bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE" },
};

export default function RoleBadge({ role }: { role: string }) {
  const cfg = CONFIG[role] ?? { label: role, bg: "var(--surface-1)", color: "var(--text-muted)", border: "var(--border-medium)" };
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}
