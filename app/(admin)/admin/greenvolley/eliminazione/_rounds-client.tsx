"use client";

import { useActionState, useTransition } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/confirm-dialog";
import { useAppToast } from "@/components/toast-provider";
import {
  createVolleyKnockoutRound,
  deleteVolleyKnockoutRound,
} from "@/app/actions/admin/volley";

type Round = { id: number; name: string; order: number; matchCount: number };

export default function KnockoutRoundsClient({ rounds }: { rounds: Round[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [order, setOrder] = useState<number | null>(null);
  const { error } = useAppToast();
  const [dialog, setDialog] = useState<{
    visible: boolean;
    message: string;
    onConfirm: () => void;
  }>({ visible: false, message: "", onConfirm: () => {} });
  const hideDialog = () => setDialog((d) => ({ ...d, visible: false }));
  const [state, formAction, pending] = useActionState(
    createVolleyKnockoutRound,
    undefined
  );

  return (
    <div className="flex flex-col gap-5">
      <ConfirmDialog
        visible={dialog.visible}
        onHide={hideDialog}
        onConfirm={dialog.onConfirm}
        message={dialog.message}
        severity="danger"
      />

      {/* Lista turni */}
      <div className="admin-card">
        <DataTable value={rounds} emptyMessage="Nessun turno">
          <Column field="order" header="Ordine" style={{ width: "80px" }} />
          <Column field="name" header="Nome" />
          <Column
            field="matchCount"
            header="Partite"
            style={{ width: "90px" }}
          />
          <Column
            header=""
            style={{ width: "80px" }}
            body={(row: Round) => (
              <Button
                icon="pi pi-trash"
                text
                size="small"
                severity="danger"
                disabled={row.matchCount > 0}
                title={
                  row.matchCount > 0
                    ? "Rimuovi prima le partite associate"
                    : "Elimina turno"
                }
                onClick={() =>
                  setDialog({
                    visible: true,
                    message: `Eliminare "${row.name}"?`,
                    onConfirm: () =>
                      startTransition(async () => {
                        try {
                          await deleteVolleyKnockoutRound(row.id);
                          router.refresh();
                        } catch {
                          error("Impossibile eliminare il turno.");
                        }
                      }),
                  })
                }
                loading={isPending}
                aria-label="Elimina"
              />
            )}
          />
        </DataTable>
      </div>

      {/* Form nuovo turno */}
      <div className="admin-card p-5 max-w-lg">
        <h3 className="font-black text-sm uppercase tracking-wide mb-4">
          Nuovo turno
        </h3>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--error, #dc2626)" }}
            >
              {state.error}
            </p>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Nome *</label>
            <InputText
              name="name"
              required
              className="w-full"
              placeholder="es. Semifinale, Finale"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Ordine *</label>
            <InputNumber
              value={order}
              onValueChange={(e) => setOrder(e.value ?? null)}
              min={1}
              placeholder="1"
              className="w-full"
            />
            <input type="hidden" name="order" value={order ?? ""} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              1 = primo turno, 2 = secondo, ecc.
            </span>
          </div>
          <Button
            type="submit"
            label="Crea turno"
            loading={pending}
            style={{ background: "#0E3D2B", border: "none", color: "#fff" }}
          />
        </form>
      </div>
    </div>
  );
}
