import { requireAuth } from "@/lib/session";
import ChangePasswordForm from "./_change-password-form";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  await requireAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="font-display font-black text-2xl uppercase"
          style={{ color: "var(--text-primary)" }}
        >
          Account
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Gestisci le impostazioni del tuo account.
        </p>
      </div>

      <div className="card px-5 py-5">
        <div className="over-label mb-4">Cambia password</div>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
