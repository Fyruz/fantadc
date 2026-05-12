"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { adminSetPassword } from "@/app/actions/admin/users";

export default function AdminSetPasswordForm({ userId }: { userId: number }) {
  const [state, action, pending] = useActionState(adminSetPassword, undefined);
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    confirmPopup({
      target: e.currentTarget,
      message: "Impostare una nuova password per questo utente? La sessione attiva verrà invalidata.",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì",
      rejectLabel: "No",
      accept: () => formRef.current?.requestSubmit(),
    });
  };

  return (
    <>
    <ConfirmPopup />
    <form ref={formRef} action={action} className="flex flex-col gap-4 max-w-sm">
      <input type="hidden" name="userId" value={userId} />

      <div>
        <label
          className="block text-xs font-bold uppercase tracking-wide mb-1.5"
          style={{ color: "var(--text-muted)" }}
        >
          Nuova password{" "}
          <span
            className="font-normal normal-case tracking-normal"
            style={{ color: "var(--text-disabled)" }}
          >
            (min. 8 caratteri)
          </span>
        </label>
        <input type="hidden" name="newPassword" value={newPw} />
        <Password
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          feedback={false}
          toggleMask
          className="w-full"
          inputClassName="w-full"
          placeholder="••••••••"
          autoComplete="new-password"
        />
        {state?.errors?.newPassword && (
          <p className="text-xs mt-1" style={{ color: "#DC2626" }}>
            {state.errors.newPassword[0]}
          </p>
        )}
      </div>

      <div>
        <label
          className="block text-xs font-bold uppercase tracking-wide mb-1.5"
          style={{ color: "var(--text-muted)" }}
        >
          Conferma nuova password
        </label>
        <input type="hidden" name="confirmPassword" value={confirm} />
        <Password
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          feedback={false}
          toggleMask
          className="w-full"
          inputClassName="w-full"
          placeholder="••••••••"
          autoComplete="new-password"
        />
        {state?.errors?.confirmPassword && (
          <p className="text-xs mt-1" style={{ color: "#DC2626" }}>
            {state.errors.confirmPassword[0]}
          </p>
        )}
      </div>

      {state?.message && (
        <p
          className="text-sm font-semibold"
          style={{ color: state.errors ? "#DC2626" : "#065F46" }}
        >
          {state.message}
        </p>
      )}

      <div>
        <Button
          type="button"
          label={pending ? "Salvataggio..." : "Imposta password"}
          icon="pi pi-lock"
          severity="warning"
          disabled={pending}
          onClick={handleSubmit}
        />
      </div>
    </form>
    </>
  );
}
