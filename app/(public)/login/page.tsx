import { Suspense } from "react";
import LoginForm from "./_form";

export default function LoginPage() {
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
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Accedi al tuo account</p>
        </div>
        <div className="card p-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="text-center text-sm mt-4" style={{ color: "var(--text-muted)" }}>
          Non hai un account?{" "}
          <a href="/register" className="font-bold" style={{ color: "var(--primary)" }}>Registrati</a>
        </p>
      </div>
    </div>
  );
}
