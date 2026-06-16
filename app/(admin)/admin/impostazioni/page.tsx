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
        className="rounded-2xl px-5 py-4"
        style={{
          background: "#fff",
          border: "1px solid var(--border-soft)",
          boxShadow: "0 1px 4px rgba(9,20,76,0.06)",
        }}
      >
        <RegistrationToggle initialValue={registrationOpen} />
      </div>
    </div>
  );
}
