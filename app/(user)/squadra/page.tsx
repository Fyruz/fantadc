import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { computeTeamHistory } from "@/lib/scoring";
import { AUTH_ONBOARDING_PATH } from "@/lib/post-auth";
import { resolveTeamFlag } from "@/lib/flags";
import { getActiveEditWindow } from "@/lib/roster-edit-window";

const CARD: React.CSSProperties = {
  background: "#fff",
  border: "1px solid rgba(9,20,76,0.05)",
  boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)",
};

const ROW_BORDER: React.CSSProperties = { borderTop: "1px solid rgba(9,20,76,0.05)" };

export default async function SquadraPage() {
  const user = await requireAuth();
  const userId = Number(user.id);

  const fantasyTeam = await db.fantasyTeam.findUnique({
    where: { userId },
    include: {
      players: {
        include: {
          player: {
            include: {
              footballTeam: {
                select: { name: true, shortName: true, countryCode: true, logoUrl: true },
              },
            },
          },
        },
      },
      captain: { select: { id: true, name: true } },
    },
  });

  if (!fantasyTeam) redirect(AUTH_ONBOARDING_PATH);

  const history = await computeTeamHistory(fantasyTeam.id);
  const totalPoints = history.reduce((s, m) => s + m.total, 0);

  const playerTotals = new Map<number, number>();
  for (const ms of history) {
    for (const ps of ms.playerScores) {
      playerTotals.set(ps.playerId, (playerTotals.get(ps.playerId) ?? 0) + ps.finalPoints);
    }
  }

  const gk = fantasyTeam.players.find((p) => p.player.role === "P");
  const outfield = fantasyTeam.players.filter((p) => p.player.role === "A");

  // Finestra di modifica rosa ("mercato") — la notifica con CTA vive sulla dashboard.
  const editWindow = await getActiveEditWindow();

  return (
    <div className="flex flex-col gap-6">

      {/* Team name + points */}
      <div>
        <h1
          className="text-xl font-medium uppercase"
          style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
        >
          {fantasyTeam.name}
        </h1>
        {history.length > 0 && (
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
              {totalPoints.toFixed(1)}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>punti totali</span>
          </div>
        )}
      </div>

      {/* Hero card */}
      <div
        className="relative overflow-hidden rounded-[22px] p-5"
        style={{
          background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)",
          boxShadow: "0 6px 24px rgba(1,7,163,0.30)",
        }}
      >
        <div className="pointer-events-none absolute -bottom-5 -right-5 h-32 w-32 rounded-full border border-white/5" />
        <div className="relative">
          <div className="mb-4 text-[9px] font-bold uppercase tracking-widest text-white/50">
            Capitano: <span style={{ color: "#E8A000" }}>★ {fantasyTeam.captain.name}</span>
          </div>
          <div className="mb-2 flex flex-wrap justify-center gap-2">
            {outfield.map(({ player }) => (
              <PlayerChip
                key={player.id}
                name={player.name}
                team={player.footballTeam.shortName ?? player.footballTeam.name}
                flagSrc={resolveTeamFlag(player.footballTeam)}
                flagAlt={player.footballTeam.name}
                isCaptain={player.id === fantasyTeam.captainPlayerId}
              />
            ))}
          </div>
          {gk && (
            <div className="flex justify-center">
              <PlayerChip
                name={gk.player.name}
                team={gk.player.footballTeam.shortName ?? gk.player.footballTeam.name}
                flagSrc={resolveTeamFlag(gk.player.footballTeam)}
                flagAlt={gk.player.footballTeam.name}
                isCaptain={gk.player.id === fantasyTeam.captainPlayerId}
                isGk
              />
            </div>
          )}
        </div>
      </div>

      {/* Rosa */}
      <div className="rounded-3xl overflow-hidden" style={CARD}>
        <div className="px-6 pt-6 pb-3">
          <h2
            className="text-base font-medium uppercase"
            style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
          >
            Rosa
          </h2>
        </div>

        {fantasyTeam.players.map(({ player }) => {
          const isCaptain = player.id === fantasyTeam.captainPlayerId;
          const flagSrc = resolveTeamFlag(player.footballTeam);
          const pts = playerTotals.get(player.id) ?? 0;
          return (
            <div key={player.id} className="flex items-center gap-3 px-6 py-3" style={ROW_BORDER}>
              <div className="w-9 h-9 shrink-0 flex items-center justify-center p-1">
                {flagSrc ? (
                  <img src={flagSrc} alt={player.footballTeam.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
                    {(player.footballTeam.shortName ?? player.footballTeam.name).slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-black truncate">{player.name}</p>
                <p className="text-xs truncate" style={{ color: "rgba(0,0,0,0.55)" }}>
                  {player.footballTeam.shortName ?? player.footballTeam.name}
                </p>
              </div>
              {isCaptain && (
                <span className="text-xs font-semibold shrink-0" style={{ color: "#C48A00" }}>CAP</span>
              )}
              {history.length > 0 && (
                <span
                  className="text-sm font-semibold shrink-0 tabular-nums"
                  style={{ color: pts > 0 ? "var(--primary)" : "rgba(0,0,0,0.35)" }}
                >
                  {pts.toFixed(1)}
                </span>
              )}
            </div>
          );
        })}

        <p className="px-6 py-3 text-[10px]" style={{ color: "var(--text-disabled)", ...ROW_BORDER }}>
          {editWindow
            ? "Modifiche aperte: puoi cambiare giocatori e capitano fino alla chiusura."
            : "La rosa è bloccata. Solo un admin può modificarla."}
        </p>
      </div>

    </div>
  );
}

function PlayerChip({
  name, team, flagSrc, flagAlt, isCaptain, isGk = false,
}: {
  name: string; team: string; flagSrc: string | null; flagAlt: string; isCaptain: boolean; isGk?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center rounded-xl px-3 py-2 text-center"
      style={
        isGk
          ? { background: "rgba(232,160,0,0.20)", border: "1px solid rgba(232,160,0,0.35)" }
          : { background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.16)" }
      }
    >
      {isCaptain && (
        <span className="mb-0.5 text-[9px] font-black uppercase tracking-wide" style={{ color: "#E8A000" }}>
          ★ CAP
        </span>
      )}
      <span className="text-[11px] font-semibold uppercase leading-tight text-white">
        <span className="inline-flex items-center justify-center gap-1.5">
          {flagSrc && (
            <img src={flagSrc} alt={flagAlt} className="h-3.5 w-3.5 shrink-0 rounded-sm object-contain" />
          )}
          <span>{name}</span>
        </span>
      </span>
      <span className="mt-0.5 text-[9px]" style={{ color: "rgba(255,255,255,0.5)" }}>{team}</span>
    </div>
  );
}
