import AdminPageHeader from "@/components/admin-page-header";
import NuovaSquadraForm from "./_form";

export default function NuovaSquadraPage() {
  return (
    <div>
      <AdminPageHeader title="Nuova squadra reale" backHref="/admin/squadre" />
      <div className="admin-card p-5 max-w-lg">
        <NuovaSquadraForm />
      </div>
    </div>
  );
}
