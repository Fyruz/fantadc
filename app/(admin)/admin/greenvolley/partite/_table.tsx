"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useRouter } from "next/navigation";
import { deleteVolleyMatch } from "@/app/actions/admin/volley";

type Row = {
  id: number;
  homeTeamName: string;
  awayTeamName: string;
  status: string;
  date: string;
  result: string;
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
};
const STATUS_SEVERITY: Record<string, "secondary" | "info" | "success"> = {
  DRAFT: "secondary",
  SCHEDULED: "info",
  CONCLUDED: "success",
};

export default function VolleyMatchesTable({ matches }: { matches: Row[] }) {
  const router = useRouter();

  return (
    <div className="admin-card">
      <DataTable value={matches} emptyMessage="Nessuna partita">
        <Column
          header="Partita"
          body={(row: Row) => (
            <span className="font-semibold">
              {row.homeTeamName} vs {row.awayTeamName}
            </span>
          )}
        />
        <Column field="date" header="Data" style={{ width: "110px" }} />
        <Column
          header="Risultato"
          field="result"
          style={{ width: "90px", textAlign: "center" }}
        />
        <Column
          header="Stato"
          style={{ width: "130px" }}
          body={(row: Row) => (
            <Tag
              value={STATUS_LABEL[row.status] ?? row.status}
              severity={STATUS_SEVERITY[row.status] ?? "secondary"}
            />
          )}
        />
        <Column
          header=""
          style={{ width: "100px" }}
          body={(row: Row) => (
            <div className="flex gap-1 justify-end">
              <Button
                icon="pi pi-cog"
                text
                size="small"
                onClick={() =>
                  router.push(`/admin/greenvolley/partite/${row.id}`)
                }
                aria-label="Gestisci"
              />
              <Button
                icon="pi pi-trash"
                text
                size="small"
                severity="danger"
                onClick={async () => {
                  if (confirm("Eliminare questa partita?")) {
                    await deleteVolleyMatch(row.id);
                    router.refresh();
                  }
                }}
                aria-label="Elimina"
              />
            </div>
          )}
        />
      </DataTable>
    </div>
  );
}
