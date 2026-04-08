"use client";

import { useRef } from "react";
import { Button } from "primereact/button";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
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

  const handleSuspend = (e: React.MouseEvent<HTMLButtonElement>) => {
    confirmPopup({
      target: e.currentTarget,
      message: "Sospendere questo utente?",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì",
      rejectLabel: "No",
      accept: () => suspendFormRef.current?.requestSubmit(),
    });
  };

  const handleDemote = (e: React.MouseEvent<HTMLButtonElement>) => {
    confirmPopup({
      target: e.currentTarget,
      message: "Rimuovere i privilegi admin da questo utente?",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì",
      rejectLabel: "No",
      accept: () => demoteFormRef.current?.requestSubmit(),
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <ConfirmPopup />

      {/* Promozione / Retrocessione ruolo */}
      {isAdmin ? (
        <form ref={demoteFormRef} action={demoteToUser as unknown as (fd: FormData) => void}>
          <input type="hidden" name="userId" value={userId} />
          <Button
            type="button"
            label="Rimuovi admin"
            icon="pi pi-user-minus"
            severity="warning"
            onClick={handleDemote}
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
            onClick={handleSuspend}
          />
        </form>
      )}
    </div>
  );
}
