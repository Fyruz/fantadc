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

export function getTeamCode(player: Player): string {
  return (player.footballTeam.shortName ?? player.footballTeam.name.slice(0, 3)).toUpperCase();
}

export function filterGroups(groups: PlayerGroup[], query: string): PlayerGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((g) => ({
      ...g,
      players: g.players.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          g.teamName.toLowerCase().includes(q) ||
          g.teamCode.toLowerCase().includes(q)
      ),
    }))
    .filter((g) => g.players.length > 0);
}
