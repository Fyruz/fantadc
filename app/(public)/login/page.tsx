import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./_form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold" style={{ color: "var(--primary)" }}>
            ⚽ Fantadc
          </Link>
          <p className="text-zinc-500 text-sm mt-1">Accedi al tuo account</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="text-center text-sm text-zinc-500 mt-6">
          Non hai un account?{" "}
          <Link href="/register" className="font-medium hover:underline" style={{ color: "var(--primary)" }}>
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}
