import { db } from "@/lib/db";
import Link from "next/link";
import StatusBadge from "@/components/status-badge";
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
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          GREEN<span style={{ color: "var(--primary)" }}>VOLLEY</span>
        </h1>
      </div>

      {/* Prossima partita */}
      <div>
        <div className="over-label mb-2">Prossima partita</div>
        {nextMatch ? (
          <Link
            href={`/greenvolley/partite/${nextMatch.id}`}
            className="block rounded-[20px] overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "#fff",
              border: "1.5px solid var(--border-medium)",
              boxShadow: "0 2px 12px rgba(21,128,61,0.07)",
            }}
          >
            {/* Top bar */}
            <div
              className="flex items-center justify-between px-4 py-2.5 gap-2"
              style={{ borderBottom: "1px solid var(--border-soft)" }}
            >
              <StatusBadge status={nextMatch.status} />
              {nextMatch.date && (
                <span className="text-[11px] font-semibold capitalize flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                  {nextMatch.date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })}
                </span>
              )}
            </div>

            {/* Body */}
            <div className="px-4 py-5 flex items-center gap-2">
              <div className="flex-1 flex flex-col items-center min-w-0 text-center">
                <span className="font-display font-black text-2xl uppercase leading-none tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {nextMatch.homeTeam.name}
                </span>
              </div>
              <div className="flex-shrink-0 flex flex-col items-center gap-1 px-2">
                <span className="font-display font-black text-xl leading-none" style={{ color: "var(--primary)" }}>
                  VS
                </span>
                {nextMatch.date && (
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {nextMatch.date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
                  </span>
                )}
              </div>
              <div className="flex-1 flex flex-col items-center min-w-0 text-center">
                <span className="font-display font-black text-2xl uppercase leading-none tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {nextMatch.awayTeam.name}
                </span>
              </div>
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
