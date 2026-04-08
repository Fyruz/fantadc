import { db } from "@/lib/db";
import RoleBadge from "@/components/role-badge";

export default async function SquadrePublicPage() {
  const teams = await db.footballTeam.findMany({
    orderBy: { name: "asc" },
    include: {
      players: {
        orderBy: [{ role: "asc" }, { name: "asc" }],
      },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="over-label mb-1">Stagione 2025</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          SQUADRE REALI
        </h1>
      </div>

      {teams.length === 0 && (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessuna squadra presente.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {teams.map((team) => (
          <details
            key={team.id}
            className="card overflow-hidden group"
          >
            <summary className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-[var(--surface-1)] transition-colors">
              {/* Avatar */}
              {team.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={team.logoUrl} alt={team.name} className="w-8 h-8 object-contain flex-shrink-0" />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs flex-shrink-0"
                  style={{ background: "var(--primary)" }}
                >
                  {team.shortName ?? team.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              {/* Name */}
              <span className="font-display font-black text-sm uppercase flex-1 leading-tight" style={{ color: "var(--text-primary)" }}>
                {team.name}
              </span>

              {/* Count */}
              <span className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                {team.players.length} {team.players.length === 1 ? "giocatore" : "giocatori"}
              </span>

              {/* Chevron */}
              <i
                className="pi pi-chevron-down text-xs flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                style={{ color: "var(--text-disabled)" }}
              />
            </summary>

            {/* Player list */}
            {team.players.length === 0 ? (
              <div
                className="px-4 py-4 text-sm text-center"
                style={{ borderTop: "1px solid var(--border-soft)", color: "var(--text-muted)" }}
              >
                Nessun giocatore in rosa.
              </div>
            ) : (
              <div style={{ borderTop: "1px solid var(--border-soft)" }}>
                {team.players.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 px-4 py-2.5"
                    style={{ borderBottom: idx < team.players.length - 1 ? "1px solid var(--border-soft)" : undefined }}
                  >
                    <RoleBadge role={p.role} />
                    <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}
