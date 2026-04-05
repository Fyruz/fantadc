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
    <form action={action} className="flex flex-col gap-4 pt-4 mt-4" style={{ borderTop: "1px solid var(--border-soft)" }}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Codice *
          </label>
          <InputText name="code" placeholder="es. GOAL" className="w-full uppercase" required />
          {state?.errors?.code && (
            <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.code[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Nome *
          </label>
          <InputText name="name" placeholder="es. Gol" className="w-full" required />
          {state?.errors?.name && (
            <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.name[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Punti *
          </label>
          <input type="hidden" name="points" value={points} />
          <InputNumber
            value={points}
            onValueChange={(e) => setPoints(e.value ?? 0)}
            step={0.5}
            placeholder="3"
            className="w-full"
          />
          {state?.errors?.points && (
            <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.points[0]}</p>
          )}
        </div>
      </div>
      {state?.message && (
        <p className="text-xs" style={{ color: "#991B1B" }}>{state.message}</p>
      )}
      <div>
        <Button type="submit" label={pending ? "..." : "Aggiungi tipo bonus"} disabled={pending} size="small" />
      </div>
    </form>
  );
}
