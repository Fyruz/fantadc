"use client";

import { useActionState } from "react";
import { updateFootballTeam } from "@/app/actions/admin/football-teams";

type Props = { team: { id: number; name: string; shortName: string | null; logoUrl: string | null } };

export default function EditFootballTeamForm({ team }: Props) {
  const [state, action, pending] = useActionState(updateFootballTeam, undefined);

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-6">Modifica squadra</h1>
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={team.id} />
        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <input name="name" defaultValue={team.name} className="input w-full" required />
          {state?.errors?.name && <p className="text-red-500 text-sm mt-1">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Abbreviazione</label>
          <input name="shortName" defaultValue={team.shortName ?? ""} className="input w-full" maxLength={5} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Logo URL</label>
          <input name="logoUrl" type="url" defaultValue={team.logoUrl ?? ""} className="input w-full" />
        </div>
        {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Salvo..." : "Salva modifiche"}
        </button>
      </form>
    </div>
  );
}
