import { db } from "./db";

export type ReviewPromptPlayer = {
  id: number;
  name: string;
  footballTeam: {
    name: string;
    shortName: string | null;
    countryCode: string | null;
    logoUrl: string | null;
  };
};

export async function getReviewPromptPlayers(userId: number): Promise<ReviewPromptPlayer[]> {
  const fantasyTeam = await db.fantasyTeam.findUnique({
    where: { userId },
    select: {
      players: {
        select: {
          player: {
            select: {
              id: true,
              name: true,
              footballTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
            },
          },
        },
      },
    },
  });

  return fantasyTeam?.players.map((p) => p.player) ?? [];
}
