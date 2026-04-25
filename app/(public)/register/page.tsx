"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { register } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm flex flex-col gap-8">

        <div className="text-center">
          <Link href="/">
            <span className="font-display font-black text-4xl uppercase" style={{ color: "var(--text-primary)" }}>
              FANTA<span style={{ color: "var(--primary)" }}>DC</span>
            </span>
          </Link>
        </div>

        <div
          className="rounded-3xl px-7 py-8"
          style={{
            background: "#fff",
            border: "1.5px solid var(--border-medium)",
            boxShadow: "0 4px 32px rgba(1,7,163,0.10)",
          }}
        >
          <h2 className="font-display font-black text-2xl uppercase mb-6" style={{ color: "var(--text-primary)" }}>
            Registrati
          </h2>

          <form action={action} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }} htmlFor="name">
                Nome
              </label>
              <InputText
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="w-full"
                placeholder="Mario Rossi"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {state?.errors?.name && (
                <p className="text-xs mt-1" style={{ color: "#DC2626" }}>{state.errors.name[0]}</p>
              )}
            </div>

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
              {state?.errors?.email && (
                <p className="text-xs mt-1" style={{ color: "#DC2626" }}>{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }} htmlFor="password">
                Password <span className="font-normal normal-case tracking-normal" style={{ color: "var(--text-disabled)" }}>(min. 8 caratteri)</span>
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
                <p className="text-xs mt-1" style={{ color: "#DC2626" }}>{state.errors.password[0]}</p>
              )}
            </div>

            {state?.message && (
              <p className="text-sm" style={{ color: "#DC2626" }}>{state.message}</p>
            )}

            <Button
              type="submit"
              label={pending ? "Registrazione in corso..." : "Registrati"}
              disabled={pending}
              className="w-full"
            />

            <p className="text-xs leading-5" style={{ color: "var(--text-disabled)" }}>
              Dopo la registrazione entrerai subito nell&apos;area personale.
            </p>
          </form>
        </div>

        <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Hai già un account?{" "}
          <Link href="/login" className="font-black" style={{ color: "var(--primary)" }}>
            Accedi
          </Link>
        </p>

      </div>
    </div>
  );
}
