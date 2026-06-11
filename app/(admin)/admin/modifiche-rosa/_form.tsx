"use client";

import { useActionState, useState } from "react";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
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
  const [saveSnapshot, setSaveSnapshot] = useState(false);
  const [phaseName, setPhaseName] = useState("");

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
        <input type="hidden" name="saveScoringSnapshot" value={saveSnapshot ? "true" : "false"} />
        <input type="hidden" name="phaseName" value={phaseName} />

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

        {/* Salva storico punteggio (chiudi fase corrente) */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setSaveSnapshot((v) => !v)}
            className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors max-w-md"
            style={{
              borderColor: saveSnapshot ? "rgba(232,160,0,0.45)" : "var(--border-soft)",
              background: saveSnapshot ? "rgba(232,160,0,0.08)" : "#fff",
            }}
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border"
              style={{
                borderColor: saveSnapshot ? "#E8A000" : "var(--border-medium)",
                background: saveSnapshot ? "#E8A000" : "#fff",
              }}
            >
              {saveSnapshot && <i className="pi pi-check text-[11px]" style={{ color: "#06073D" }} />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Salva storico punteggio
              </span>
              <span className="block text-xs" style={{ color: "var(--text-muted)" }}>
                Congela i punti attuali come fase chiusa, prima dei cambi rosa
              </span>
            </span>
          </button>
          {saveSnapshot && (
            <div className="max-w-xs">
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Nome fase *
              </label>
              <InputText
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                placeholder="es. Fase gironi"
                className="w-full"
              />
              {state?.errors?.phaseName && (
                <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.phaseName[0]}</p>
              )}
            </div>
          )}
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
