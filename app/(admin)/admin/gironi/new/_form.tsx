"use client";

import { useActionState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { createGroup } from "@/app/actions/admin/groups";

export default function NewGroupForm() {
  const [state, action, pending] = useActionState(createGroup, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Nome *
          </label>
          <InputText name="name" placeholder="es. Girone A" className="w-full" required />
          {state?.errors?.name && (
            <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.name[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Slug * (max 4 caratteri)
          </label>
          <InputText name="slug" placeholder="A" maxLength={4} className="w-full uppercase" required />
          {state?.errors?.slug && (
            <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.slug[0]}</p>
          )}
        </div>
      </div>

      <div className="w-32">
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Ordine
        </label>
        <InputText name="order" type="number" defaultValue="0" className="w-full" />
      </div>

      {state?.message && (
        <p className="text-xs" style={{ color: "#991B1B" }}>{state.message}</p>
      )}

      <div>
        <Button type="submit" label={pending ? "..." : "Crea girone"} disabled={pending} size="small" />
      </div>
    </form>
  );
}
