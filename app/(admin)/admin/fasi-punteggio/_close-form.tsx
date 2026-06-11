"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { closeScoringPhaseAction } from "@/app/actions/admin/scoring-phases";
import { useAppToast } from "@/components/toast-provider";

export default function ClosePhaseForm() {
  const [state, action, pending] = useActionState(closeScoringPhaseAction, undefined);
  const [name, setName] = useState("");
  const { success, error } = useAppToast();
  const submitted = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!submitted.current) return;
    if (state?.message && !state.errors) {
      success(state.message);
      setName("");
      submitted.current = false;
    } else if (state?.errors) {
      submitted.current = false;
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  function confirmClose(e: React.MouseEvent) {
    if (!name.trim()) {
      error("Inserisci il nome della fase.");
      return;
    }
    confirmPopup({
      target: e.currentTarget as HTMLElement,
      message: `Chiudere la fase "${name.trim()}" e congelare i punti attuali?`,
      icon: "pi pi-flag",
      acceptLabel: "Chiudi fase",
      rejectLabel: "Annulla",
      accept: () => {
        submitted.current = true;
        formRef.current?.requestSubmit();
      },
    });
  }

  return (
    <>
      <ConfirmPopup />
      <form ref={formRef} action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <input type="hidden" name="name" value={name} />
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Nome fase *
          </label>
          <InputText
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="es. Fase gironi"
            className="w-full"
          />
          {state?.errors?.name && <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.name[0]}</p>}
        </div>
        <Button
          type="button"
          label={pending ? "Chiudo..." : "Chiudi fase ora"}
          icon="pi pi-flag"
          disabled={pending}
          onClick={confirmClose}
        />
      </form>
    </>
  );
}
