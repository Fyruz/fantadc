import AdminPageHeader from "@/components/admin-page-header";
import VolleyTeamForm from "../_form";

export default function NuovaVolleySquadraPage() {
  return (
    <div>
      <AdminPageHeader accentColor="#0E3D2B"
        title="Nuova squadra"
        backHref="/admin/greenvolley/squadre"
      />
      <div className="admin-card p-5 max-w-lg">
        <VolleyTeamForm />
      </div>
    </div>
  );
}
