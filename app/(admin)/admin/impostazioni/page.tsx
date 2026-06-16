import { getRegistrationOpen } from "@/lib/app-settings";
import AdminPageHeader from "@/components/admin-page-header";
import RegistrationToggle from "./_toggle";

export const dynamic = "force-dynamic";

export default async function ImpostazioniPage() {
  const registrationOpen = await getRegistrationOpen();

  return (
    <div>
      <AdminPageHeader title="Impostazioni" />

      <div
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{
          background: "#fff",
          border: "1px solid var(--border-soft)",
          boxShadow: "0 1px 4px rgba(9,20,76,0.06)",
        }}
      >
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Registrazione utenti
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Abilita o disabilita la creazione di nuovi account.
          </p>
        </div>
        <RegistrationToggle initialValue={registrationOpen} />
      </div>
    </div>
  );
}
