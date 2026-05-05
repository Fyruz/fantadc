"use client";

import { useActionState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { createVolleyTeam, updateVolleyTeam } from "@/app/actions/admin/volley";

type Team = { id: number; name: string };

export default function VolleyTeamForm({ team }: { team?: Team }) {
  const action = team
    ? updateVolleyTeam.bind(null, team.id)
    : createVolleyTeam;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="text-sm font-semibold" style={{ color: "var(--error, #dc2626)" }}>
          {state.error}
        </p>
      )}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Nome squadra *</label>
        <InputText
          name="name"
          defaultValue={team?.name ?? ""}
          required
          className="w-full"
          placeholder="es. GreenVolley Milano"
        />
      </div>
      <Button
        type="submit"
        label={team ? "Salva modifiche" : "Crea squadra"}
        loading={pending}
        style={{ background: "#3DD907", border: "none", color: "#fff" }}
      />
    </form>
  );
}
