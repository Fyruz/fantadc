"use client";

import { useRef } from "react";
import { useActionState } from "react";
import { Button } from "primereact/button";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { Tag } from "primereact/tag";
import { advanceMatchStatus } from "@/app/actions/admin/matches";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
  PUBLISHED: "Pubblicata",
};

const STATUS_SEVERITY: Record<string, "secondary" | "info" | "warning" | "success"> = {
  DRAFT: "secondary",
  SCHEDULED: "info",
  CONCLUDED: "warning",
  PUBLISHED: "success",
};

type NextAction = {
  label: string;
  newStatus: string;
  severity: "info" | "warning" | "success" | "secondary";
  confirmMsg: string;
};

const NEXT_ACTIONS: Record<string, NextAction[]> = {
  DRAFT: [
    {
      label: "Pianifica →",
      newStatus: "SCHEDULED",
      severity: "info",
      confirmMsg: "Segnare la partita come programmata?",
    },
  ],
  SCHEDULED: [
    {
      label: "Concludi partita",
      newStatus: "CONCLUDED",
      severity: "warning",
      confirmMsg: "Segnare la partita come conclusa? Si aprirà la finestra di voto MVP (1 ora).",
    },
  ],
  CONCLUDED: [
    {
      label: "Pubblica risultati",
      newStatus: "PUBLISHED",
      severity: "success",
      confirmMsg: "Pubblicare i risultati? I punteggi diventeranno visibili a tutti.",
    },
  ],
  PUBLISHED: [],
};

const BACK_ACTIONS: Record<string, { label: string; newStatus: string }> = {
  SCHEDULED: { label: "← Bozza", newStatus: "DRAFT" },
  CONCLUDED: { label: "← Programmata", newStatus: "SCHEDULED" },
  PUBLISHED: { label: "← Conclusa", newStatus: "CONCLUDED" },
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

  const handleNextAction = (e: React.MouseEvent<HTMLButtonElement>, act: NextAction) => {
    confirmPopup({
      target: e.currentTarget,
      message: act.confirmMsg,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì",
      rejectLabel: "No",
      accept: () => formRefs.current.get(act.newStatus)?.requestSubmit(),
    });
  };

  const handleBackAction = (e: React.MouseEvent<HTMLButtonElement>, newStatus: string) => {
    confirmPopup({
      target: e.currentTarget,
      message: `Ripristinare lo stato a "${STATUS_LABEL[newStatus] ?? newStatus}"? Questa operazione è reversibile.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì",
      rejectLabel: "No",
      accept: () => formRefs.current.get(`back_${newStatus}`)?.requestSubmit(),
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <ConfirmPopup />
      <div className="flex items-center gap-3 flex-wrap">
        <Tag
          value={STATUS_LABEL[status] ?? status}
          severity={STATUS_SEVERITY[status] ?? "secondary"}
        />

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
              label={pending ? "..." : act.label}
              severity={act.severity}
              size="small"
              disabled={pending}
              onClick={(e) => handleNextAction(e, act)}
            />
          </form>
        ))}

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
              onClick={(e) => handleBackAction(e, backAction.newStatus)}
            />
          </form>
        )}
      </div>

      {state?.message && (
        <p className="text-red-500 text-sm">{state.message}</p>
      )}

      {status === "CONCLUDED" && playerCount === 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded px-3 py-2 text-sm text-orange-700">
          ⚠ Nessun giocatore aggiunto — aggiungi i partecipanti prima di pubblicare i risultati.
        </div>
      )}

      {status === "PUBLISHED" && (
        <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs text-blue-700">
          ℹ I punteggi sono pubblici. Qualsiasi modifica a bonus o giocatori si rifletterà immediatamente sulla classifica.
        </div>
      )}
    </div>
  );
}
