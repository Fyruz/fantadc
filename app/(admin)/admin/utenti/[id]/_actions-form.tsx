"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import ConfirmDialog from "@/components/confirm-dialog";
import DeleteAccountDialog from "@/components/delete-account-dialog";
import { suspendUser, unsuspendUser, promoteToAdmin, demoteToUser, adminDeleteUser } from "@/app/actions/admin/users";

export default function UserActionsForm({
  userId,
  isSuspended,
  isAdmin,
  userEmail,
}: {
  userId: number;
  isSuspended: boolean;
  isAdmin: boolean;
  userEmail: string;
}) {
  const router = useRouter();
  const suspendFormRef = useRef<HTMLFormElement>(null);
  const demoteFormRef = useRef<HTMLFormElement>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const [dialog, setDialog] = useState<{
    visible: boolean;
    message: string;
    confirmLabel: string;
    severity: "danger" | "warning";
    onConfirm: () => void;
  }>({ visible: false, message: "", confirmLabel: "Sì, confermo", severity: "danger", onConfirm: () => {} });

  const hide = () => setDialog((d) => ({ ...d, visible: false }));

  const handleDeleteConfirm = async (password: string) => {
    const fd = new FormData();
    fd.append("userId", String(userId));
    fd.append("password", password);
    const result = await adminDeleteUser(undefined, fd);
    if (result.error) return { error: result.error };
    router.push("/admin/utenti");
    return {};
  };

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

      <DeleteAccountDialog
        visible={deleteVisible}
        onHide={() => setDeleteVisible(false)}
        onConfirm={handleDeleteConfirm}
        description={`Eliminare definitivamente l'account di ${userEmail}? Inserisci la tua password admin per confermare. Questa azione è irreversibile.`}
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

      {/* Eliminazione — solo utenti non admin */}
      {!isAdmin && (
        <Button
          type="button"
          label="Elimina utente"
          severity="danger"
          outlined
          icon="pi pi-trash"
          onClick={() => setDeleteVisible(true)}
        />
      )}
    </div>
  );
}
