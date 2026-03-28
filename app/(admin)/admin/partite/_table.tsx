"use client";

import Link from "next/link";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { deleteMatch } from "@/app/actions/admin/matches";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

type Row = {
  id: number;
  status: string;
  startsAt: Date;
  homeTeam: { name: string };
  awayTeam: { name: string };
  _count: { players: number };
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
  PUBLISHED: "Pubblicata",
};

const STATUS_SEVERITY: Record<string, "secondary" | "info" | "warning" | "success"> = {
  DRAFT: "secondary",
  SCHEDULED: "info",
  CONCLUDED: "warning",
  PUBLISHED: "success",
};

export default function PartiteTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable value={rows} stripedRows paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
      <Column
        header="Partita"
        body={(row: Row) => {
          const isAnomaly =
            (row.status === "CONCLUDED" || row.status === "PUBLISHED") && row._count.players === 0;
          return (
            <span>
              {row.homeTeam.name} vs {row.awayTeam.name}
              {isAnomaly && <span className="ml-2 text-xs text-orange-600">⚠ no giocatori</span>}
            </span>
          );
        }}
        sortable
        sortField="homeTeam.name"
      />
      <Column
        header="Data"
        body={(row: Row) => (
          <span className="text-zinc-500">{new Date(row.startsAt).toLocaleDateString("it-IT")}</span>
        )}
        sortable
        sortField="startsAt"
      />
      <Column
        header="Stato"
        body={(row: Row) => (
          <Tag
            value={STATUS_LABEL[row.status] ?? row.status}
            severity={STATUS_SEVERITY[row.status] ?? "secondary"}
          />
        )}
        sortable
        sortField="status"
      />
      <Column
        header="Giocatori"
        body={(row: Row) => <span className="text-zinc-500 tabular-nums">{row._count.players}</span>}
        sortable
        sortField="_count.players"
        className="text-right"
      />
      <Column
        header=""
        body={(row: Row) => (
          <div className="flex gap-3">
            <Link href={`/admin/partite/${row.id}`} className="text-blue-600 hover:underline text-sm">Gestisci</Link>
            <ConfirmDeleteForm
              action={deleteMatch}
              hiddenInputs={{ id: row.id }}
              confirmMessage="Eliminare la partita? L'operazione è irreversibile."
            />
          </div>
        )}
      />
    </DataTable>
  );
}
