import { db } from "@/lib/db";
import Link from "next/link";
import { computeVolleyStandings } from "@/lib/volley/standings";

export default async function GreenVolleyHomePage() {
  const [nextMatches, groups] = await Promise.all([
    db.volleyMatch.findMany({
      where: { status: "SCHEDULED" },
      orderBy: { date: "asc" },
      take: 4,
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        group: { select: { name: true } },
      },
    }),
    db.volleyGroup.findMany({
      orderBy: { name: "asc" },
      include: {
        teams: { include: { team: { select: { id: true, name: true } } } },
        matches: {
          where: { status: "CONCLUDED" },
          include: { sets: true },
        },
      },
    }),
  ]);

  return (
    <div>

      {/* Header */}
      <div className="mt-4 mb-10">
        <div className="over-label mb-1">Campionato</div>
        <h1 className="text-3xl uppercase" style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}>
          GREEN<span style={{ color: "var(--primary)" }}>VOLLEY</span>
        </h1>
      </div>

      {/* Prossime partite */}
      {nextMatches.length > 0 && (
        <div className="my-10">
          <div className="flex items-center justify-between mb-6">
            <div
              className="uppercase text-(--text-primary) text-xl leading-8.5 font-medium flex items-center gap-1"
              style={{ fontFamily: "var(--font-tallica)" }}
            >
              <span>Prossime</span>
              <span>partite</span>
            </div>
            <Link
              href="/greenvolley/partite"
              className="inline-flex items-center gap-2 text-sm font-semibold text-(--text-primary)"
            >
              Vedi tutto
              <i className="pi pi-chevron-right" style={{ fontSize: 10 }} />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {nextMatches.map((m) => {
              const dateLabel = m.date?.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
              const timeLabel = m.date?.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
              return (
                <Link
                  key={m.id}
                  href={`/greenvolley/partite/${m.id}`}
                  className="bg-white rounded-3xl p-6 flex flex-col gap-4"
                  style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
                >
                  {m.group && (
                    <div className="pb-3" style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}>
                      <span className="text-sm text-black">{m.group.name}</span>
                    </div>
                  )}
                  <div className="flex gap-6 items-center">
                    <div className="flex flex-col gap-3 flex-1 min-w-0 pr-6" style={{ borderRight: "1px solid rgba(9,20,76,0.05)" }}>
                      <span className="text-sm text-black truncate">{m.homeTeam.name}</span>
                      <span className="text-sm text-black truncate">{m.awayTeam.name}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-3 shrink-0">
                      {dateLabel && timeLabel && (
                        <span className="text-sm text-black capitalize">{dateLabel}{" · "}{timeLabel}</span>
                      )}
                      <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>Vedi i dettagli</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Classifiche rapide per girone */}
      {groups.length > 0 && (
        <div className="">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="uppercase text-xl font-medium text-(--text-primary)"
              style={{ fontFamily: "var(--font-tallica)" }}
            >
              Classifica
            </h2>
            <Link
              href="/greenvolley/classifica"
              className="inline-flex items-center gap-2 text-sm font-semibold text-(--text-primary)"
            >
              Vedi tutto
              <i className="pi pi-chevron-right" style={{ fontSize: 10 }} />
            </Link>
          </div>

          <div
            className="flex gap-4 overflow-x-auto -mx-4 px-4 py-3 -my-3 md:grid md:grid-cols-2 md:overflow-visible md:mx-0 md:px-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
          >
            {groups.map((group) => {
              const teamList = group.teams.map((gt) => gt.team);
              const matches = group.matches.map((m) => ({
                homeTeamId: m.homeTeamId,
                awayTeamId: m.awayTeamId,
                status: m.status,
                sets: m.sets,
              }));
              const standings = computeVolleyStandings(teamList, matches).slice(0, 4);

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-3xl overflow-hidden pb-3 shrink-0 w-90 md:w-auto"
                  style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
                >
                  <div className="px-6 pt-6 pb-3">
                    <p
                      className="uppercase text-base font-medium text-(--text-primary)"
                      style={{ fontFamily: "var(--font-tallica)", wordSpacing: "0.3em" }}
                    >
                      {group.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 px-6 pb-3">
                    <span className="text-xs font-semibold uppercase text-black/65 w-5 shrink-0">POS</span>
                    <span className="text-xs font-semibold uppercase text-black/65 flex-1">SQUADRA</span>
                    <span className="text-xs font-semibold uppercase text-black/65 w-6 text-center shrink-0">G</span>
                    <span className="text-xs font-semibold uppercase text-black/65 w-5 text-right shrink-0">PT</span>
                  </div>

                  {standings.map((row, i) => (
                    <div
                      key={row.teamId}
                      className="flex items-center gap-4 px-6"
                      style={{ borderTop: "1px solid rgba(9,20,76,0.05)", paddingTop: 12, paddingBottom: 12 }}
                    >
                      <span className="text-xs text-black w-5 shrink-0 tabular-nums">{i + 1}</span>
                      <span className="text-sm font-normal text-black flex-1 truncate">{row.teamName}</span>
                      <span className="text-sm text-black w-6 text-center shrink-0 tabular-nums">{row.played}</span>
                      <span className="text-sm font-bold text-black w-5 text-right shrink-0 tabular-nums">{row.setsWon}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

