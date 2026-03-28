"use client";

import { useState } from "react";
import { useActionState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { updatePlayer } from "@/app/actions/admin/players";

type Team = { id: number; name: string };
type Player = { id: number; name: string; role: string; footballTeamId: number };

const ROLE_OPTIONS = [
  { label: "Portiere (GK)", value: "GK" },
  { label: "Giocatore", value: "PLAYER" },
];

export default function EditGiocatoreForm({ player, teams }: { player: Player; teams: Team[] }) {
  const [state, action, pending] = useActionState(updatePlayer, undefined);
  const [selectedRole, setSelectedRole] = useState<string>(player.role);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(String(player.footballTeamId));

  const teamOptions = teams.map((t) => ({ label: t.name, value: String(t.id) }));

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-6">Modifica giocatore</h1>
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={player.id} />
        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <InputText name="name" defaultValue={player.name} className="w-full" required />
          {state?.errors?.name && <p className="text-red-500 text-sm mt-1">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ruolo *</label>
          <input type="hidden" name="role" value={selectedRole} />
          <Dropdown
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.value)}
            options={ROLE_OPTIONS}
            placeholder="Seleziona ruolo"
            className="w-full"
          />
          {state?.errors?.role && <p className="text-red-500 text-sm mt-1">{state.errors.role[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Squadra reale *</label>
          <input type="hidden" name="footballTeamId" value={selectedTeamId} />
          <Dropdown
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.value)}
            options={teamOptions}
            placeholder="Seleziona squadra"
            className="w-full"
          />
          {state?.errors?.footballTeamId && <p className="text-red-500 text-sm mt-1">{state.errors.footballTeamId[0]}</p>}
        </div>
        {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
        <Button type="submit" label={pending ? "Salvo..." : "Salva modifiche"} disabled={pending} />
      </form>
    </div>
  );
}
