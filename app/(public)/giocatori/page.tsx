import { db } from "@/lib/db";

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
    <div>
      <h1 className="text-2xl font-bold mb-6">Giocatori</h1>
      {byTeam.size === 0 && <p className="text-zinc-400">Nessun giocatore presente.</p>}
      <div className="flex flex-col gap-6">
        {[...byTeam.entries()].map(([teamName, teamPlayers]) => (
          <div key={teamName}>
            <h2 className="font-semibold text-sm uppercase tracking-wide mb-2 text-zinc-500 border-b pb-1">
              {teamName}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {teamPlayers.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2">
                  <span
                    className="text-xs font-bold rounded px-1 py-0.5 text-white"
                    style={{ backgroundColor: p.role === "GK" ? "#ca8a04" : "var(--primary)" }}
                  >
                    {p.role}
                  </span>
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
