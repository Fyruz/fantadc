import AdminPageHeader from "@/components/admin-page-header";
import NewGroupForm from "./_form";

export default function NewGironeAdminPage() {
  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <AdminPageHeader title="Nuovo girone" backHref="/admin/gironi" />
      <div className="card p-5">
        <NewGroupForm />
      </div>
    </div>
  );
}
