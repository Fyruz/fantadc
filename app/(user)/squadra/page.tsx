import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { computeTeamHistory } from "@/lib/scoring";
import { AUTH_ONBOARDING_PATH } from "@/lib/post-auth";
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

  if (!fantasyTeam) redirect(AUTH_ONBOARDING_PATH);

  const history = await computeTeamHistory(fantasyTeam.id);
  const totalPoints = history.reduce((s, m) => s + m.total, 0);

  const gk = fantasyTeam.players.find((p) => p.player.role === "P");
  const outfield = fantasyTeam.players.filter((p) => p.player.role === "A");

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="over-label mb-0.5">La mia squadra</div>
        <h1
          className="font-display text-3xl font-black uppercase"
          style={{ color: "var(--text-primary)" }}
        >
          {fantasyTeam.name.toUpperCase()}
        </h1>
        {history.length > 0 && (
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className="font-display text-2xl font-black"
              style={{ color: "var(--primary)" }}
            >
              {totalPoints.toFixed(1)}
            </span>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              punti totali
            </span>
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
            Capitano:{" "}
            <span style={{ color: "#E8A000" }}>★ {fantasyTeam.captain.name}</span>
          </div>
          {/* Outfield row */}
          <div className="mb-2 flex flex-wrap justify-center gap-2">
            {outfield.map(({ player }) => (
              <PlayerChip
                key={player.id}
                name={player.name}
                team={player.footballTeam.shortName ?? player.footballTeam.name}
                isCaptain={player.id === fantasyTeam.captainPlayerId}
              />
            ))}
          </div>
          {/* Goalkeeper */}
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
        <p className="mt-2.5 text-[10px]" style={{ color: "var(--text-disabled)" }}>
          La rosa è bloccata. Solo un admin può modificarla.
        </p>
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
        <span
          className="mb-0.5 text-[9px] font-black uppercase tracking-wide"
          style={{ color: "#E8A000" }}
        >
          ★ CAP
        </span>
      )}
      <span className="font-display text-[11px] font-black uppercase leading-tight text-white">
        {name}
      </span>
      <span className="mt-0.5 text-[9px]" style={{ color: "rgba(255,255,255,0.5)" }}>
        {team}
      </span>
    </div>
  );
}
