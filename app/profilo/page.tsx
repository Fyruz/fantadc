import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import ProfiloLoggedIn from "./_logged-in";

export default async function ProfiloPage() {
  const user = await getCurrentUser();

  if (user) {
    return <ProfiloLoggedIn name={user.name ?? user.email ?? ""} isAdmin={user.role === "ADMIN"} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-6" style={{ background: "#fff" }}>
      <div className="w-full max-w-lg px-4 flex flex-col gap-10">

        <Link href="/" className="inline-flex items-center justify-center w-6 h-6">
          <i className="pi pi-chevron-left" style={{ fontSize: 12, color: "var(--text-primary)" }} />
        </Link>

        <div
          className="w-full rounded-3xl p-6 flex flex-col gap-4"
          style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
        >
          <h1
            className="uppercase text-base leading-snug"
            style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)", fontWeight: 500 }}
          >
            Ottieni altro dalla Danimarca&apos;s Cup
          </h1>
          <p className="text-sm text-black">Crea il tuo account e partecipa al fanta.</p>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="flex-1 flex items-center justify-center py-2 rounded-lg text-xs transition-opacity hover:opacity-80"
              style={{ border: "1px solid var(--text-primary)", color: "var(--text-primary)" }}
            >
              Accedi
            </Link>
            <Link
              href="/register"
              className="flex-1 flex items-center justify-center py-2 rounded-lg text-xs text-white transition-opacity hover:opacity-80"
              style={{ background: "var(--text-primary)" }}
            >
              Crea account
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/privacy" className="text-sm text-black hover:opacity-70 transition-opacity">Norme sulla privacy</Link>
          <Link href="/supporto" className="text-sm text-black hover:opacity-70 transition-opacity">Supporto app</Link>
        </div>

      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-[10px] text-black text-center">Abbiamo a cuore il calcio</p>
        <p className="text-[10px] text-center" style={{ color: "rgba(0,0,0,0.65)" }}>
          Copyright @ 2026 Danimarca&apos;s Cup - Versione app 1.0.0
        </p>
      </div>
    </div>
  );
}
