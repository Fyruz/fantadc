import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./_form";

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-[#0107A3]">
            ⚽ Fantadc
          </Link>
          <p className="text-[#6B7280] text-sm mt-1">Accedi al tuo account</p>
        </div>
        <div className="admin-card p-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="text-center text-sm text-[#6B7280] mt-4">
          Non hai un account?{" "}
          <Link href="/register" className="font-medium text-[#0107A3] hover:underline">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}
