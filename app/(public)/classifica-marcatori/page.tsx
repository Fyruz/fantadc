import BackButton from "@/components/back-button";
import Link from "next/link";
import { db } from "@/lib/db";
import { getFlagUrlFromCountryCode } from "@/lib/flags";
export const dynamic = 'force-dynamic'


export const metadata = { title: "Capocannoniere" };

export default async function ClassificaMarcatoriPage() {
  const [players, goals] = await Promise.all([
    db.player.findMany({
      select: {
        id: true,
        name: true,
        footballTeam: {
          select: {
            name: true,
            shortName: true,
            countryCode: true,
            logoUrl: true,
          },
        },
      },
    }),
    db.matchGoal.findMany({
      select: { scorerId: true, isOwnGoal: true },
    }),
  ]);

  const goalMap = new Map<number, number>();
  for (const g of goals) {
    if (!g.isOwnGoal) {
      goalMap.set(g.scorerId, (goalMap.get(g.scorerId) ?? 0) + 1);
    }
  }

  const ranked = players
    .map((p) => ({ ...p, goals: goalMap.get(p.id) ?? 0 }))
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name, "it"));

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Header mobile */}
      <div className="md:hidden flex items-center justify-between h-12">
        <div className="flex-1 flex items-center">
          <BackButton />
        </div>
        <span
          className="flex-1 text-center uppercase"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "#09144C" }}
        >
          Capocannoniere
        </span>
        <div className="flex-1" />
      </div>

      {ranked.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
          Nessun gol segnato.
        </p>
      ) : (
        <div className="flex flex-col">
          {ranked.map((p, idx) => {
            const flagSrc = p.footballTeam.logoUrl ?? getFlagUrlFromCountryCode(p.footballTeam.countryCode);
            return (
              <div
                key={p.id}
                className={`flex gap-4 items-center pb-3${idx === 0 ? "" : " pt-3"}`}
                style={idx < ranked.length - 1 ? { borderBottom: "1px solid rgba(0,0,0,0.05)" } : undefined}
              >
                {/* Rank */}
                <span className="text-xs text-black shrink-0">{idx + 1}</span>

                {/* Logo + name */}
                <div className="flex flex-1 gap-3 items-center min-w-0">
                  <div className="w-9 h-9 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    {flagSrc ? (
                      <img src={flagSrc} alt={p.footballTeam.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] font-black uppercase" style={{ color: "var(--primary)" }}>
                        {(p.footballTeam.shortName ?? p.footballTeam.name).slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-[14px] text-black truncate">{p.name}</span>
                </div>

                {/* Goals */}
                <span className="text-[14px] font-semibold text-black shrink-0">{p.goals}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
