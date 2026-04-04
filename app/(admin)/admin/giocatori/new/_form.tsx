"use client";

import { useState } from "react";
import { useActionState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { createPlayer } from "@/app/actions/admin/players";

type Team = { id: number; name: string };

const ROLE_OPTIONS = [
  { label: "Portiere", value: "P" },
  { label: "Giocatore", value: "A" },
];

export default function NuovoGiocatoreForm({ teams }: { teams: Team[] }) {
  const [state, action, pending] = useActionState(createPlayer, undefined);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  const teamOptions = teams.map((t) => ({ label: t.name, value: String(t.id) }));

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Nome *</label>
        <InputText name="name" className="w-full" required />
        {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Ruolo *</label>
        <input type="hidden" name="role" value={selectedRole} />
        <Dropdown
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.value)}
          options={ROLE_OPTIONS}
          placeholder="Seleziona ruolo"
          className="w-full"
        />
        {state?.errors?.role && <p className="text-red-500 text-xs mt-1">{state.errors.role[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Squadra reale *</label>
        <input type="hidden" name="footballTeamId" value={selectedTeamId} />
        <Dropdown
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.value)}
          options={teamOptions}
          placeholder="Seleziona squadra"
          className="w-full"
        />
        {state?.errors?.footballTeamId && <p className="text-red-500 text-xs mt-1">{state.errors.footballTeamId[0]}</p>}
      </div>
      {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
      <Button type="submit" label={pending ? "Salvo..." : "Crea giocatore"} disabled={pending} />
    </form>
  );
}
