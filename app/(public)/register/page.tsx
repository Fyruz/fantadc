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
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold" style={{ color: "var(--primary)" }}>
            ⚽ Fantadc
          </Link>
          <p className="text-zinc-500 text-sm mt-1">Crea il tuo account</p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">Nome (opzionale)</label>
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
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
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
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Password <span className="text-zinc-400 font-normal">(min. 8 caratteri)</span>
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

        <p className="text-center text-sm text-zinc-500 mt-6">
          Hai già un account?{" "}
          <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--primary)" }}>
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
