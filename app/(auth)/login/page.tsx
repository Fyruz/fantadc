import Link from "next/link";
import { Suspense } from "react";
import BackButton from "../_back-button";
import LoginForm from "./_form";

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col px-4 py-6">
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
              Accedi
            </h1>
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>

          <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Non hai un account?{" "}
            <Link href="/register" className="font-semibold" style={{ color: "var(--primary)" }}>
              Registrati
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
