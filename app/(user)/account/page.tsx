import Link from "next/link";
import { requireAuth } from "@/lib/session";
import ChangePasswordForm from "./_change-password-form";
import DeleteAccountForm from "./_delete-account-form";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  await requireAuth();

  return (
    <div className="flex flex-col gap-10 max-w-lg">
      {/* Header mobile */}
      <div className="md:hidden flex items-center justify-between h-12">
        <div className="flex-1 flex items-center">
          <Link href="/profilo" className="flex items-center justify-center w-6 h-6">
            <img src="/icons/chevron_left.svg" width={24} height={24} alt="Indietro" />
          </Link>
        </div>
        <span
          className="flex-1 text-center uppercase"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "#09144C" }}
        >
          Account
        </span>
        <div className="flex-1" />
      </div>

      {/* Cambia password */}
      <div
        className="bg-white rounded-3xl p-6 flex flex-col gap-6"
        style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
      >
        <h2
          className="text-base uppercase font-medium"
          style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
        >
          Cambia password
        </h2>
        <ChangePasswordForm />
      </div>

      {/* Zona pericolosa */}
      <div
        className="bg-white rounded-3xl p-6 flex flex-col gap-4"
        style={{ border: "1px solid rgba(239,68,68,0.3)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.06)" }}
      >
        <h2
          className="text-base uppercase font-medium"
          style={{ fontFamily: "var(--font-tallica)", color: "#DC2626" }}
        >
          Zona pericolosa
        </h2>
        <p className="text-sm text-black">
          La cancellazione dell&apos;account è permanente e non può essere annullata.
        </p>
        <DeleteAccountForm />
      </div>
    </div>
  );
}
