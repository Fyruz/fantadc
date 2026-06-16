import BackButton from "@/components/back-button";
import { getPublicFantasyPlayerPickRows } from "@/lib/data/public/players";
import PlayerPickRow from "./_player-row";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function GiocatoriFantaPage() {
  const rows = await getPublicFantasyPlayerPickRows();

  if (rows.length === 0) {
    return (
      <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>
        Nessuna squadra fanta registrata.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Header mobile */}
      <div className="md:hidden flex items-center justify-between h-12">
        <div className="flex-1 flex items-center">
          <BackButton />
        </div>
        <span
          className="flex-1 text-center uppercase whitespace-nowrap"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          Scelti dai fantallenatori
        </span>
        <div className="flex-1" />
      </div>

      <div className="flex flex-col gap-3">
      {/* Column headers */}
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: "1px solid rgba(9,20,76,0.1)" }}
      >
        <span className="text-xs uppercase" style={{ color: "rgba(0,0,0,0.65)" }}>Rank</span>
        <span className="text-xs uppercase" style={{ color: "rgba(0,0,0,0.65)" }}>Preso</span>
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {rows.map((row, idx) => (
          <PlayerPickRow key={row.playerId} row={row} isLast={idx === rows.length - 1} />
        ))}
      </div>
      </div>
    </div>
  );
}
