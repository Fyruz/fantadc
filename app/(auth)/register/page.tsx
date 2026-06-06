"use client";

import { Suspense, useState } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { register } from "@/app/actions/auth";
import BackButton from "../_back-button";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);
  const searchParams = useSearchParams();
  const isGV = searchParams.get("from") === "greenvolley";
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className={`flex-1 flex flex-col px-4 py-6${isGV ? " gv-theme" : ""}`}>
      <BackButton />

      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-sm flex flex-col gap-6">

          <div
            className="rounded-3xl px-7 py-8"
            style={{
              background: "#fff",
              border: "1px solid rgba(9,20,76,0.05)",
              boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)",
            }}
          >
            <h1
              className="text-xl font-medium uppercase mb-6"
              style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
            >
              Registrati
            </h1>

            <form action={action} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }} htmlFor="name">
                  Nome o soprannome
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
                  Password{" "}
                  <span className="font-normal normal-case tracking-normal" style={{ color: "var(--text-disabled)" }}>(min. 8 caratteri)</span>
                </label>
                <Password
                  name="password"
                  autoComplete="new-password"
                  feedback={false}
                  toggleMask
                  className="w-full"
                  inputClassName="w-full"
                  placeholder="••••••••"
                />
                {state?.errors?.password && (
                  <p className="text-xs mt-1" style={{ color: "#DC2626" }}>{state.errors.password[0]}</p>
                )}
              </div>

              {state?.message && (
                <p className="text-sm" style={{ color: "#DC2626" }}>{state.message}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full flex items-center justify-center py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "var(--text-primary)" }}
              >
                {pending ? "Registrazione in corso..." : "Registrati"}
              </button>

              <p className="text-xs leading-5" style={{ color: "var(--text-disabled)" }}>
                Dopo la registrazione entrerai subito nell&apos;area personale.
              </p>
            </form>
          </div>

          <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Hai già un account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "var(--primary)" }}>
              Accedi
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
