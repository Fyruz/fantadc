import { db } from "@/lib/db";
import Link from "next/link";
import { computeVolleyStandings } from "@/lib/volley/standings";

export default async function GreenVolleyHomePage() {
  const [nextMatch, groups] = await Promise.all([
    db.volleyMatch.findFirst({
      where: { status: "SCHEDULED" },
      orderBy: { date: "asc" },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="over-label mb-1">Campionato</div>
        <h1 className="text-3xl uppercase" style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}>
          GREEN<span style={{ color: "var(--primary)" }}>VOLLEY</span>
        </h1>
      </div>

      {/* Prossima partita */}
      <div>
        <div className="over-label mb-2">Prossima partita</div>
        {nextMatch ? (
          <Link
            href={`/greenvolley/partite/${nextMatch.id}`}
            className="bg-white rounded-3xl p-6 flex gap-6 items-center block"
            style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
          >
            <div className="flex flex-col gap-3 flex-1 min-w-0 pr-6" style={{ borderRight: "1px solid rgba(9,20,76,0.05)" }}>
              <span className="text-sm text-black truncate">{nextMatch.homeTeam.name}</span>
              <span className="text-sm text-black truncate">{nextMatch.awayTeam.name}</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 shrink-0 text-center">
              {nextMatch.date && (
                <span className="text-xs text-black capitalize">
                  {nextMatch.date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })}
                  {" · "}
                  {nextMatch.date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
                </span>
              )}
              <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>Vedi i dettagli</span>
            </div>
          </Link>
        ) : (
          <div className="card p-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Nessuna partita programmata.
          </div>
        )}
      </div>

      {/* Classifiche rapide per girone */}
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
            className="bg-white rounded-3xl overflow-hidden pb-2"
            style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between gap-2 px-6 pt-6 pb-3">
              <h2
                className="uppercase text-base font-medium"
                style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)", wordSpacing: "0.3em" }}
              >
                {group.name}
              </h2>
              <Link href="/greenvolley/classifica" className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--primary)" }}>
                Vedi tutto →
              </Link>
            </div>

            {/* Table header */}
            <div
              className="grid grid-cols-[1fr_36px_36px] px-6 pb-3 text-xs font-semibold uppercase"
              style={{ color: "rgba(0,0,0,0.40)" }}
            >
              <span>Squadra</span>
              <span className="text-center">G</span>
              <span className="text-center" style={{ color: "var(--primary)" }}>Pt</span>
            </div>

            {standings.map((row, i) => (
              <div
                key={row.teamId}
                className="grid grid-cols-[1fr_36px_36px] px-6 py-2.5 text-sm items-center"
                style={{ borderTop: "1px solid rgba(9,20,76,0.05)" }}
              >
                <span className="truncate" style={{ color: "var(--text-primary)" }}>
                  {i + 1}. {row.teamName}
                </span>
                <span className="text-center text-xs tabular-nums" style={{ color: "rgba(0,0,0,0.40)" }}>
                  {row.played}
                </span>
                <span className="text-center text-sm font-bold tabular-nums" style={{ color: "var(--primary)" }}>
                  {row.setsWon}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
