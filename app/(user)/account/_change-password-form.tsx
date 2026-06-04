"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Password } from "primereact/password";
import { changePassword } from "@/app/actions/account";

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");

  if (state?.success) {
    return (
      <div
        className="flex items-center gap-2 text-sm font-semibold"
        style={{ color: "#065F46" }}
      >
        <i className="pi pi-check-circle" />
        Password aggiornata con successo.
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5 max-w-sm">
      <div>
        <label
          className="block text-xs font-bold uppercase tracking-wide mb-1.5"
          style={{ color: "var(--text-muted)" }}
        >
          Password corrente
        </label>
        <input type="hidden" name="currentPassword" value={current} />
        <Password
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          feedback={false}
          toggleMask
          className="w-full"
          inputClassName="w-full"
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {state?.errors?.currentPassword && (
          <p className="text-xs mt-1" style={{ color: "#DC2626" }}>
            {state.errors.currentPassword[0]}
          </p>
        )}
      </div>

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
        <p className="text-sm" style={{ color: "#DC2626" }}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: "var(--text-primary)" }}
      >
        {pending ? "Salvataggio..." : "Aggiorna password"}
      </button>
    </form>
  );
}
