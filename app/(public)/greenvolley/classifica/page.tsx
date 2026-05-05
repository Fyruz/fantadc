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
    <div className="flex flex-col gap-8">
      <h1
        className="font-display font-black text-2xl uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Classifica
      </h1>

      {groups.length === 0 && (
        <div className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
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
          <div key={group.id}>
            <div
              className="text-[10px] font-black uppercase tracking-widest mb-3"
              style={{ color: "#3DD907" }}
            >
              {group.name}
            </div>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border-soft)" }}
            >
              {/* Header */}
              <div
                className="grid grid-cols-[1fr_40px_40px_40px_40px_50px] px-4 py-2 text-xs font-black uppercase tracking-wide gap-2"
                style={{
                  background: "var(--surface-1)",
                  color: "var(--text-muted)",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span>Squadra</span>
                <span className="text-center">G</span>
                <span className="text-center">SV</span>
                <span className="text-center">SP</span>
                <span className="text-center">QS</span>
                <span className="text-center" style={{ color: "#3DD907" }}>Pt</span>
              </div>

              {standings.map((row, i) => (
                <div
                  key={row.teamId}
                  className="grid grid-cols-[1fr_40px_40px_40px_40px_50px] px-4 py-3 text-sm gap-2 items-center"
                  style={{
                    borderBottom:
                      i < standings.length - 1
                        ? "1px solid var(--border-soft)"
                        : "none",
                  }}
                >
                  <span className="font-semibold">{row.teamName}</span>
                  <span className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
                    {row.played}
                  </span>
                  <span className="text-center text-xs">{row.setsWon}</span>
                  <span className="text-center text-xs">{row.setsLost}</span>
                  <span className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
                    {row.setRatio === 0 ? "0" : row.setRatio.toFixed(2)}
                  </span>
                  <span
                    className="text-center font-black"
                    style={{ color: "#3DD907" }}
                  >
                    {row.setsWon}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-[10px] mt-1 px-1" style={{ color: "var(--text-muted)" }}>
              G=Giocate · SV=Set Vinti · SP=Set Persi · QS=Quoziente Set · Pt=Punti (set vinti)
            </div>
          </div>
        );
      })}
    </div>
  );
}
