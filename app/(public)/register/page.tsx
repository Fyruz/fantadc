"use client";

import { useState } from "react";
import { useActionState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { register } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mx-auto mb-3"
            style={{ background: "var(--primary)" }}
          >
            ⚽
          </div>
          <h1 className="font-display font-black text-2xl uppercase" style={{ color: "var(--text-primary)" }}>
            FANTA<span style={{ color: "var(--primary)" }}>DC</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Crea il tuo account</p>
        </div>

        <div className="card p-6">
          <form action={action} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }} htmlFor="name">Nome (opzionale)</label>
              <InputText
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="w-full"
                placeholder="Mario Rossi"
              />
              {state?.errors?.name && (
                <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }} htmlFor="email">Email</label>
              <InputText
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full"
                placeholder="la-tua@email.com"
              />
              {state?.errors?.email && (
                <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }} htmlFor="password">
                Password <span className="font-normal" style={{ color: "var(--text-muted)" }}>(min. 8 caratteri)</span>
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
                autoComplete="new-password"
              />
              {state?.errors?.password && (
                <p className="text-red-500 text-xs mt-1">{state.errors.password[0]}</p>
              )}
            </div>

            {state?.message && (
              <p className="text-red-500 text-sm">{state.message}</p>
            )}

            <Button
              type="submit"
              label={pending ? "Registrazione in corso..." : "Registrati"}
              disabled={pending}
              className="w-full py-2.5"
            />
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: "var(--text-muted)" }}>
          Hai già un account?{" "}
          <a href="/login" className="font-bold" style={{ color: "var(--primary)" }}>Accedi</a>
        </p>
      </div>
    </div>
  );
}
