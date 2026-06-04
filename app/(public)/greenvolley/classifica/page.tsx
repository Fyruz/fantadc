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
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          CLASSIFICA
        </h1>
      </div>

      {groups.length === 0 && (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun girone disponibile.
        </div>
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
            <div
              className="grid grid-cols-[1fr_28px_28px_28px_40px_36px] px-6 pb-3 text-xs font-semibold uppercase gap-1"
              style={{ color: "rgba(0,0,0,0.40)" }}
            >
              <span>Squadra</span>
              <span className="text-center">G</span>
              <span className="text-center">SV</span>
              <span className="text-center">SP</span>
              <span className="text-center">QS</span>
              <span className="text-center" style={{ color: "var(--primary)" }}>Pt</span>
            </div>

            {standings.map((row, i) => (
              <div
                key={row.teamId}
                className="grid grid-cols-[1fr_28px_28px_28px_40px_36px] px-6 py-3 text-sm gap-1 items-center"
                style={{ borderTop: "1px solid rgba(9,20,76,0.05)" }}
              >
                <span className="font-normal text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  {i + 1}. {row.teamName}
                </span>
                <span className="text-center text-xs tabular-nums" style={{ color: "rgba(0,0,0,0.40)" }}>
                  {row.played}
                </span>
                <span className="text-center text-xs tabular-nums" style={{ color: "var(--text-primary)" }}>
                  {row.setsWon}
                </span>
                <span className="text-center text-xs tabular-nums" style={{ color: "var(--text-primary)" }}>
                  {row.setsLost}
                </span>
                <span className="text-center text-xs tabular-nums" style={{ color: "rgba(0,0,0,0.40)" }}>
                  {row.setRatio === 0 ? "0" : row.setRatio.toFixed(2)}
                </span>
                <span className="text-center text-sm font-bold tabular-nums" style={{ color: "var(--primary)" }}>
                  {row.setsWon}
                </span>
              </div>
            ))}

            <div className="text-[10px] mt-2 px-6" style={{ color: "rgba(0,0,0,0.40)" }}>
              G=Giocate · SV=Set Vinti · SP=Set Persi · QS=Quoziente Set · Pt=Punti (set vinti)
            </div>
          </div>
        );
      })}
    </div>
  );
}
