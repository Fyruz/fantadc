"use client";

import { useActionState } from "react";
import { updatePlayer } from "@/app/actions/admin/players";

type Team = { id: number; name: string };
type Player = { id: number; name: string; role: string; footballTeamId: number };

export default function EditGiocatoreForm({ player, teams }: { player: Player; teams: Team[] }) {
  const [state, action, pending] = useActionState(updatePlayer, undefined);

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-6">Modifica giocatore</h1>
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={player.id} />
        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <input name="name" defaultValue={player.name} className="input w-full" required />
          {state?.errors?.name && <p className="text-red-500 text-sm mt-1">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ruolo *</label>
          <select name="role" defaultValue={player.role} className="input w-full" required>
            <option value="GK">Portiere (GK)</option>
            <option value="PLAYER">Giocatore</option>
          </select>
          {state?.errors?.role && <p className="text-red-500 text-sm mt-1">{state.errors.role[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Squadra reale *</label>
          <select name="footballTeamId" defaultValue={player.footballTeamId} className="input w-full" required>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {state?.errors?.footballTeamId && <p className="text-red-500 text-sm mt-1">{state.errors.footballTeamId[0]}</p>}
        </div>
        {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Salvo..." : "Salva modifiche"}
        </button>
      </form>
    </div>
  );
}
