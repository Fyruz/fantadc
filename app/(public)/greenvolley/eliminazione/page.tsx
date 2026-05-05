import { db } from "@/lib/db";
import Link from "next/link";
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

export default async function VolleyEliminazionePublicPage() {
  const rounds = await db.volleyKnockoutRound.findMany({
    orderBy: { order: "asc" },
    include: {
      matches: {
        include: {
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          sets: { orderBy: { setNumber: "asc" } },
        },
        orderBy: { date: "asc" },
      },
    },
  });

  const renderMatch = (m: (typeof rounds)[number]["matches"][number]) => {
    const homeSets = m.sets.filter((s) => s.homePoints > s.awayPoints).length;
    const awaySets = m.sets.filter((s) => s.awayPoints > s.homePoints).length;

    return (
      <Link
        key={m.id}
        href={`/greenvolley/partite/${m.id}`}
        className="flex items-center justify-between px-4 py-3 rounded-lg transition-colors hover:bg-[var(--surface-1)]"
        style={{ border: "1px solid var(--border-soft)" }}
      >
        <div className="flex flex-col gap-0.5 flex-1">
          <span className="font-black text-sm">{m.homeTeam.name}</span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {m.awayTeam.name}
          </span>
        </div>
        <div className="text-center px-4">
          {m.status === "CONCLUDED" ? (
            <span className="font-black text-lg" style={{ color: "#3DD907" }}>
              {homeSets} – {awaySets}
            </span>
          ) : (
            <span className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
              {m.date
                ? m.date.toLocaleDateString("it-IT", { day: "numeric", month: "short" })
                : "—"}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <Tag
            value={STATUS_LABEL[m.status]}
            severity={STATUS_SEVERITY[m.status]}
          />
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <h1
        className="font-display font-black text-2xl uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Eliminazione
      </h1>

      {rounds.length === 0 && (
        <div className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun turno disponibile.
        </div>
      )}

      {rounds.map((round) => (
        <div key={round.id}>
          <div
            className="text-[10px] font-black uppercase tracking-widest mb-3"
            style={{ color: "#3DD907" }}
          >
            {round.name}
          </div>

          {round.matches.length === 0 ? (
            <div
              className="text-center py-6 text-sm rounded-lg"
              style={{
                background: "var(--surface-1)",
                color: "var(--text-muted)",
              }}
            >
              Nessuna partita in questo turno.
            </div>
          ) : (
            <div className="flex flex-col gap-2">{round.matches.map(renderMatch)}</div>
          )}
        </div>
      ))}
    </div>
  );
}
