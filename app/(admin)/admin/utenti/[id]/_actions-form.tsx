"use client";

import { useRef } from "react";
import { Button } from "primereact/button";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { suspendUser, unsuspendUser } from "@/app/actions/admin/users";

export default function UserActionsForm({ userId, isSuspended }: { userId: number; isSuspended: boolean }) {
  const suspendFormRef = useRef<HTMLFormElement>(null);

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

  return (
    <div className="flex gap-3">
      <ConfirmPopup />
      {isSuspended ? (
        <form action={unsuspendUser as unknown as (fd: FormData) => void}>
          <input type="hidden" name="userId" value={userId} />
          <Button type="submit" label="Riattiva utente" />
        </form>
      ) : (
        <form ref={suspendFormRef} action={suspendUser as unknown as (fd: FormData) => void}>
          <input type="hidden" name="userId" value={userId} />
          <Button
            type="button"
            label="Sospendi utente"
            severity="danger"
            onClick={handleSuspend}
          />
        </form>
      )}
    </div>
  );
}
