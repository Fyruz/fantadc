"use client";

import { useState, useTransition } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { setRegistrationOpenAction } from "@/app/actions/admin/settings";
import { useAppToast } from "@/components/toast-provider";

export default function RegistrationToggle({ initialValue }: { initialValue: boolean }) {
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();
  const { success, error } = useAppToast();

  function handleChange(newValue: boolean) {
    const prev = value;
    setValue(newValue);
    startTransition(async () => {
      const result = await setRegistrationOpenAction(newValue);
      if (result?.error) {
        error(result.error);
        setValue(prev);
      } else {
        success(newValue ? "Registrazioni aperte." : "Registrazioni chiuse.");
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Registrazione utenti
        </p>
        <p className="text-xs mt-0.5" style={{ color: value ? "#16A34A" : "var(--text-muted)" }}>
          {value ? "Aperte — chiunque può registrarsi." : "Chiuse — la pagina mostra un avviso."}
        </p>
      </div>
      <InputSwitch
        checked={value}
        onChange={(e) => handleChange(e.value ?? false)}
        disabled={pending}
        className="shrink-0"
      />
    </div>
  );
}
