"use client";

import { suspendUser, unsuspendUser } from "@/app/actions/admin/users";

export default function UserActionsForm({ userId, isSuspended }: { userId: number; isSuspended: boolean }) {
  return (
    <div className="flex gap-3">
      {isSuspended ? (
        <form action={unsuspendUser as unknown as (fd: FormData) => void}>
          <input type="hidden" name="userId" value={userId} />
          <button type="submit" className="btn-primary">Riattiva utente</button>
        </form>
      ) : (
        <form action={suspendUser as unknown as (fd: FormData) => void}>
          <input type="hidden" name="userId" value={userId} />
          <button
            type="submit"
            className="btn-danger"
            onClick={(e) => { if (!confirm("Sospendere questo utente?")) e.preventDefault(); }}
          >
            Sospendi utente
          </button>
        </form>
      )}
    </div>
  );
}
