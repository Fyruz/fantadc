
import { db } from "@/lib/db";
import Link from "next/link";
import { computeVolleyStandings } from "@/lib/volley/standings";

export default async function VolleyGironiPage() {
  const groups = await db.volleyGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      teams: {
        include: { team: { select: { id: true, name: true } } },
        orderBy: { team: { name: "asc" } },
      },
      matches: {
        where: { status: "CONCLUDED" },
        include: { sets: true },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center relative py-2">
        <Link href="/greenvolley" className="absolute left-0 flex items-center justify-center w-6 h-6">
          <img src="/icons/chevron_left.svg" width={24} height={24} alt="Indietro" />
        </Link>
        <h1
          className="uppercase mx-auto font-medium"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          Gironi
        </h1>
      </div>

      {groups.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
          Nessun girone disponibile.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => {
          const teamList = group.teams.map((gt) => gt.team);
          const matches = group.matches.map((m) => ({
            homeTeamId: m.homeTeamId,
            awayTeamId: m.awayTeamId,
            status: m.status,
            sets: m.sets,
          }));
          const standings = computeVolleyStandings(teamList, matches);

          return (
            <div
              key={group.id}
              className="bg-white rounded-3xl overflow-hidden pb-3"
              style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
            >
              {/* Card header */}
              <div className="px-6 pt-6 pb-3">
                <p
                  className="uppercase text-base font-medium"
                  style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)", wordSpacing: "0.3em" }}
                >
                  {group.name}
                </p>
              </div>

              {/* Table header */}
              <div className="flex items-center gap-4 px-6 pb-3">
                <span className="text-xs font-semibold uppercase text-black/65 w-5 shrink-0">POS</span>
                <span className="text-xs font-semibold uppercase text-black/65 flex-1">SQUADRA</span>
                <span className="text-xs font-semibold uppercase text-black/65 w-6 text-center shrink-0">G</span>
                <span className="text-xs font-semibold uppercase text-black/65 w-5 text-right shrink-0">PT</span>
              </div>

              {/* Rows */}
              {standings.length === 0 ? (
                <p className="px-6 py-3 text-xs" style={{ color: "var(--text-muted)", borderTop: "1px solid rgba(9,20,76,0.05)" }}>
                  Nessuna squadra.
                </p>
              ) : (
                standings.map((row, i) => {
                  const qualified = group.teams.find((gt) => gt.teamId === row.teamId)?.qualified;
                  return (
                    <div
                      key={row.teamId}
                      className="flex items-center gap-4 px-6"
                      style={{ borderTop: "1px solid rgba(9,20,76,0.05)", paddingTop: 12, paddingBottom: 12 }}
                    >
                      <span className="text-xs text-black w-5 shrink-0 tabular-nums">{i + 1}</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm text-black truncate">{row.teamName}</span>
                        {qualified && (
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                          >
                            Q
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-black w-6 text-center shrink-0 tabular-nums">{row.played}</span>
                      <span className="text-sm font-bold text-black w-5 text-right shrink-0 tabular-nums">{row.setsWon}</span>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
