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
      <div>
        <div className="over-label mb-1">Stagione 2025</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          GIOCATORI
        </h1>
      </div>
      {byTeam.size === 0 && (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun giocatore presente.
        </div>
      )}
      {[...byTeam.entries()].map(([teamName, teamPlayers]) => (
        <div key={teamName} className="card overflow-hidden">
          <div className="px-4 py-2 border-b" style={{ borderColor: "var(--border-soft)", background: "var(--surface-1)" }}>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              {teamName}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3">
            {teamPlayers.map((p, index) => (
              <div
                key={p.id}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm border-b`}
                style={{
                  borderColor: "var(--border-soft)",
                  background: index % 2 !== 0 ? "var(--surface-1)" : undefined,
                }}
              >
                <RoleBadge role={p.role} />
                <span className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
