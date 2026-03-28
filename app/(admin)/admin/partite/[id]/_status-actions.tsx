"use client";

import { useActionState } from "react";
import { advanceMatchStatus } from "@/app/actions/admin/matches";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
  PUBLISHED: "Pubblicata",
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "badge-draft",
  SCHEDULED: "badge-scheduled",
  CONCLUDED: "badge-concluded",
  PUBLISHED: "badge-published",
};

type NextAction = {
  label: string;
  newStatus: string;
  variant: string;
  confirmMsg: string;
};

const NEXT_ACTIONS: Record<string, NextAction[]> = {
  DRAFT: [
    {
      label: "Pianifica →",
      newStatus: "SCHEDULED",
      variant: "btn-secondary",
      confirmMsg: "Segnare la partita come programmata?",
    },
  ],
  SCHEDULED: [
    {
      label: "Concludi partita",
      newStatus: "CONCLUDED",
      variant: "btn-primary",
      confirmMsg: "Segnare la partita come conclusa? Si aprirà la finestra di voto MVP (1 ora).",
    },
  ],
  CONCLUDED: [
    {
      label: "Pubblica risultati",
      newStatus: "PUBLISHED",
      variant: "btn-primary",
      confirmMsg:
        "Pubblicare i risultati? I punteggi diventeranno visibili a tutti.",
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

  const nextActions = NEXT_ACTIONS[status] ?? [];
  const backAction = BACK_ACTIONS[status];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <span className={STATUS_BADGE[status] ?? "badge-draft"}>
          {STATUS_LABEL[status] ?? status}
        </span>

        {nextActions.map((act) => (
          <form key={act.newStatus} action={action}>
            <input type="hidden" name="matchId" value={matchId} />
            <input type="hidden" name="newStatus" value={act.newStatus} />
            <button
              type="submit"
              disabled={pending}
              className={act.variant}
              onClick={(e) => {
                if (!confirm(act.confirmMsg)) e.preventDefault();
              }}
            >
              {pending ? "..." : act.label}
            </button>
          </form>
        ))}

        {backAction && (
          <form action={action}>
            <input type="hidden" name="matchId" value={matchId} />
            <input type="hidden" name="newStatus" value={backAction.newStatus} />
            <button
              type="submit"
              disabled={pending}
              className="text-xs text-zinc-400 hover:text-zinc-600 underline"
              onClick={(e) => {
                if (
                  !confirm(
                    `Ripristinare lo stato a "${STATUS_LABEL[backAction.newStatus] ?? backAction.newStatus}"? Questa operazione è reversibile.`
                  )
                )
                  e.preventDefault();
              }}
            >
              {backAction.label}
            </button>
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
