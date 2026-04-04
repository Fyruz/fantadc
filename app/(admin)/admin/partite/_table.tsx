"use client";

import Link from "next/link";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { deleteMatch } from "@/app/actions/admin/matches";
import ConfirmDeleteForm from "@/components/confirm-delete-form";
import StatusBadge from "@/components/status-badge";

type Row = {
  id: number;
  status: string;
  startsAt: Date;
  homeTeam: { name: string };
  awayTeam: { name: string };
  _count: { players: number };
};

export default function PartiteTable({ rows }: { rows: Row[] }) {
  return (
    <div className="admin-card overflow-hidden">
      <DataTable
        value={rows}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
      >
        <Column
          header="Partita"
          body={(row: Row) => {
            const isAnomaly =
              (row.status === "CONCLUDED" || row.status === "PUBLISHED") &&
              row._count.players === 0;
            return (
              <span className="font-medium text-[var(--text-primary)]">
                {row.homeTeam.name} vs {row.awayTeam.name}
                {isAnomaly && (
                  <span className="ml-2 text-xs text-amber-600">⚠ no giocatori</span>
                )}
              </span>
            );
          }}
          sortable
          sortField="homeTeam.name"
        />
        <Column
          header="Data"
          body={(row: Row) => (
            <span className="text-[var(--text-secondary)]">
              {new Date(row.startsAt).toLocaleDateString("it-IT")}
            </span>
          )}
          sortable
          sortField="startsAt"
          className="hidden md:table-cell"
          headerClassName="hidden md:table-cell"
        />
        <Column
          header="Stato"
          body={(row: Row) => <StatusBadge status={row.status} />}
          sortable
          sortField="status"
        />
        <Column
          header="Gioc."
          body={(row: Row) => (
            <span className="text-[var(--text-secondary)] tabular-nums">{row._count.players}</span>
          )}
          sortable
          sortField="_count.players"
          className="hidden md:table-cell text-right"
          headerClassName="hidden md:table-cell"
        />
        <Column
          header=""
          body={(row: Row) => (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/partite/${row.id}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
                title="Gestisci"
              >
                <i className="pi pi-pencil text-sm" />
              </Link>
              <ConfirmDeleteForm
                action={deleteMatch}
                hiddenInputs={{ id: row.id }}
                confirmMessage="Eliminare la partita? L'operazione è irreversibile."
              />
            </div>
          )}
        />
      </DataTable>
    </div>
  );
}
