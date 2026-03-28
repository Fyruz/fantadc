"use client";

import Link from "next/link";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { deletePlayer } from "@/app/actions/admin/players";
import ConfirmDeleteForm from "@/components/confirm-delete-form";
import RoleBadge from "@/components/role-badge";

type Row = { id: number; name: string; role: string; footballTeam: { name: string } };

export default function GiocatoriTable({ rows }: { rows: Row[] }) {
  return (
    <div className="admin-card overflow-hidden">
      <DataTable value={rows} stripedRows paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
        <Column
          header="Nome"
          body={(row: Row) => (
            <span className="font-medium text-[#111827]">{row.name}</span>
          )}
          field="name"
          sortable
        />
        <Column
          header="Ruolo"
          body={(row: Row) => <RoleBadge role={row.role} />}
          sortable
          sortField="role"
          className="hidden md:table-cell"
          headerClassName="hidden md:table-cell"
        />
        <Column
          header="Squadra"
          body={(row: Row) => (
            <span className="text-[#6B7280]">{row.footballTeam.name}</span>
          )}
          sortable
          sortField="footballTeam.name"
        />
        <Column
          header=""
          body={(row: Row) => (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/giocatori/${row.id}/edit`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#0107A3] hover:bg-[#E8E9F8] transition-colors"
                title="Modifica"
              >
                <i className="pi pi-pencil text-sm" />
              </Link>
              <ConfirmDeleteForm
                action={deletePlayer}
                hiddenInputs={{ id: row.id }}
                confirmMessage="Eliminare il giocatore?"
              />
            </div>
          )}
        />
      </DataTable>
    </div>
  );
}
