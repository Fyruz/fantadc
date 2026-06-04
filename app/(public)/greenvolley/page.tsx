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
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "linear-gradient(135deg, #0d1f0d 0%, #1a3a1a 100%)" }}
      >
        <div
          className="text-[11px] font-black uppercase tracking-widest mb-1"
          style={{ color: "#3DD907" }}
        >
          Campionato
        </div>
        <h1 className="font-display font-black text-3xl uppercase text-white">
          GREEN<span style={{ color: "#3DD907" }}>VOLLEY</span>
        </h1>
      </div>

      {/* Prossima partita */}
      {nextMatch ? (
        <div>
          <div
            className="text-[10px] font-black uppercase tracking-widest mb-2"
            style={{ color: "#3DD907" }}
          >
            Prossima partita
          </div>
          <Link
            href={`/greenvolley/partite/${nextMatch.id}`}
            className="admin-card p-4 flex items-center justify-between hover:shadow-md transition-shadow block"
          >
            <span className="font-black text-base">{nextMatch.homeTeam.name}</span>
            <div className="text-center">
              <div className="font-black text-xl" style={{ color: "#3DD907" }}>
                vs
              </div>
              {nextMatch.date && (
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {nextMatch.date.toLocaleDateString("it-IT", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              )}
            </div>
            <span className="font-black text-base">{nextMatch.awayTeam.name}</span>
          </Link>
        </div>
      ) : (
        <div
          className="admin-card p-4 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Nessuna partita programmata.
        </div>
      )}

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
          <div key={group.id}>
            <div className="flex items-center justify-between mb-2">
              <div
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: "#3DD907", wordSpacing: "0.3em" }}
              >
                {group.name}
              </div>
              <Link
                href="/greenvolley/classifica"
                className="text-xs font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                Vedi tutto →
              </Link>
            </div>
            <div className="admin-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-soft)" }}>
                    <th className="text-left px-3 py-2 font-semibold text-xs" style={{ color: "var(--text-muted)" }}>
                      Squadra
                    </th>
                    <th className="text-center px-2 py-2 font-semibold text-xs w-10" style={{ color: "var(--text-muted)" }}>G</th>
                    <th className="text-center px-2 py-2 font-semibold text-xs w-10" style={{ color: "#3DD907" }}>P</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, i) => (
                    <tr
                      key={row.teamId}
                      style={{ borderBottom: i < standings.length - 1 ? "1px solid var(--border-soft)" : "none" }}
                    >
                      <td className="px-3 py-2 font-semibold">{row.teamName}</td>
                      <td className="text-center px-2 py-2 text-xs" style={{ color: "var(--text-muted)" }}>
                        {row.played}
                      </td>
                      <td className="text-center px-2 py-2 font-black" style={{ color: "#3DD907" }}>
                        {row.setsWon}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
