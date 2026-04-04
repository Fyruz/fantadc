"use client";

import { useActionState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { createFootballTeam } from "@/app/actions/admin/football-teams";

export default function NuovaSquadraForm() {
  const [state, action, pending] = useActionState(createFootballTeam, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Nome *</label>
        <InputText name="name" className="w-full" required />
        {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Abbreviazione</label>
        <InputText name="shortName" className="w-full" maxLength={5} />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Logo URL</label>
        <InputText name="logoUrl" type="url" className="w-full" />
        {state?.errors?.logoUrl && <p className="text-red-500 text-sm mt-1">{state.errors.logoUrl[0]}</p>}
      </div>
      {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
      <Button type="submit" label={pending ? "Salvo..." : "Crea squadra"} disabled={pending} />
    </form>
  );
}
