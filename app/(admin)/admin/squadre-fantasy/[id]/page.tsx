import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
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
      <AdminPageHeader title={fantasyTeam.name} backHref="/admin/squadre-fantasy" />
      <p className="text-sm text-[var(--text-secondary)] -mt-4">Proprietario: {fantasyTeam.user.email}</p>
      <RosterForm
        fantasyTeamId={fantasyTeamId}
        currentPlayerIds={currentPlayerIds}
        captainPlayerId={fantasyTeam.captainPlayerId}
        allPlayers={allPlayers}
      />
    </div>
  );
}
