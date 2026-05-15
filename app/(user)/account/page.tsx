import { requireAuth } from "@/lib/session";
import ChangePasswordForm from "./_change-password-form";
import DeleteAccountForm from "./_delete-account-form";

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

      <div
        className="card px-5 py-5"
        style={{ borderColor: "rgba(239,68,68,0.3)", borderWidth: 1, borderStyle: "solid" }}
      >
        <div className="over-label mb-1" style={{ color: "#DC2626" }}>Zona pericolosa</div>
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          La cancellazione dell&apos;account è permanente e non può essere annullata.
        </p>
        <DeleteAccountForm />
      </div>
    </div>
  );
}
