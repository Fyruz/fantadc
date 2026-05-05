"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { useRouter } from "next/navigation";
import { deleteVolleyTeam } from "@/app/actions/admin/volley";

type Row = { id: number; name: string; playerCount: number };

export default function VolleyTeamsTable({ teams }: { teams: Row[] }) {
  const router = useRouter();

  return (
    <div className="admin-card">
      <DataTable value={teams} emptyMessage="Nessuna squadra">
        <Column field="name" header="Nome" />
        <Column field="playerCount" header="Giocatori" style={{ width: "120px" }} />
        <Column
          header=""
          style={{ width: "100px" }}
          body={(row: Row) => (
            <div className="flex gap-1 justify-end">
              <Button
                icon="pi pi-pencil"
                text
                size="small"
                onClick={() =>
                  router.push(`/admin/greenvolley/squadre/${row.id}/edit`)
                }
                aria-label="Modifica"
              />
              <Button
                icon="pi pi-trash"
                text
                size="small"
                severity="danger"
                onClick={async () => {
                  if (confirm(`Eliminare "${row.name}"?`)) {
                    await deleteVolleyTeam(row.id);
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
