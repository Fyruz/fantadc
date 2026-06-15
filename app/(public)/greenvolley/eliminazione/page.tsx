import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";


export default async function VolleyEliminazionePublicPage() {
  const rounds = await db.volleyKnockoutRound.findMany({
    orderBy: { order: "asc" },
    include: {
      matches: {
        where: { status: { not: "DRAFT" } },
        include: {
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          sets: { orderBy: { setNumber: "asc" } },
        },
        orderBy: { date: "asc" },
      },
    },
  });

  const activeRounds = rounds.filter((r) => r.matches.length > 0);

  return (
    <div className="flex flex-col gap-10 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center relative py-2">
        <Link href="/greenvolley" className="absolute left-0 flex items-center justify-center w-6 h-6">
          <img src="/icons/chevron_left.svg" width={24} height={24} alt="Indietro" />
        </Link>
        <h1
          className="uppercase mx-auto font-medium"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          Eliminazione
        </h1>
      </div>

      {activeRounds.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
          Fase ad eliminazione non ancora iniziata.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 pb-3" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
          <div className="flex gap-4" style={{ minWidth: `${activeRounds.length * 220}px` }}>
            {activeRounds.map((round) => (
              <div key={round.id} className="flex flex-col gap-3" style={{ width: 200, flexShrink: 0 }}>

                {/* Round header */}
                <p
                  className="text-xs font-semibold uppercase text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  {round.name}
                </p>

                {/* Match cards */}
                <div className="flex flex-col gap-3">
                  {round.matches.map((m) => {
                    const homeSets = m.sets.filter((s) => s.homePoints > s.awayPoints).length;
                    const awaySets = m.sets.filter((s) => s.awayPoints > s.homePoints).length;
                    const scored = m.status === "CONCLUDED" && m.sets.length > 0;
                    const homeWon = scored && homeSets > awaySets;
                    const awayWon = scored && awaySets > homeSets;

                    return (
                      <Link
                        key={m.id}
                        href={`/greenvolley/partite/${m.id}`}
                        className="block rounded-2xl overflow-hidden bg-white"
                        style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
                      >
                        {/* Home */}
                        <div
                          className="flex items-center justify-between px-3 py-2.5 gap-2"
                          style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}
                        >
                          <span
                            className="text-sm truncate flex-1"
                            style={{ color: homeWon ? "#000" : "rgba(0,0,0,0.45)", fontWeight: homeWon ? 500 : 400 }}
                          >
                            {m.homeTeam.name}
                          </span>
                          {scored && (
                            <span
                              className="text-sm tabular-nums shrink-0"
                              style={{ color: homeWon ? "#000" : "rgba(0,0,0,0.30)", fontWeight: homeWon ? 700 : 400 }}
                            >
                              {homeSets}
                            </span>
                          )}
                        </div>
                        {/* Away */}
                        <div className="flex items-center justify-between px-3 py-2.5 gap-2">
                          <span
                            className="text-sm truncate flex-1"
                            style={{ color: awayWon ? "#000" : "rgba(0,0,0,0.45)", fontWeight: awayWon ? 500 : 400 }}
                          >
                            {m.awayTeam.name}
                          </span>
                          {scored && (
                            <span
                              className="text-sm tabular-nums shrink-0"
                              style={{ color: awayWon ? "#000" : "rgba(0,0,0,0.30)", fontWeight: awayWon ? 700 : 400 }}
                            >
                              {awaySets}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
