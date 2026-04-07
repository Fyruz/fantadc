import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./_form";

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm flex flex-col gap-8">

        {/* Header */}
        <div className="text-center">
          <Link href="/">
            <span className="font-display font-black text-4xl uppercase" style={{ color: "var(--text-primary)" }}>
              FANTA<span style={{ color: "var(--primary)" }}>DC</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl px-7 py-8"
          style={{
            background: "#fff",
            border: "1.5px solid var(--border-medium)",
            boxShadow: "0 4px 32px rgba(1,7,163,0.10)",
          }}
        >
          <h2
            className="font-display font-black text-2xl uppercase mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Accedi
          </h2>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Non hai un account?{" "}
          <Link href="/register" className="font-black" style={{ color: "var(--primary)" }}>
            Registrati
          </Link>
        </p>

      </div>
    </div>
  );
}
