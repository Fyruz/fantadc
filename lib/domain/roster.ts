import { PlayerRole } from "@prisma/client";

const ROSTER_SIZE = 5;
const REQUIRED_GK = 1;
const REQUIRED_PLAYERS = 4;

export type RosterPlayer = {
  playerId: number;
  role: PlayerRole;
  footballTeamId: number;
};

export type RosterValidationError =
  | "WRONG_SIZE"
  | "WRONG_GK_COUNT"
  | "WRONG_PLAYER_COUNT"
  | "DUPLICATE_TEAM"
  | "CAPTAIN_NOT_IN_ROSTER";

export function validateRoster(
  players: RosterPlayer[],
  captainPlayerId: number
): RosterValidationError | null {
  if (players.length !== ROSTER_SIZE) return "WRONG_SIZE";

  const gkCount = players.filter((p) => p.role === PlayerRole.GK).length;
  if (gkCount !== REQUIRED_GK) return "WRONG_GK_COUNT";

  const outfieldCount = players.filter((p) => p.role === PlayerRole.PLAYER).length;
  if (outfieldCount !== REQUIRED_PLAYERS) return "WRONG_PLAYER_COUNT";

  const teamIds = players.map((p) => p.footballTeamId);
  const uniqueTeamIds = new Set(teamIds);
  if (uniqueTeamIds.size !== ROSTER_SIZE) return "DUPLICATE_TEAM";

  const captainInRoster = players.some((p) => p.playerId === captainPlayerId);
  if (!captainInRoster) return "CAPTAIN_NOT_IN_ROSTER";

  return null;
}
