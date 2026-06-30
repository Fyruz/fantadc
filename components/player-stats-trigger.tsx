"use client";

import { useState } from "react";
import { fetchPlayerStats } from "@/app/actions/public/player-stats";
import PlayerDialog from "./player-dialog";
import type { PublicPlayerGridRow } from "@/lib/data/public/players";

export default function PlayerStatsTrigger({
  playerId,
  children,
}: {
  playerId: number;
  children: React.ReactNode;
}) {
  const [player, setPlayer] = useState<PublicPlayerGridRow | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await fetchPlayerStats(playerId);
      if (data) setPlayer(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {player && <PlayerDialog player={player} onHide={() => setPlayer(null)} />}
      <button
        type="button"
        onClick={handleClick}
        style={{ display: "contents", cursor: "pointer" }}
        aria-label="Vedi statistiche giocatore"
      >
        {children}
      </button>
    </>
  );
}
