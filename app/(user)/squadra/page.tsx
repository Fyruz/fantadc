import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { computeTeamHistory } from "@/lib/scoring";
import { Button } from "primereact/button";
import RosterTable from "./_roster-table";
import ScoreTable from "./_score-table";

export default async function SquadraPage() {
  const user = await requireAuth();
  const userId = Number(user.id);

  const fantasyTeam = await db.fantasyTeam.findUnique({
    where: { userId },
    include: {
      players: {
        include: {
          player: {
            include: { footballTeam: { select: { name: true, shortName: true } } },
          },
        },
      },
      captain: { select: { id: true, name: true } },
    },
  });

  if (!fantasyTeam) redirect("/squadra/crea");

  const history = await computeTeamHistory(fantasyTeam.id);
  const totalPoints = history.reduce((s, m) => s + m.total, 0);

  const gk = fantasyTeam.players.find((p) => p.player.role === "P");
  const outfield = fantasyTeam.players.filter((p) => p.player.role === "A");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="over-label mb-0.5">La mia squadra</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          {fantasyTeam.name.toUpperCase()}
        </h1>
        {history.length > 0 && (
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-display font-black text-2xl" style={{ color: "var(--primary)" }}>
              {totalPoints.toFixed(1)}
            </span>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>punti totali</span>
          </div>
        )}
      </div>

      {/* Card premium squadra */}
      <div
        className="rounded-[18px] p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)", boxShadow: "0 6px 24px rgba(1,7,163,0.30)" }}
      >
        <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
        <div className="relative">
          <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-3">
            Capitano: <span style={{ color: "#E8A000" }}>★ {fantasyTeam.captain.name}</span>
          </div>
          {/* Attaccanti */}
          <div className="flex flex-wrap gap-2 mb-2 justify-center">
            {outfield.map(({ player }) => (
              <PlayerChip
                key={player.id}
                name={player.name}
                team={player.footballTeam.shortName ?? player.footballTeam.name}
                isCaptain={player.id === fantasyTeam.captainPlayerId}
              />
            ))}
          </div>
          {/* Portiere */}
          {gk && (
            <div className="flex justify-center">
              <PlayerChip
                name={gk.player.name}
                team={gk.player.footballTeam.shortName ?? gk.player.footballTeam.name}
                isCaptain={gk.player.id === fantasyTeam.captainPlayerId}
                isGk
              />
            </div>
          )}
        </div>
      </div>

      {/* Rosa */}
      <div>
        <div className="over-label mb-3">Rosa</div>
        <RosterTable
          rows={fantasyTeam.players.map(({ player }) => ({
            id: player.id,
            name: player.name,
            role: player.role,
            footballTeamName: player.footballTeam.name,
            isCaptain: player.id === fantasyTeam.captainPlayerId,
          }))}
        />
      </div>

      <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
        La rosa è bloccata. Solo un admin può modificarla.
      </p>

      {/* Storico punteggi */}
      {history.length > 0 && (
        <div>
          <div className="over-label mb-3">Storico punteggi</div>
          <div className="flex flex-col gap-2">
            {history.map((ms) => (
              <details key={ms.matchId} className="card overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--surface-1)] transition-colors">
                  <span className="font-display font-black text-[13px] uppercase" style={{ color: "var(--text-primary)" }}>
                    {ms.label}
                  </span>
                  <span className="font-display font-black text-base" style={{ color: "var(--primary)" }}>
                    {ms.total.toFixed(1)} pt
                  </span>
                </summary>
                <div className="px-4 pb-3">
                  <ScoreTable rows={ms.playerScores} />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      <div>
        <Link href="/dashboard">
          <Button label="← Dashboard" outlined size="small" />
        </Link>
      </div>
    </div>
  );
}

function PlayerChip({
  name,
  team,
  isCaptain,
  isGk = false,
}: {
  name: string;
  team: string;
  isCaptain: boolean;
  isGk?: boolean;
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
        <span className="text-[9px] font-black uppercase tracking-wide mb-0.5" style={{ color: "#E8A000" }}>
          ★ CAP
        </span>
      )}
      <span className="font-display font-black text-[11px] uppercase text-white leading-tight">{name}</span>
      <span className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{team}</span>
    </div>
  );
}
