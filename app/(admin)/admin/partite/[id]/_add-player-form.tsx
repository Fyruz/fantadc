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
    label: `${p.name} (${p.role === "GK" ? "P" : "G"}) — ${p.footballTeam.name}`,
    value: String(p.id),
  }));

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "var(--surface-1)", border: "1px dashed var(--border-medium)" }}
    >
      <div className="over-label mb-3">Aggiungi giocatore</div>
      <form action={action} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="playerId" value={selectedPlayerId} />
        <div className="flex-1">
          <Dropdown
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.value)}
            options={playerOptions}
            placeholder="Seleziona giocatore..."
            className="w-full"
            filter
          />
        </div>
        <Button
          type="submit"
          label={pending ? "..." : "Aggiungi"}
          icon="pi pi-plus"
          severity="secondary"
          disabled={pending}
          className="flex-shrink-0"
        />
      </form>
      {state?.message && (
        <p className="text-xs mt-2" style={{ color: "#991B1B" }}>{state.message}</p>
      )}
    </div>
  );
}
