import { db } from "@/lib/db";
import RoleBadge from "@/components/role-badge";

export default async function GiocatoriPublicPage() {
  const players = await db.player.findMany({
    orderBy: [{ footballTeam: { name: "asc" } }, { role: "asc" }, { name: "asc" }],
    include: { footballTeam: { select: { name: true, shortName: true } } },
  });

  const byTeam = new Map<string, typeof players>();
  for (const p of players) {
    const team = p.footballTeam.name;
    const arr = byTeam.get(team) ?? [];
    arr.push(p);
    byTeam.set(team, arr);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Giocatori</h1>
      {byTeam.size === 0 && (
        <div className="admin-card p-8 text-center text-[#6B7280] text-sm">
          Nessun giocatore presente.
        </div>
      )}
      {[...byTeam.entries()].map(([teamName, teamPlayers]) => (
        <div key={teamName} className="admin-card overflow-hidden">
          <div className="px-4 py-2 border-b border-[#F3F4F6] bg-[#F8F9FC]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              {teamName}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3">
            {teamPlayers.map((p, index) => (
              <div
                key={p.id}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm border-b border-[#F3F4F6] ${
                  index % 2 !== 0 ? "bg-[#FAFAFA]" : ""
                }`}
              >
                <RoleBadge role={p.role} />
                <span className="font-medium text-[#111827] truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
