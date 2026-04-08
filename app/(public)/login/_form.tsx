"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { login } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const registered = searchParams.get("registered") === "1";
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      {registered && (
        <div className="rounded-lg px-4 py-3 text-sm mb-4" style={{ background: "rgba(50,215,75,0.12)", color: "#32D74B", border: "1px solid rgba(50,215,75,0.24)" }}>
          Registrazione completata! Accedi con le tue credenziali.
        </div>
      )}

      <form action={action} className="flex flex-col gap-5">
        {next && <input type="hidden" name="next" value={next} />}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }} htmlFor="email">
            Email
          </label>
          <InputText
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full"
            placeholder="la-tua@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }} htmlFor="password">
            Password
          </label>
          <input type="hidden" name="password" value={password} />
          <Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            feedback={false}
            toggleMask
            className="w-full"
            inputClassName="w-full"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {state?.message && (
          <p className="text-sm" style={{ color: "#DC2626" }}>{state.message}</p>
        )}

        <Button
          type="submit"
          label={pending ? "Accesso in corso..." : "Accedi"}
          disabled={pending}
          className="w-full"
        />
      </form>
    </>
  );
}
