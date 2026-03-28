"use client";

import Link from "next/link";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { deleteFootballTeam } from "@/app/actions/admin/football-teams";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

type Row = { id: number; name: string; shortName: string | null };

export default function SquadreTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable value={rows} stripedRows paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
      <Column field="name" header="Nome" sortable />
      <Column
        field="shortName"
        header="Abbreviazione"
        body={(row: Row) => <span className="text-zinc-500">{row.shortName ?? "—"}</span>}
        sortable
      />
      <Column
        header=""
        body={(row: Row) => (
          <div className="flex gap-3">
            <Link href={`/admin/squadre/${row.id}/edit`} className="text-blue-600 hover:underline text-sm">Modifica</Link>
            <ConfirmDeleteForm
              action={deleteFootballTeam}
              hiddenInputs={{ id: row.id }}
              confirmMessage="Eliminare la squadra?"
            />
          </div>
        )}
      />
    </DataTable>
  );
}
