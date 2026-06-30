import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { AUTH_ONBOARDING_PATH } from "@/lib/post-auth";
import { getActiveEditWindow } from "@/lib/roster-edit-window";
import ModificaSquadraForm from "./_form";

export default async function ModificaSquadraPage() {
  const user = await requireAuth();
  const userId = Number(user.id);

  const team = await db.fantasyTeam.findUnique({
    where: { userId },
    include: {
      players: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              role: true,
              footballTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
            },
          },
        },
      },
    },
  });
  if (!team) redirect(AUTH_ONBOARDING_PATH);

  const editWindow = await getActiveEditWindow();
  if (!editWindow) redirect("/squadra");

  const usage = await db.rosterEditUsage.findUnique({
    where: { windowId_fantasyTeamId: { windowId: editWindow.id, fantasyTeamId: team.id } },
    select: { baselinePlayerIds: true },
  });

  const currentRoster = team.players.map((tp) => tp.player);
  const baselinePlayerIds = usage
    ? (usage.baselinePlayerIds as number[])
    : currentRoster.map((p) => p.id);

  const players = await db.player.findMany({
    orderBy: [{ role: "asc" }, { footballTeam: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      role: true,
      footballTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } },
    },
  });

  return (
    <ModificaSquadraForm
      players={players}
      currentRoster={currentRoster}
      captainPlayerId={team.captainPlayerId}
      baselinePlayerIds={baselinePlayerIds}
      maxChanges={editWindow.maxChanges}
    />
  );
}
