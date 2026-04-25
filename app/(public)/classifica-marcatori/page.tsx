import { db } from "@/lib/db";

export const metadata = { title: "Classifica Marcatori" };

export default async function ClassificaMarcatoriPage() {
  const [players, goals] = await Promise.all([
    db.player.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        footballTeam: { select: { name: true, shortName: true } },
      },
    }),
    db.matchGoal.findMany({
      select: { scorerId: true, isOwnGoal: true },
    }),
  ]);

  const goalMap = new Map<number, number>();
  const ownGoalMap = new Map<number, number>();
  for (const g of goals) {
    if (g.isOwnGoal) {
      ownGoalMap.set(g.scorerId, (ownGoalMap.get(g.scorerId) ?? 0) + 1);
    } else {
      goalMap.set(g.scorerId, (goalMap.get(g.scorerId) ?? 0) + 1);
    }
  }

  const ranked = players
    .map((p) => ({
      ...p,
      goals: goalMap.get(p.id) ?? 0,
      ownGoals: ownGoalMap.get(p.id) ?? 0,
    }))
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name, "it"));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="over-label mb-1">DCUP 26</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          Marcatori
        </h1>
      </div>

      {ranked.length === 0 ? (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun gol segnato.
        </div>
      ) : (
        <div className="card overflow-hidden">
          {ranked.map((p, idx) => {
            const prev = ranked[idx - 1];
            const rank = prev && prev.goals === p.goals ? null : idx + 1;
            const isFirst = p.goals === ranked[0].goals;
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: idx < ranked.length - 1 ? "1px solid var(--border-soft)" : undefined }}
              >
                {/* Rank */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-display font-black text-sm flex-shrink-0"
                  style={
                    isFirst
                      ? { background: "linear-gradient(135deg,#E8A000,#C87800)", color: "#fff" }
                      : { background: "var(--surface-1)", color: "var(--text-muted)" }
                  }
                >
                  {rank ?? "–"}
                </div>

                {/* Role badge */}
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black flex-shrink-0"
                  style={
                    p.role === "P"
                      ? { background: "rgba(232,160,0,0.12)", color: "#C87800" }
                      : { background: "rgba(1,7,163,0.08)", color: "var(--primary)" }
                  }
                >
                  {p.role}
                </div>

                {/* Name + team */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {p.name}
                  </div>
                  <div className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                    {p.footballTeam.shortName ?? p.footballTeam.name}
                  </div>
                </div>

                {/* Goals */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-base">⚽</span>
                  <span className="font-display font-black text-xl tabular-nums" style={{ color: "var(--text-primary)" }}>
                    {p.goals}
                  </span>
                  {p.ownGoals > 0 && (
                    <span className="text-[10px] font-semibold ml-0.5" style={{ color: "var(--text-disabled)" }}>
                      (+{p.ownGoals} AG)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
