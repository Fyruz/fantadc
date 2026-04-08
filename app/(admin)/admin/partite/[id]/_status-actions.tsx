"use client";

import { useRef } from "react";
import { useActionState } from "react";
import { Button } from "primereact/button";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { advanceMatchStatus } from "@/app/actions/admin/matches";

const STATUS_LABEL: Record<string, string> = {
  DRAFT:     "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
  PUBLISHED: "Pubblicata",
};

type NextAction = {
  label: string;
  newStatus: string;
  icon: string;
  confirmMsg: string;
};

const NEXT_ACTIONS: Record<string, NextAction[]> = {
  DRAFT: [{
    label: "Pianifica partita",
    newStatus: "SCHEDULED",
    icon: "pi pi-calendar",
    confirmMsg: "Segnare la partita come programmata?",
  }],
  SCHEDULED: [{
    label: "Concludi partita",
    newStatus: "CONCLUDED",
    icon: "pi pi-flag",
    confirmMsg: "Segnare la partita come conclusa? Si aprirà la finestra di voto MVP (1 ora).",
  }],
  CONCLUDED: [{
    label: "Pubblica risultati",
    newStatus: "PUBLISHED",
    icon: "pi pi-eye",
    confirmMsg: "Pubblicare i risultati? I punteggi diventeranno visibili a tutti.",
  }],
  PUBLISHED: [],
};

const BACK_ACTIONS: Record<string, { label: string; newStatus: string }> = {
  SCHEDULED: { label: "Riporta a Bozza",        newStatus: "DRAFT"     },
  CONCLUDED: { label: "Riporta a Programmata",  newStatus: "SCHEDULED" },
  PUBLISHED: { label: "Riporta a Conclusa",     newStatus: "CONCLUDED" },
};

export default function StatusActions({
  matchId,
  status,
  playerCount,
}: {
  matchId: number;
  status: string;
  playerCount: number;
}) {
  const [state, action, pending] = useActionState(advanceMatchStatus, undefined);
  const formRefs = useRef<Map<string, HTMLFormElement>>(new Map());

  const nextActions = NEXT_ACTIONS[status] ?? [];
  const backAction = BACK_ACTIONS[status];

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>, act: NextAction) => {
    confirmPopup({
      target: e.currentTarget,
      message: act.confirmMsg,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì, procedi",
      rejectLabel: "Annulla",
      accept: () => formRefs.current.get(act.newStatus)?.requestSubmit(),
    });
  };

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>, newStatus: string) => {
    confirmPopup({
      target: e.currentTarget,
      message: `Ripristinare lo stato a "${STATUS_LABEL[newStatus] ?? newStatus}"?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì",
      rejectLabel: "Annulla",
      accept: () => formRefs.current.get(`back_${newStatus}`)?.requestSubmit(),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <ConfirmPopup />

      {/* Main action */}
      {nextActions.map((act) => (
        <form
          key={act.newStatus}
          action={action}
          ref={(el) => { if (el) formRefs.current.set(act.newStatus, el); }}
        >
          <input type="hidden" name="matchId" value={matchId} />
          <input type="hidden" name="newStatus" value={act.newStatus} />
          <Button
            type="button"
            label={pending ? "In corso..." : act.label}
            icon={act.icon}
            disabled={pending}
            className="w-full"
            onClick={(e) => handleNext(e, act)}
          />
        </form>
      ))}

      {status === "PUBLISHED" && (
        <div
          className="rounded-xl px-4 py-3 text-sm flex items-start gap-2"
          style={{ background: "var(--primary-light)", color: "var(--primary)", border: "1px solid var(--border-medium)" }}
        >
          <i className="pi pi-check-circle text-sm mt-0.5 flex-shrink-0" />
          <span>Risultati pubblici. Le modifiche al punteggio si riflettono subito sulla classifica.</span>
        </div>
      )}

      {/* Warnings */}
      {status === "CONCLUDED" && playerCount === 0 && (
        <div
          className="rounded-xl px-4 py-3 text-sm flex items-start gap-2"
          style={{ background: "rgba(234,179,8,0.10)", color: "#92400E", border: "1px solid rgba(234,179,8,0.25)" }}
        >
          <i className="pi pi-exclamation-triangle text-sm mt-0.5 flex-shrink-0" />
          <span>Nessun giocatore aggiunto — aggiungi i partecipanti prima di pubblicare.</span>
        </div>
      )}

      {state?.message && (
        <p className="text-sm" style={{ color: "#991B1B" }}>{state.message}</p>
      )}

      {/* Back action */}
      {backAction && (
        <form
          action={action}
          ref={(el) => { if (el) formRefs.current.set(`back_${backAction.newStatus}`, el); }}
        >
          <input type="hidden" name="matchId" value={matchId} />
          <input type="hidden" name="newStatus" value={backAction.newStatus} />
          <Button
            type="button"
            label={backAction.label}
            severity="secondary"
            text
            size="small"
            disabled={pending}
            icon="pi pi-arrow-left"
            className="w-full"
            onClick={(e) => handleBack(e, backAction.newStatus)}
          />
        </form>
      )}
    </div>
  );
}
