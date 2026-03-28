import { db } from "@/lib/db";
import NewBonusTypeForm from "./_form";
import BonusTypesTable from "./_table";
import AdminPageHeader from "@/components/admin-page-header";

export default async function BonusTypesPage() {
  const bonusTypes = await db.bonusType.findMany({ orderBy: { code: "asc" } });

  return (
    <div>
      <AdminPageHeader title="Tipi bonus" />
      <BonusTypesTable rows={bonusTypes} />
      <NewBonusTypeForm />
    </div>
  );
}
