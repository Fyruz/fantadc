"use client";

import Link from "next/link";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";

type Row = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  isSuspended: boolean;
  fantasyTeam: { id: number } | null;
};

export default function UtentiTable({ rows }: { rows: Row[] }) {
  return (
    <div className="admin-card overflow-hidden">
      <DataTable value={rows} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
        <Column field="email" header="Email" sortable />
        <Column
          field="name"
          header="Nome"
          body={(row: Row) => <span className="text-[var(--text-secondary)]">{row.name ?? "—"}</span>}
          sortable
        />
        <Column
          header="Ruolo"
          body={(row: Row) => (
            <Tag
              value={row.role}
              severity={row.role === "ADMIN" ? "warning" : "secondary"}
            />
          )}
          sortable
          sortField="role"
        />
        <Column
          header="Squadra fantasy"
          body={(row: Row) => <span className="text-[var(--text-secondary)]">{row.fantasyTeam ? "Sì" : "No"}</span>}
        />
        <Column
          header="Stato"
          body={(row: Row) =>
            row.isSuspended ? <Tag value="Sospeso" severity="danger" /> : null
          }
          sortable
          sortField="isSuspended"
        />
        <Column
          header=""
          body={(row: Row) => (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/utenti/${row.id}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
                title="Dettaglio"
              >
                <i className="pi pi-eye text-sm" />
              </Link>
            </div>
          )}
        />
      </DataTable>
    </div>
  );
}
