const CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  P: { label: "P", bg: "bg-green-100", text: "text-green-700" },
  A: { label: "A", bg: "bg-blue-100",  text: "text-blue-700"  },
};

export default function RoleBadge({ role }: { role: string }) {
  const cfg = CONFIG[role] ?? { label: role, bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}
