"use client";

import { useActionState, useTransition } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/confirm-dialog";
import { useAppToast } from "@/components/toast-provider";
import { createVolleyPlayerForTeam, removeVolleyPlayerById } from "@/app/actions/admin/volley";

type Player = { id: number; name: string };

const GV = "#3DD907";

export default function TeamPlayersSection({
  teamId,
  players,
}: {
  teamId: number;
  players: Player[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { error } = useAppToast();
  const [dialog, setDialog] = useState<{
    visible: boolean;
    message: string;
    onConfirm: () => void;
  }>({ visible: false, message: "", onConfirm: () => {} });
  const hideDialog = () => setDialog((d) => ({ ...d, visible: false }));

  const addAction = createVolleyPlayerForTeam.bind(null, teamId);
  const [state, formAction, addPending] = useActionState(addAction, undefined);

  return (
    <div className="flex flex-col gap-3">
      <ConfirmDialog
        visible={dialog.visible}
        onHide={hideDialog}
        onConfirm={dialog.onConfirm}
        message={dialog.message}
        severity="danger"
      />

      {/* Lista giocatori */}
      <div className="admin-card overflow-hidden">
        {players.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Nessun giocatore in questa squadra.
          </p>
        ) : (
          players.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-1)] transition-colors"
              style={idx < players.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: GV }}
              />
              <span className="flex-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {p.name}
              </span>
              <Button
                icon="pi pi-times"
                text
                size="small"
                severity="danger"
                loading={isPending}
                onClick={() =>
                  setDialog({
                    visible: true,
                    message: `Rimuovere "${p.name}" dalla squadra?`,
                    onConfirm: () =>
                      startTransition(async () => {
                        try {
                          await removeVolleyPlayerById(p.id);
                          router.refresh();
                        } catch {
                          error("Impossibile rimuovere il giocatore.");
                        }
                      }),
                  })
                }
                aria-label="Rimuovi giocatore"
              />
            </div>
          ))
        )}
      </div>

      {/* Form aggiungi giocatore */}
      <div className="admin-card p-4">
        <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: GV }}>
          Aggiungi giocatore
        </h3>
        {state?.error && (
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--error, #dc2626)" }}>
            {state.error}
          </p>
        )}
        <form action={formAction} className="flex gap-2">
          <InputText
            name="name"
            placeholder="Nome giocatore"
            className="flex-1"
            required
          />
          <Button
            type="submit"
            icon="pi pi-plus"
            loading={addPending}
            style={{ background: GV, border: "none", color: "#fff" }}
            aria-label="Aggiungi"
          />
        </form>
      </div>
    </div>
  );
}
