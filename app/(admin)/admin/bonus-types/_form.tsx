"use client";

import { useState } from "react";
import { useActionState } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { createBonusType } from "@/app/actions/admin/bonus-types";

export default function NewBonusTypeForm() {
  const [state, action, pending] = useActionState(createBonusType, undefined);
  const [points, setPoints] = useState<number>(0);

  return (
    <form action={action} className="flex gap-2 items-end flex-wrap border-t pt-4 mt-4">
      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1">Codice *</label>
        <InputText name="code" placeholder="es. GOAL" className="w-28 uppercase" required />
        {state?.errors?.code && <p className="text-red-500 text-xs mt-1">{state.errors.code[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1">Nome *</label>
        <InputText name="name" placeholder="es. Gol" className="w-40" required />
        {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1">Punti *</label>
        <input type="hidden" name="points" value={points} />
        <InputNumber
          value={points}
          onValueChange={(e) => setPoints(e.value ?? 0)}
          step={0.5}
          placeholder="3"
          className="w-20"
        />
        {state?.errors?.points && <p className="text-red-500 text-xs mt-1">{state.errors.points[0]}</p>}
      </div>
      {state?.message && <p className="text-red-500 text-xs self-end">{state.message}</p>}
      <Button type="submit" label={pending ? "..." : "+ Aggiungi"} disabled={pending} size="small" />
    </form>
  );
}
