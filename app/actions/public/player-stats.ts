"use server";

import { getPublicPlayerById } from "@/lib/data/public/players";

export async function fetchPlayerStats(playerId: number) {
  return getPublicPlayerById(playerId);
}
