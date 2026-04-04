"use client";

import Link from "next/link";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { deleteFootballTeam } from "@/app/actions/admin/football-teams";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

type Row = { id: number; name: string; shortName: string | null };

export default function SquadreTable({ rows }: { rows: Row[] }) {
  return (
    <div className="admin-card overflow-hidden">
      <DataTable value={rows} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
        <Column field="name" header="Nome" sortable />
        <Column
          field="shortName"
          header="Abbreviazione"
          body={(row: Row) => <span className="text-[var(--text-secondary)]">{row.shortName ?? "—"}</span>}
          sortable
        />
        <Column
          header=""
          body={(row: Row) => (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/squadre/${row.id}/edit`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
                title="Modifica"
              >
                <i className="pi pi-pencil text-sm" />
              </Link>
              <ConfirmDeleteForm
                action={deleteFootballTeam}
                hiddenInputs={{ id: row.id }}
                confirmMessage="Eliminare la squadra?"
              />
            </div>
          )}
        />
      </DataTable>
    </div>
  );
}
