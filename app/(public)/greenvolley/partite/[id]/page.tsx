import BackChevron from "@/components/back-chevron";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

const CARD: React.CSSProperties = {
  border: "1px solid rgba(9,20,76,0.05)",
  boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)",
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
      homeTeam: { select: { id: true, name: true, players: { orderBy: { name: "asc" }, select: { id: true, name: true } } } },
      awayTeam: { select: { id: true, name: true, players: { orderBy: { name: "asc" }, select: { id: true, name: true } } } },
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
  const matchDateLabel = match.date
    ? match.date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })
    : null;

  return (
    <div className="flex flex-col gap-10 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center relative py-2">
        <BackChevron />
        <h1
          className="uppercase mx-auto font-medium"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          Dettagli Partita
        </h1>
      </div>

      {/* Risultato */}
      <div className="bg-white rounded-3xl overflow-hidden" style={CARD}>
        {/* Fase + data */}
        <div
          className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}
        >
          <div className="flex items-center gap-2">
            {phaseName && (
              <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
                {phaseName}
              </span>
            )}
          </div>
          {matchDateLabel && (
            <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
              {matchDateLabel}
            </span>
          )}
        </div>

        {/* Squadre + punteggi */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Link href={`/greenvolley/squadre/${match.homeTeam.id}`} className="text-base font-medium text-black flex-1 truncate">{match.homeTeam.name}</Link>
            {scored && (
              <span
                className="text-2xl font-bold tabular-nums shrink-0"
                style={{ color: homeSets > awaySets ? "#000" : "rgba(0,0,0,0.25)" }}
              >
                {homeSets}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-4">
            <Link href={`/greenvolley/squadre/${match.awayTeam.id}`} className="text-base font-medium text-black flex-1 truncate">{match.awayTeam.name}</Link>
            {scored && (
              <span
                className="text-2xl font-bold tabular-nums shrink-0"
                style={{ color: awaySets > homeSets ? "#000" : "rgba(0,0,0,0.25)" }}
              >
                {awaySets}
              </span>
            )}
          </div>
          {!scored && (
            <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              {match.date
                ? match.date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
                : "Orario da definire"}
            </p>
          )}
        </div>
      </div>

      {/* Set dettaglio */}
      {match.sets.length > 0 && (
        <div className="bg-white rounded-3xl overflow-hidden" style={CARD}>
          <div className="px-6 pt-6 pb-3">
            <h2
              className="text-base font-medium uppercase"
              style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
            >
              Set
            </h2>
          </div>

          {/* Intestazioni */}
          <div className="flex items-center gap-4 px-6 pb-3">
            <span className="text-xs font-semibold uppercase text-black/65 w-8 shrink-0">N.</span>
            <span className="text-xs font-semibold uppercase text-black/65 flex-1 truncate">
              {match.homeTeam.name}
            </span>
            <span className="text-xs font-semibold uppercase text-black/65 flex-1 text-right truncate">
              {match.awayTeam.name}
            </span>
          </div>

          {match.sets.map((s) => {
            const homeWins = s.homePoints > s.awayPoints;
            return (
              <div
                key={s.id}
                className="flex items-center gap-4 px-6"
                style={{ borderTop: "1px solid rgba(9,20,76,0.05)", paddingTop: 12, paddingBottom: 12 }}
              >
                <span className="text-xs w-8 shrink-0 tabular-nums" style={{ color: "rgba(0,0,0,0.35)" }}>
                  {s.setNumber}
                </span>
                <span
                  className="text-sm flex-1 tabular-nums"
                  style={{ fontWeight: homeWins ? 700 : 400, color: homeWins ? "#000" : "rgba(0,0,0,0.35)" }}
                >
                  {s.homePoints}
                </span>
                <span
                  className="text-sm flex-1 text-right tabular-nums"
                  style={{ fontWeight: !homeWins ? 700 : 400, color: !homeWins ? "#000" : "rgba(0,0,0,0.35)" }}
                >
                  {s.awayPoints}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Giocatori */}
      {(match.homeTeam.players.length > 0 || match.awayTeam.players.length > 0) && (
        <div className="bg-white rounded-3xl overflow-hidden" style={CARD}>
          <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}>
            <h2
              className="text-base font-medium uppercase"
              style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
            >
              Giocatori
            </h2>
          </div>

          <div className="flex pb-6">
            {/* Home */}
            <div className="flex-1 min-w-0 px-6 pt-4">
              <Link href={`/greenvolley/squadre/${match.homeTeam.id}`} className="text-sm font-medium text-black truncate mb-4 block">{match.homeTeam.name}</Link>
              <div className="flex flex-col gap-3">
                {match.homeTeam.players.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <img src="/icons/jersey.svg" width={14} height={14} alt="" style={{ opacity: 0.7 }} />
                    <span className="text-sm text-black truncate">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divisore verticale */}
            <div className="w-px" style={{ background: "rgba(9,20,76,0.05)" }} />

            {/* Away */}
            <div className="flex-1 min-w-0 px-6 pt-4">
              <Link href={`/greenvolley/squadre/${match.awayTeam.id}`} className="text-sm font-medium text-black truncate mb-4 block">{match.awayTeam.name}</Link>
              <div className="flex flex-col gap-3">
                {match.awayTeam.players.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <img src="/icons/jersey.svg" width={14} height={14} alt="" style={{ opacity: 0.7 }} />
                    <span className="text-sm text-black truncate">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
