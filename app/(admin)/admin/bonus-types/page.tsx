import { db } from "@/lib/db";
import NewBonusTypeForm from "./_form";
import BonusTypesTable from "./_table";

export default async function BonusTypesPage() {
  const bonusTypes = await db.bonusType.findMany({ orderBy: { code: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Tipi bonus</h1>
      <BonusTypesTable rows={bonusTypes} />
      <NewBonusTypeForm />
    </div>
  );
}
