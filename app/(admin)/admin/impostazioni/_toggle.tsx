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
    <div className="flex items-center gap-4">
      <InputSwitch
        checked={value}
        onChange={(e) => handleChange(e.value ?? false)}
        disabled={pending}
      />
      <div>
        <p className="text-sm font-semibold" style={{ color: value ? "#16A34A" : "var(--text-muted)" }}>
          {value ? "Aperte" : "Chiuse"}
        </p>
        <p className="text-xs" style={{ color: "var(--text-disabled)" }}>
          {value
            ? "Chiunque può creare un nuovo account."
            : "La pagina di registrazione mostra un messaggio di chiusura."}
        </p>
      </div>
    </div>
  );
}
