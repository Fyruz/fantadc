"use client";

import { useState } from "react";
import { useActionState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { updateFootballTeam } from "@/app/actions/admin/football-teams";
import CountryCodeField from "@/components/admin/country-code-field";

type Props = {
  team: {
    id: number;
    name: string;
    shortName: string | null;
    countryCode: string | null;
    logoUrl: string | null;
  };
};

export default function EditFootballTeamForm({ team }: Props) {
  const [state, action, pending] = useActionState(updateFootballTeam, undefined);
  const [countryCode, setCountryCode] = useState(team.countryCode ?? "");

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={team.id} />
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Nome *</label>
        <InputText name="name" defaultValue={team.name} className="w-full" required />
        {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Abbreviazione</label>
        <InputText name="shortName" defaultValue={team.shortName ?? ""} className="w-full" maxLength={5} />
      </div>
      <CountryCodeField
        value={countryCode}
        onChange={setCountryCode}
        error={state?.errors?.countryCode?.[0]}
      />
      {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
      <Button type="submit" label={pending ? "Salvo..." : "Salva modifiche"} disabled={pending} />
    </form>
  );
}
