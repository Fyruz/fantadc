"use client";

import { useActionState } from "react";
import { createBonusType } from "@/app/actions/admin/bonus-types";

export default function NewBonusTypeForm() {
  const [state, action, pending] = useActionState(createBonusType, undefined);

  return (
    <form action={action} className="flex gap-2 items-end flex-wrap border-t pt-4 mt-4">
      <div>
        <label className="block text-xs font-medium mb-1 text-zinc-500">Codice *</label>
        <input name="code" placeholder="es. GOAL" className="input w-28 uppercase" required />
        {state?.errors?.code && <p className="text-red-500 text-xs mt-1">{state.errors.code[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-zinc-500">Nome *</label>
        <input name="name" placeholder="es. Gol" className="input w-40" required />
        {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-zinc-500">Punti *</label>
        <input name="points" type="number" step="0.5" placeholder="3" className="input w-20" required />
        {state?.errors?.points && <p className="text-red-500 text-xs mt-1">{state.errors.points[0]}</p>}
      </div>
      {state?.message && <p className="text-red-500 text-xs self-end">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "..." : "+ Aggiungi"}
      </button>
    </form>
  );
}
