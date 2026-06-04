import { db } from "@/lib/db";
import { Tag } from "primereact/tag";

export default async function VolleyGironiPage() {
  const groups = await db.volleyGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      teams: {
        include: { team: { select: { id: true, name: true } } },
        orderBy: { team: { name: "asc" } },
      },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <h1
        className="font-display font-black text-2xl uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Gironi
      </h1>

      {groups.length === 0 && (
        <div className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun girone disponibile.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border-soft)" }}
          >
            {/* Header */}
            <div
              className="px-4 py-3"
              style={{ background: "#f0fde7" }}
            >
              <h2
                className="text-sm font-black uppercase tracking-wide"
                style={{ color: "#3DD907", wordSpacing: "0.3em" }}
              >
                {group.name}
              </h2>
            </div>

            {/* Teams List */}
            <div>
              {group.teams.length === 0 ? (
                <div
                  className="px-4 py-6 text-center text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Nessuna squadra in questo girone.
                </div>
              ) : (
                group.teams.map((gt, i) => (
                  <div
                    key={gt.teamId}
                    className="flex items-center justify-between px-4 py-3"
                    style={{
                      borderTop: i > 0 ? "1px solid var(--border-soft)" : "none",
                    }}
                  >
                    <span className="font-semibold text-sm">{gt.team.name}</span>
                    {gt.qualified && (
                      <Tag
                        value="Qualificata"
                        severity="success"
                        style={{ fontSize: "0.7rem" }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
