"use client";

import { useActionState } from "react";
import { createPlayer } from "@/app/actions/admin/players";

type Team = { id: number; name: string };

export default function NuovoGiocatoreForm({ teams }: { teams: Team[] }) {
  const [state, action, pending] = useActionState(createPlayer, undefined);

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-6">Nuovo giocatore</h1>
      <form action={action} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <input name="name" className="input w-full" required />
          {state?.errors?.name && <p className="text-red-500 text-sm mt-1">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ruolo *</label>
          <select name="role" className="input w-full" required>
            <option value="">Seleziona ruolo</option>
            <option value="GK">Portiere (GK)</option>
            <option value="PLAYER">Giocatore</option>
          </select>
          {state?.errors?.role && <p className="text-red-500 text-sm mt-1">{state.errors.role[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Squadra reale *</label>
          <select name="footballTeamId" className="input w-full" required>
            <option value="">Seleziona squadra</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {state?.errors?.footballTeamId && <p className="text-red-500 text-sm mt-1">{state.errors.footballTeamId[0]}</p>}
        </div>
        {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Salvo..." : "Crea giocatore"}
        </button>
      </form>
    </div>
  );
}
