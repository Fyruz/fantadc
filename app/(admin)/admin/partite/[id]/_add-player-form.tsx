"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { addMatchPlayer } from "@/app/actions/admin/match-players";

type Player = { id: number; name: string; role: string; footballTeam: { name: string } };

export default function AddMatchPlayerForm({
  matchId,
  availablePlayers,
}: {
  matchId: number;
  availablePlayers: Player[];
}) {
  const [state, action, pending] = useActionState(addMatchPlayer, undefined);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");

  const playerOptions = availablePlayers.map((p) => ({
    label: `${p.name} (${p.role}) — ${p.footballTeam.name}`,
    value: String(p.id),
  }));

  return (
    <form action={action} className="flex gap-2 items-end flex-wrap">
      <input type="hidden" name="matchId" value={matchId} />
      <div>
        <label className="block text-xs font-medium mb-1 text-zinc-500">Aggiungi giocatore</label>
        <input type="hidden" name="playerId" value={selectedPlayerId} />
        <Dropdown
          value={selectedPlayerId}
          onChange={(e) => setSelectedPlayerId(e.value)}
          options={playerOptions}
          placeholder="Seleziona..."
          className="min-w-64"
        />
      </div>
      {state?.message && <p className="text-red-500 text-xs self-end">{state.message}</p>}
      <Button
        type="submit"
        label={pending ? "..." : "+ Aggiungi"}
        severity="secondary"
        size="small"
        disabled={pending}
      />
    </form>
  );
}
