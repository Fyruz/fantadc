"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { useRouter } from "next/navigation";
import { deleteVolleyPlayer } from "@/app/actions/admin/volley";

type Row = { id: number; name: string; teamId: number; teamName: string };

export default function VolleyPlayersTable({ players }: { players: Row[] }) {
  const router = useRouter();

  return (
    <div className="admin-card">
      <DataTable value={players} emptyMessage="Nessun giocatore">
        <Column field="name" header="Nome" />
        <Column field="teamName" header="Squadra" />
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
                  router.push(`/admin/greenvolley/giocatori/${row.id}/edit`)
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
                    await deleteVolleyPlayer(row.id);
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
