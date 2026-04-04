"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { deleteBonusType } from "@/app/actions/admin/bonus-types";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

type Row = { id: number; code: string; name: string; points: unknown };

export default function BonusTypesTable({ rows }: { rows: Row[] }) {
  return (
    <div className="admin-card overflow-hidden">
      <DataTable value={rows} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
        <Column field="code" header="Codice" sortable />
        <Column field="name" header="Nome" sortable />
        <Column
          header="Punti"
          body={(row: Row) => `${Number(row.points) > 0 ? "+" : ""}${Number(row.points)}`}
          sortable
          sortField="points"
        />
        <Column
          header=""
          body={(row: Row) => (
            <div className="flex items-center gap-2">
              <ConfirmDeleteForm
                action={deleteBonusType}
                hiddenInputs={{ id: row.id }}
                confirmMessage="Eliminare questo tipo bonus?"
              />
            </div>
          )}
        />
      </DataTable>
    </div>
  );
}
