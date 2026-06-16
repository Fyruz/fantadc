import Link from "next/link";
import { getRegistrationOpen } from "@/lib/app-settings";
import RegisterForm from "./_form";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const registrationOpen = await getRegistrationOpen();

  if (!registrationOpen) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div
            className="rounded-3xl px-7 py-10 flex flex-col items-center gap-4 text-center"
            style={{
              background: "#fff",
              border: "1px solid rgba(9,20,76,0.05)",
              boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)",
            }}
          >
            <i className="pi pi-lock text-3xl" style={{ color: "var(--text-muted)" }} />
            <h1
              className="text-xl font-medium uppercase"
              style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
            >
              Registrazioni chiuse
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Le registrazioni sono temporaneamente chiuse. Riprova più tardi.
            </p>
          </div>

          <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Hai già un account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "var(--primary)" }}>
              Accedi
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return <RegisterForm />;
}
