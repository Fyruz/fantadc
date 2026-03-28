"use client";

import { useActionState } from "react";
import { createFootballTeam } from "@/app/actions/admin/football-teams";

export default function NuovaSquadraPage() {
  const [state, action, pending] = useActionState(createFootballTeam, undefined);

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-6">Nuova squadra reale</h1>
      <form action={action} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <input name="name" className="input w-full" required />
          {state?.errors?.name && <p className="text-red-500 text-sm mt-1">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Abbreviazione</label>
          <input name="shortName" className="input w-full" maxLength={5} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Logo URL</label>
          <input name="logoUrl" type="url" className="input w-full" />
          {state?.errors?.logoUrl && <p className="text-red-500 text-sm mt-1">{state.errors.logoUrl[0]}</p>}
        </div>
        {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Salvo..." : "Crea squadra"}
        </button>
      </form>
    </div>
  );
}
