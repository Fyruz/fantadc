import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Tag } from "primereact/tag";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
};
const STATUS_SEVERITY: Record<string, "secondary" | "info" | "success"> = {
  DRAFT: "secondary",
  SCHEDULED: "info",
  CONCLUDED: "success",
};

export default async function VolleyMatchPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await db.volleyMatch.findUnique({
    where: { id: Number(id) },
    include: {
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
      sets: { orderBy: { setNumber: "asc" } },
      group: { select: { name: true } },
      knockoutRound: { select: { name: true } },
    },
  });
  if (!match || match.status === "DRAFT") notFound();

  const homeSets = match.sets.filter((s) => s.homePoints > s.awayPoints).length;
  const awaySets = match.sets.filter((s) => s.awayPoints > s.homePoints).length;

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      {/* Header */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "linear-gradient(135deg, #0d1f0d 0%, #1a3a1a 100%)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Tag
            value={STATUS_LABEL[match.status]}
            severity={STATUS_SEVERITY[match.status]}
          />
          {(match.group || match.knockoutRound) && (
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: "rgba(61,217,7,0.2)", color: "#3DD907" }}
            >
              {match.group?.name ?? match.knockoutRound?.name}
            </span>
          )}
          {match.date && (
            <span className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              {match.date.toLocaleDateString("it-IT", {
                weekday: "short",
                day: "numeric",
                month: "long",
              })}
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 text-white">
          <span className="font-black text-lg flex-1 text-right">
            {match.homeTeam.name}
          </span>
          <div className="text-center">
            {match.status === "CONCLUDED" ? (
              <div
                className="font-black text-4xl"
                style={{ color: "#3DD907" }}
              >
                {homeSets} – {awaySets}
              </div>
            ) : (
              <div className="font-black text-2xl" style={{ color: "#3DD907" }}>
                vs
              </div>
            )}
            <div className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              set vinti
            </div>
          </div>
          <span className="font-black text-lg flex-1 text-left">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Set dettaglio */}
      {match.sets.length > 0 && (
        <div>
          <div
            className="text-[10px] font-black uppercase tracking-widest mb-3"
            style={{ color: "#3DD907" }}
          >
            Set
          </div>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border-soft)" }}
          >
            {/* Intestazione */}
            <div
              className="grid grid-cols-4 px-4 py-2 text-xs font-black uppercase tracking-wide"
              style={{
                background: "var(--surface-1)",
                color: "var(--text-muted)",
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              <span>Set</span>
              <span className="text-center">{match.homeTeam.name}</span>
              <span className="text-center">{match.awayTeam.name}</span>
              <span className="text-center">Vince</span>
            </div>
            {match.sets.map((s, i) => {
              const homeWins = s.homePoints > s.awayPoints;
              return (
                <div
                  key={s.id}
                  className="grid grid-cols-4 px-4 py-3 text-sm"
                  style={{
                    borderBottom:
                      i < match.sets.length - 1
                        ? "1px solid var(--border-soft)"
                        : "none",
                  }}
                >
                  <span className="font-semibold" style={{ color: "var(--text-muted)" }}>
                    {s.setNumber}
                  </span>
                  <span
                    className={`text-center font-${homeWins ? "black" : "normal"}`}
                    style={homeWins ? { color: "#3DD907" } : {}}
                  >
                    {s.homePoints}
                  </span>
                  <span
                    className={`text-center font-${!homeWins ? "black" : "normal"}`}
                    style={!homeWins ? { color: "#3DD907" } : {}}
                  >
                    {s.awayPoints}
                  </span>
                  <span
                    className="text-center text-xs font-bold"
                    style={{ color: "#3DD907" }}
                  >
                    {homeWins ? match.homeTeam.name : match.awayTeam.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
