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
          <Link href={`/admin/squadre-fantasy/${row.id}`} className="text-blue-600 hover:underline text-sm">Gestisci</Link>
        )}
      />
    </DataTable>
  );
}
