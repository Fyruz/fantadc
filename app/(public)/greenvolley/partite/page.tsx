import { db } from "@/lib/db";
import Link from "next/link";

const GV = "#3DD907";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
};
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  DRAFT:     { bg: "rgba(0,0,0,0.08)",    color: "var(--text-muted)" },
  SCHEDULED: { bg: "rgba(61,217,7,0.15)", color: GV },
  CONCLUDED: { bg: "rgba(61,217,7,0.12)", color: "#166534" },
};

export default async function VolleyPartitePublicPage() {
  const matches = await db.volleyMatch.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { date: "desc" },
    include: {
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
      sets: { orderBy: { setNumber: "asc" } },
      group: { select: { name: true } },
      knockoutRound: { select: { name: true } },
    },
  });

  const upcoming = matches.filter((m) => m.status === "SCHEDULED");
  const concluded = matches.filter((m) => m.status === "CONCLUDED");

  const renderMatch = (m: (typeof matches)[number]) => {
    const homeSets = m.sets.filter((s) => s.homePoints > s.awayPoints).length;
    const awaySets = m.sets.filter((s) => s.awayPoints > s.homePoints).length;
    const st = STATUS_STYLE[m.status] ?? STATUS_STYLE.DRAFT;

    return (
      <Link
        key={m.id}
        href={`/greenvolley/partite/${m.id}`}
        className="flex flex-col px-4 py-3 rounded-xl transition-colors hover:bg-[var(--surface-1)]"
        style={{ border: "1px solid var(--border-soft)" }}
      >
        {/* Top row: teams + score */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="font-black text-sm truncate">{m.homeTeam.name}</span>
            <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {m.awayTeam.name}
            </span>
          </div>
          <div className="text-center flex-shrink-0 px-2">
            {m.status === "CONCLUDED" ? (
              <span className="font-black text-lg" style={{ color: GV }}>
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
        </div>
        {/* Bottom row: status badge + group */}
        <div className="flex items-center gap-2 mt-2">
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: st.bg, color: st.color }}
          >
            {STATUS_LABEL[m.status] ?? m.status}
          </span>
          {(m.group || m.knockoutRound) && (
            <span className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
              {m.group?.name ?? m.knockoutRound?.name}
            </span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h1
        className="font-display font-black text-2xl uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Partite
      </h1>

      {upcoming.length > 0 && (
        <div>
          <div
            className="text-[10px] font-black uppercase tracking-widest mb-3"
            style={{ color: "#3DD907" }}
          >
            In programma
          </div>
          <div className="flex flex-col gap-2">{upcoming.map(renderMatch)}</div>
        </div>
      )}

      {concluded.length > 0 && (
        <div>
          <div
            className="text-[10px] font-black uppercase tracking-widest mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Risultati
          </div>
          <div className="flex flex-col gap-2">{concluded.map(renderMatch)}</div>
        </div>
      )}

      {matches.length === 0 && (
        <div
          className="text-center py-12 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Nessuna partita disponibile.
        </div>
      )}
    </div>
  );
}
