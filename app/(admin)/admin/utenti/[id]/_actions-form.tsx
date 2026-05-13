"use client";

import { useRef, useState } from "react";
import { Button } from "primereact/button";
import ConfirmDialog from "@/components/confirm-dialog";
import { suspendUser, unsuspendUser, promoteToAdmin, demoteToUser } from "@/app/actions/admin/users";

export default function UserActionsForm({
  userId,
  isSuspended,
  isAdmin,
}: {
  userId: number;
  isSuspended: boolean;
  isAdmin: boolean;
}) {
  const suspendFormRef = useRef<HTMLFormElement>(null);
  const demoteFormRef = useRef<HTMLFormElement>(null);

  const [dialog, setDialog] = useState<{
    visible: boolean;
    message: string;
    confirmLabel: string;
    severity: "danger" | "warning";
    onConfirm: () => void;
  }>({ visible: false, message: "", confirmLabel: "Sì, confermo", severity: "danger", onConfirm: () => {} });

  const hide = () => setDialog((d) => ({ ...d, visible: false }));

  return (
    <div className="flex flex-wrap gap-3">
      <ConfirmDialog
        visible={dialog.visible}
        onHide={hide}
        onConfirm={dialog.onConfirm}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        severity={dialog.severity}
      />

      {/* Promozione / Retrocessione ruolo */}
      {isAdmin ? (
        <form ref={demoteFormRef} action={demoteToUser as unknown as (fd: FormData) => void}>
          <input type="hidden" name="userId" value={userId} />
          <Button
            type="button"
            label="Rimuovi admin"
            icon="pi pi-user-minus"
            severity="warning"
            onClick={() =>
              setDialog({
                visible: true,
                message: "Rimuovere i privilegi admin da questo utente?",
                confirmLabel: "Sì, rimuovi",
                severity: "warning",
                onConfirm: () => demoteFormRef.current?.requestSubmit(),
              })
            }
          />
        </form>
      ) : (
        <form action={promoteToAdmin as unknown as (fd: FormData) => void}>
          <input type="hidden" name="userId" value={userId} />
          <Button
            type="submit"
            label="Promuovi ad admin"
            icon="pi pi-user-plus"
          />
        </form>
      )}

      {/* Sospensione */}
      {isSuspended ? (
        <form action={unsuspendUser as unknown as (fd: FormData) => void}>
          <input type="hidden" name="userId" value={userId} />
          <Button type="submit" label="Riattiva utente" severity="secondary" icon="pi pi-check" />
        </form>
      ) : (
        <form ref={suspendFormRef} action={suspendUser as unknown as (fd: FormData) => void}>
          <input type="hidden" name="userId" value={userId} />
          <Button
            type="button"
            label="Sospendi utente"
            severity="danger"
            icon="pi pi-ban"
            onClick={() =>
              setDialog({
                visible: true,
                message: "Sospendere questo utente? Non potrà più accedere fino alla riattivazione.",
                confirmLabel: "Sì, sospendi",
                severity: "danger",
                onConfirm: () => suspendFormRef.current?.requestSubmit(),
              })
            }
          />
        </form>
      )}
    </div>
  );
}
