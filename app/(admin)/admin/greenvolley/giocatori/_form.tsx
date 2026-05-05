"use client";

import { useActionState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useState } from "react";
import { createVolleyPlayer, updateVolleyPlayer } from "@/app/actions/admin/volley";

type Team = { id: number; name: string };
type Player = { id: number; name: string; teamId: number };

export default function VolleyPlayerForm({
  player,
  teams,
}: {
  player?: Player;
  teams: Team[];
}) {
  const action = player
    ? updateVolleyPlayer.bind(null, player.id)
    : createVolleyPlayer;
  const [state, formAction, pending] = useActionState(action, undefined);
  const [teamId, setTeamId] = useState<number | null>(player?.teamId ?? null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="text-sm font-semibold" style={{ color: "var(--error, #dc2626)" }}>
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Nome giocatore *</label>
        <InputText
          name="name"
          defaultValue={player?.name ?? ""}
          required
          className="w-full"
          placeholder="Nome Cognome"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Squadra *</label>
        <Dropdown
          options={teams}
          optionLabel="name"
          optionValue="id"
          value={teamId}
          onChange={(e) => setTeamId(e.value)}
          placeholder="Seleziona squadra"
          className="w-full"
        />
        {/* hidden input per il form action */}
        <input type="hidden" name="teamId" value={teamId ?? ""} />
      </div>

      <Button
        type="submit"
        label={player ? "Salva modifiche" : "Crea giocatore"}
        loading={pending}
        style={{ background: "#3DD907", border: "none", color: "#fff" }}
      />
    </form>
  );
}
