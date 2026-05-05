import { db } from "@/lib/db";

export default async function VolleyGiocatoriPublicPage() {
  const players = await db.volleyPlayer.findMany({
    orderBy: [{ team: { name: "asc" } }, { name: "asc" }],
    include: { team: { select: { id: true, name: true } } },
  });

  // Raggruppa per squadra
  const byTeam = new Map<string, { teamName: string; players: typeof players }>();
  for (const p of players) {
    const key = p.team.name;
    if (!byTeam.has(key)) byTeam.set(key, { teamName: key, players: [] });
    byTeam.get(key)!.players.push(p);
  }
  const groups = Array.from(byTeam.values());

  return (
    <div className="flex flex-col gap-6">
      <h1
        className="font-display font-black text-2xl uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Giocatori
      </h1>

      {players.length === 0 && (
        <div className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun giocatore disponibile.
        </div>
      )}

      {groups.map((group) => (
        <div key={group.teamName}>
          <div
            className="text-[10px] font-black uppercase tracking-widest mb-2"
            style={{ color: "#3DD907" }}
          >
            {group.teamName}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {group.players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border-soft)" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                  style={{ background: "#f0fde7", color: "#3DD907" }}
                >
                  {p.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <span className="text-sm font-semibold truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
