export type Player = {
  id: number;
  name: string;
  role: "P" | "A";
  footballTeam: { id: number; name: string; shortName: string | null };
};

export type SlotKey = "goalkeeper" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
export type SlotsState = Record<SlotKey, Player | null>;

export type PlayerGroup = {
  teamId: number;
  teamName: string;
  teamCode: string;
  players: Player[];
};

export const SLOT_ORDER: SlotKey[] = [
  "goalkeeper",
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
];

export const OUTFIELD_SLOTS: SlotKey[] = ["topLeft", "topRight", "bottomLeft", "bottomRight"];

export function getTeamCode(player: Player): string {
  return (player.footballTeam.shortName ?? player.footballTeam.name.slice(0, 3)).toUpperCase();
}
