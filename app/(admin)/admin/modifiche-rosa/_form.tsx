"use client";

import { useActionState, useState } from "react";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { setRosterEditWindow, closeRosterEditWindow } from "@/app/actions/admin/roster-edit-window";

export default function WindowForm({
  opensAt,
  closesAt,
  maxChanges,
  isActive,
}: {
  opensAt: Date | null;
  closesAt: Date | null;
  maxChanges: number;
  isActive: boolean;
}) {
  const [state, action, pending] = useActionState(setRosterEditWindow, undefined);
  const [opens, setOpens] = useState<Date | null>(opensAt);
  const [closes, setCloses] = useState<Date | null>(closesAt);
  const [max, setMax] = useState<number>(maxChanges);
  const [closing, setClosing] = useState(false);

  async function handleClose(e: React.MouseEvent) {
    confirmPopup({
      target: e.currentTarget as HTMLElement,
      message: "Chiudere subito la finestra di modifica?",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Chiudi",
      rejectLabel: "Annulla",
      accept: async () => {
        setClosing(true);
        await closeRosterEditWindow();
        setClosing(false);
      },
    });
  }

  return (
    <>
      <ConfirmPopup />
      <form action={action} className="flex flex-col gap-5">
        <input type="hidden" name="opensAt" value={opens ? opens.toISOString() : ""} />
        <input type="hidden" name="closesAt" value={closes ? closes.toISOString() : ""} />
        <input type="hidden" name="maxChanges" value={Number.isFinite(max) ? String(max) : ""} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Apertura *
            </label>
            <Calendar
              value={opens}
              onChange={(e) => setOpens((e.value as Date | null) ?? null)}
              showTime
              hourFormat="24"
              dateFormat="dd/mm/yy"
              stepMinute={5}
              showIcon
              className="w-full"
              inputClassName="w-full"
            />
            {state?.errors?.opensAt && (
              <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.opensAt[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Chiusura *
            </label>
            <Calendar
              value={closes}
              onChange={(e) => setCloses((e.value as Date | null) ?? null)}
              showTime
              hourFormat="24"
              dateFormat="dd/mm/yy"
              stepMinute={5}
              showIcon
              className="w-full"
              inputClassName="w-full"
            />
            {state?.errors?.closesAt && (
              <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.closesAt[0]}</p>
            )}
          </div>
        </div>

        <div className="max-w-xs">
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Numero massimo di cambi (giocatori)
          </label>
          <InputNumber
            value={max}
            onValueChange={(e) => setMax(e.value ?? 0)}
            min={0}
            max={5}
            showButtons
            className="w-full"
            inputClassName="w-full"
          />
          {state?.errors?.maxChanges && (
            <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.maxChanges[0]}</p>
          )}
          <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            Il cambio di capitano è sempre consentito e non consuma cambi.
          </p>
        </div>

        {state?.message && (
          <p className="text-sm font-medium" style={{ color: state.message === "Finestra salvata." ? "#065F46" : "#991B1B" }}>
            {state.message}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" label={pending ? "Salvo..." : "Salva finestra"} disabled={pending} icon="pi pi-check" />
          {isActive && (
            <Button
              type="button"
              label={closing ? "Chiudo..." : "Chiudi ora"}
              disabled={closing}
              severity="danger"
              outlined
              icon="pi pi-times"
              onClick={handleClose}
            />
          )}
        </div>
      </form>
    </>
  );
}
