"use client";

import Link from "next/link";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

type Row = {
  id: number;
  name: string;
  user: { email: string };
  _count: { players: number };
};

export default function SquadreFantasyTable({ rows }: { rows: Row[] }) {
  return (
    <div className="admin-card overflow-hidden">
      <DataTable value={rows} stripedRows paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
        <Column field="name" header="Nome" sortable />
        <Column
          header="Utente"
          body={(row: Row) => <span className="text-zinc-500">{row.user.email}</span>}
          sortable
          sortField="user.email"
        />
        <Column
          header="Giocatori"
          body={(row: Row) => <span className="text-zinc-500">{row._count.players}/5</span>}
          sortable
          sortField="_count.players"
        />
        <Column
          header=""
          body={(row: Row) => (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/squadre-fantasy/${row.id}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#0107A3] hover:bg-[#E8E9F8] transition-colors"
                title="Gestisci"
              >
                <i className="pi pi-pencil text-sm" />
              </Link>
            </div>
          )}
        />
      </DataTable>
    </div>
  );
}
