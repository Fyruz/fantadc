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
    <DataTable value={rows} stripedRows paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
      <Column field="email" header="Email" sortable />
      <Column
        field="name"
        header="Nome"
        body={(row: Row) => <span className="text-zinc-500">{row.name ?? "—"}</span>}
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
        body={(row: Row) => <span className="text-zinc-500">{row.fantasyTeam ? "Sì" : "No"}</span>}
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
          <Link href={`/admin/utenti/${row.id}`} className="text-blue-600 hover:underline text-sm">Dettaglio</Link>
        )}
      />
    </DataTable>
  );
}
