import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/status-badge";

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
  const scored = match.status === "CONCLUDED" && match.sets.length > 0;
  const phaseName = match.group?.name ?? match.knockoutRound?.name ?? null;

  return (
    <div className="flex flex-col gap-10 max-w-lg mx-auto">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center relative py-2">
        <Link href="/greenvolley/partite" className="absolute left-0 flex items-center justify-center w-6 h-6">
          <img src="/icons/chevron_left.svg" width={24} height={24} alt="Indietro" />
        </Link>
        <h1
          className="uppercase mx-auto font-medium"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          Dettagli Partita
        </h1>
      </div>

      {/* ── Match card ─────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-3xl overflow-hidden"
        style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5 gap-2"
          style={{ borderBottom: "1px solid var(--border-soft)" }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <StatusBadge status={match.status} />
            {phaseName && (
              <span
                className="text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 truncate"
                style={{ background: "var(--primary-light)", color: "var(--primary)" }}
              >
                {phaseName}
              </span>
            )}
          </div>
          {match.date && (
            <span className="text-[11px] font-semibold capitalize flex-shrink-0" style={{ color: "var(--text-muted)" }}>
              {match.date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "long", timeZone: "UTC" })}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="px-4 py-6 flex items-center gap-2">
          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0 text-center">
            <span
              className="font-display font-black text-2xl uppercase leading-tight tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {match.homeTeam.name}
            </span>
          </div>

          {/* Center */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1 px-2">
            {scored ? (
              <div className="font-display font-black text-4xl leading-none" style={{ color: "var(--primary)" }}>
                {homeSets}
                <span style={{ color: "var(--text-disabled)" }}> — </span>
                {awaySets}
              </div>
            ) : (
              <div className="font-display font-black text-2xl leading-none" style={{ color: "var(--primary)" }}>
                VS
              </div>
            )}
            <span className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: "var(--text-disabled)" }}>
              {scored ? "set vinti" : "set"}
            </span>
          </div>

          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0 text-center">
            <span
              className="font-display font-black text-2xl uppercase leading-tight tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {match.awayTeam.name}
            </span>
          </div>
        </div>
      </div>

      {/* ── Set dettaglio ──────────────────────────────────────────── */}
      {match.sets.length > 0 && (
        <div
          className="bg-white rounded-3xl overflow-hidden"
          style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
        >
          <div className="px-6 pt-6 pb-4">
            <h2
              className="uppercase font-medium text-base"
              style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
            >
              Set
            </h2>
          </div>

          {/* Intestazione tabella */}
          <div
            className="grid grid-cols-4 px-6 py-2 text-xs font-black uppercase tracking-wide"
            style={{
              background: "var(--surface-1)",
              color: "var(--text-muted)",
              borderTop: "1px solid var(--border-soft)",
              borderBottom: "1px solid var(--border-soft)",
            }}
          >
            <span>Set</span>
            <span className="text-center truncate">{match.homeTeam.name}</span>
            <span className="text-center truncate">{match.awayTeam.name}</span>
            <span className="text-center">Vince</span>
          </div>

          {match.sets.map((s, i) => {
            const homeWins = s.homePoints > s.awayPoints;
            return (
              <div
                key={s.id}
                className="grid grid-cols-4 px-6 py-3 text-sm items-center"
                style={{
                  borderBottom: i < match.sets.length - 1 ? "1px solid var(--border-soft)" : "none",
                }}
              >
                <span className="font-semibold" style={{ color: "var(--text-muted)" }}>
                  {s.setNumber}
                </span>
                <span
                  className={`text-center ${homeWins ? "font-black" : "font-normal"}`}
                  style={homeWins ? { color: "var(--primary)" } : { color: "var(--text-primary)" }}
                >
                  {s.homePoints}
                </span>
                <span
                  className={`text-center ${!homeWins ? "font-black" : "font-normal"}`}
                  style={!homeWins ? { color: "var(--primary)" } : { color: "var(--text-primary)" }}
                >
                  {s.awayPoints}
                </span>
                <span
                  className="text-center text-xs font-bold truncate"
                  style={{ color: "var(--primary)" }}
                >
                  {homeWins ? match.homeTeam.name : match.awayTeam.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
