import { notFound } from "next/navigation";
import BackButton from "@/components/back-button";
import RoleBadge from "@/components/role-badge";
import { db } from "@/lib/db";
import { resolveTeamFlag } from "@/lib/flags";

export const revalidate = 60;

export default async function SquadraPublicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teamId = Number(id);

  if (!Number.isInteger(teamId) || teamId <= 0) notFound();

  const team = await db.footballTeam.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      name: true,
      shortName: true,
      countryCode: true,
      logoUrl: true,
      players: {
        orderBy: [{ role: "desc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!team) notFound();

  const flagSrc = resolveTeamFlag(team);
  const goalkeepers = team.players.filter((player) => player.role === "P");
  const outfield = team.players.filter((player) => player.role !== "P");

  return (
    <div className="flex flex-col gap-6">
      <div className="md:hidden flex items-center justify-between h-12">
        <div className="flex-1 flex items-center">
          <BackButton />
        </div>
        <span
          className="flex-1 text-center uppercase"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          Squadra
        </span>
        <div className="flex-1" />
      </div>

      <div
        className="rounded-[22px] p-5"
        style={{
          background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)",
          boxShadow: "0 6px 24px rgba(1,7,163,0.30)",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-2">
            {flagSrc ? (
              <img src={flagSrc} alt={team.name} className="h-full w-full object-contain" />
            ) : (
              <span className="font-display text-xl font-black uppercase" style={{ color: "var(--primary)" }}>
                {(team.shortName ?? team.name).slice(0, 2)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/50">
              Squadra reale
            </div>
            <h1 className="font-display text-2xl font-black uppercase leading-tight text-white">
              {team.name}
            </h1>
            <p className="mt-1 text-xs font-semibold text-white/60">
              {team.players.length} {team.players.length === 1 ? "giocatore" : "giocatori"}
            </p>
          </div>
        </div>
      </div>

      {team.players.length === 0 ? (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun giocatore presente.
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {goalkeepers.length > 0 && (
            <PlayerSection title="Portieri" players={goalkeepers} />
          )}
          {outfield.length > 0 && (
            <PlayerSection title="Attaccanti" players={outfield} />
          )}
        </div>
      )}
    </div>
  );
}

function PlayerSection({
  title,
  players,
}: {
  title: string;
  players: { id: number; name: string; role: string }[];
}) {
  return (
    <div>
      <div className="over-label mb-3">{title}</div>
      <div className="flex flex-col gap-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3"
          >
            <RoleBadge role={player.role} />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {player.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
