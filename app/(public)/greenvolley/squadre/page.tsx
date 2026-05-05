import { db } from "@/lib/db";

export default async function VolleySquadrePublicPage() {
  const teams = await db.volleyTeam.findMany({
    orderBy: { name: "asc" },
    include: {
      players: { orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1
        className="font-display font-black text-2xl uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Squadre
      </h1>

      {teams.length === 0 && (
        <div className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
          Nessuna squadra disponibile.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border-soft)" }}
          >
            {/* Team header */}
            <div
              className="px-4 py-3 flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, #0d1f0d 0%, #1a3a1a 100%)",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                style={{ background: "#3DD907", color: "#fff" }}
              >
                🏐
              </div>
              <span className="font-black text-base text-white">{team.name}</span>
              <span
                className="ml-auto text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {team.players.length} giocatori
              </span>
            </div>

            {/* Players */}
            {team.players.length === 0 ? (
              <div className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                Nessun giocatore
              </div>
            ) : (
              <div>
                {team.players.map((p, i) => (
                  <div
                    key={p.id}
                    className="px-4 py-2.5 flex items-center gap-3"
                    style={{
                      borderBottom:
                        i < team.players.length - 1
                          ? "1px solid var(--border-soft)"
                          : "none",
                    }}
                  >
                    <span className="font-semibold text-sm">{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
