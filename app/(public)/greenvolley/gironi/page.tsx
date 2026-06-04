import { db } from "@/lib/db";

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
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">GreenVolley</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          GIRONI
        </h1>
      </div>

      {groups.length === 0 && (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun girone disponibile.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-3xl overflow-hidden pb-2"
            style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
          >
            {/* Card header */}
            <div className="px-6 pt-6 pb-3">
              <h2
                className="uppercase text-base font-medium"
                style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)", wordSpacing: "0.3em" }}
              >
                {group.name}
              </h2>
            </div>

            {/* Teams list */}
            {group.teams.length === 0 ? (
              <div className="px-6 py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                Nessuna squadra in questo girone.
              </div>
            ) : (
              group.teams.map((gt) => (
                <div
                  key={gt.teamId}
                  className="flex items-center justify-between gap-2 px-6 py-3"
                  style={{ borderTop: "1px solid rgba(9,20,76,0.05)" }}
                >
                  <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {gt.team.name}
                  </span>
                  {gt.qualified && (
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 uppercase tracking-wide"
                      style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                    >
                      Qualificata
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
