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
      <DataTable value={rows} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
        <Column field="name" header="Nome" sortable />
        <Column
          header="Utente"
          body={(row: Row) => <span className="text-[var(--text-secondary)]">{row.user.email}</span>}
          sortable
          sortField="user.email"
        />
        <Column
          header="Giocatori"
          body={(row: Row) => <span className="text-[var(--text-secondary)]">{row._count.players}/5</span>}
          sortable
          sortField="_count.players"
        />
        <Column
          header=""
          body={(row: Row) => (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/squadre-fantasy/${row.id}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
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
