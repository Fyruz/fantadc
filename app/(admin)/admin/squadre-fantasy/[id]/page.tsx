import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import RosterForm from "./_roster-form";

export default async function SquadraFantasyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fantasyTeamId = Number(id);

  const [fantasyTeam, allPlayers] = await Promise.all([
    db.fantasyTeam.findUnique({
      where: { id: fantasyTeamId },
      include: {
        user: { select: { email: true } },
        players: { select: { playerId: true } },
      },
    }),
    db.player.findMany({
      orderBy: [{ footballTeam: { name: "asc" } }, { name: "asc" }],
      include: { footballTeam: { select: { name: true } } },
    }),
  ]);

  if (!fantasyTeam) notFound();

  const currentPlayerIds = fantasyTeam.players.map((p) => p.playerId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold mb-1">{fantasyTeam.name}</h1>
        <p className="text-sm text-zinc-500">Proprietario: {fantasyTeam.user.email}</p>
      </div>
      <RosterForm
        fantasyTeamId={fantasyTeamId}
        currentPlayerIds={currentPlayerIds}
        captainPlayerId={fantasyTeam.captainPlayerId}
        allPlayers={allPlayers}
      />
    </div>
  );
}
