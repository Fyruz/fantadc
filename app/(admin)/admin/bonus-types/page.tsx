import { db } from "@/lib/db";
import NewBonusTypeForm from "./_form";
import BonusTypesTable from "./_table";
import AdminPageHeader from "@/components/admin-page-header";
export const dynamic = 'force-dynamic'


export default async function BonusTypesPage() {
  const bonusTypes = await db.bonusType.findMany({ orderBy: { code: "asc" } });

  return (
    <div>
      <AdminPageHeader title="Tipi bonus" />
      <div className="mb-4">
        <NewBonusTypeForm />
      </div>
      <BonusTypesTable rows={bonusTypes} />
    </div>
  );
}
