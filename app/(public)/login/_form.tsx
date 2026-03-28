"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const registered = searchParams.get("registered") === "1";

  return (
    <>
      {registered && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 mb-4">
          Registrazione completata! Accedi con le tue credenziali.
        </div>
      )}

      <form action={action} className="flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input w-full"
            placeholder="la-tua@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="input w-full"
            placeholder="••••••••"
          />
        </div>

        {state?.message && (
          <p className="text-red-500 text-sm">{state.message}</p>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full py-2.5">
          {pending ? "Accesso in corso..." : "Accedi"}
        </button>
      </form>
    </>
  );
}
