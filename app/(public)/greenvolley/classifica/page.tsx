import { db } from "@/lib/db";
import { computeVolleyStandings } from "@/lib/volley/standings";

export default async function VolleyClassificaPage() {
  const groups = await db.volleyGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      teams: { include: { team: { select: { id: true, name: true } } } },
      matches: {
        where: { status: "CONCLUDED" },
        include: { sets: true },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">GreenVolley</div>
        <h1 className="text-3xl uppercase" style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}>
          CLASSIFICA
        </h1>
      </div>

      {groups.length === 0 && (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun girone disponibile.
        </div>
      )}

      {groups.length > 0 && (
        <p className="text-[10px]" style={{ color: "rgba(0,0,0,0.40)" }}>
          G=Giocate · SV=Set Vinti · SP=Set Persi · Pt=Punti (set vinti)
        </p>
      )}

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
              <h2
                className="uppercase text-base font-medium"
                style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)", wordSpacing: "0.3em" }}
              >
                {group.name}
              </h2>
            </div>

            {/* Table header */}
            <div className="flex items-center gap-4 px-6 pb-3">
              <span className="text-xs font-semibold uppercase text-black/65 w-5 shrink-0">POS</span>
              <span className="text-xs font-semibold uppercase text-black/65 flex-1">SQUADRA</span>
              <span className="text-xs font-semibold uppercase text-black/65 w-6 text-center shrink-0">G</span>
              <span className="text-xs font-semibold uppercase text-black/65 w-6 text-center shrink-0">SV</span>
              <span className="text-xs font-semibold uppercase text-black/65 w-6 text-center shrink-0">SP</span>
              <span className="text-xs font-semibold uppercase text-black/65 w-5 text-right shrink-0">PT</span>
            </div>

            {/* Rows */}
            {standings.map((row, i) => (
              <div
                key={row.teamId}
                className="flex items-center gap-4 px-6"
                style={{ borderTop: "1px solid rgba(9,20,76,0.05)", paddingTop: 12, paddingBottom: 12 }}
              >
                <span className="text-xs text-black w-5 shrink-0 tabular-nums">{i + 1}</span>
                <span className="text-sm font-normal text-(--text-primary) flex-1 truncate">{row.teamName}</span>
                <span className="text-sm text-black w-6 text-center shrink-0 tabular-nums">{row.played}</span>
                <span className="text-sm text-black w-6 text-center shrink-0 tabular-nums">{row.setsWon}</span>
                <span className="text-sm text-black w-6 text-center shrink-0 tabular-nums">{row.setsLost}</span>
                <span className="text-sm font-bold text-(--text-primary) w-5 text-right shrink-0 tabular-nums">{row.setsWon}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
