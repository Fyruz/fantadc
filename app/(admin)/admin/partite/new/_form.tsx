"use client";

import { useActionState } from "react";
import { createMatch } from "@/app/actions/admin/matches";

type Team = { id: number; name: string };

export default function NuovaPartitaForm({ teams }: { teams: Team[] }) {
  const [state, action, pending] = useActionState(createMatch, undefined);

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-6">Nuova partita</h1>
      <form action={action} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Squadra casa *</label>
          <select name="homeTeamId" className="input w-full" required>
            <option value="">Seleziona squadra</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {state?.errors?.homeTeamId && <p className="text-red-500 text-sm mt-1">{state.errors.homeTeamId[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Squadra ospite *</label>
          <select name="awayTeamId" className="input w-full" required>
            <option value="">Seleziona squadra</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {state?.errors?.awayTeamId && <p className="text-red-500 text-sm mt-1">{state.errors.awayTeamId[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data e ora *</label>
          <input name="startsAt" type="datetime-local" className="input w-full" required />
          {state?.errors?.startsAt && <p className="text-red-500 text-sm mt-1">{state.errors.startsAt[0]}</p>}
        </div>
        {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Salvo..." : "Crea partita"}
        </button>
      </form>
    </div>
  );
}
