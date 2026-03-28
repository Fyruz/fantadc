"use client";

import Link from "next/link";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { deletePlayer } from "@/app/actions/admin/players";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

type Row = { id: number; name: string; role: string; footballTeam: { name: string } };

export default function GiocatoriTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable value={rows} stripedRows paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
      <Column field="name" header="Nome" sortable />
      <Column field="role" header="Ruolo" sortable body={(row: Row) => <span className="text-zinc-500">{row.role}</span>} />
      <Column
        header="Squadra"
        body={(row: Row) => <span className="text-zinc-500">{row.footballTeam.name}</span>}
        sortable
        sortField="footballTeam.name"
      />
      <Column
        header=""
        body={(row: Row) => (
          <div className="flex gap-3">
            <Link href={`/admin/giocatori/${row.id}/edit`} className="text-blue-600 hover:underline text-sm">Modifica</Link>
            <ConfirmDeleteForm
              action={deletePlayer}
              hiddenInputs={{ id: row.id }}
              confirmMessage="Eliminare il giocatore?"
            />
          </div>
        )}
      />
    </DataTable>
  );
}
