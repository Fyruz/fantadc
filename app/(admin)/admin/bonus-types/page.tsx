import { db } from "@/lib/db";
import { deleteBonusType } from "@/app/actions/admin/bonus-types";
import NewBonusTypeForm from "./_form";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

export default async function BonusTypesPage() {
  const bonusTypes = await db.bonusType.findMany({ orderBy: { code: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Tipi bonus</h1>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left text-zinc-500">
            <th className="py-2 pr-4">Codice</th>
            <th className="py-2 pr-4">Nome</th>
            <th className="py-2 pr-4">Punti</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {bonusTypes.map((bt) => (
            <tr key={bt.id} className="border-b hover:bg-zinc-50">
              <td className="py-2 pr-4 font-mono font-medium">{bt.code}</td>
              <td className="py-2 pr-4">{bt.name}</td>
              <td className="py-2 pr-4">{Number(bt.points) > 0 ? "+" : ""}{Number(bt.points)}</td>
              <td className="py-2">
                <ConfirmDeleteForm
                  action={deleteBonusType}
                  hiddenInputs={{ id: bt.id }}
                  confirmMessage="Eliminare questo tipo bonus?"
                />
              </td>
            </tr>
          ))}
          {bonusTypes.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-zinc-400">Nessun tipo bonus</td></tr>}
        </tbody>
      </table>
      <NewBonusTypeForm />
    </div>
  );
}
