"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

type LogRow = {
  id: number;
  createdAt: string;
  adminEmail: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
};

export default function AuditTable({ rows }: { rows: LogRow[] }) {
  return (
    <div className="admin-card overflow-hidden">
      <DataTable value={rows} paginator rows={50} rowsPerPageOptions={[25, 50, 100]}>
        <Column
          header="Data"
          field="createdAt"
          body={(row: LogRow) => (
            <span className="text-[var(--text-secondary)] whitespace-nowrap">{row.createdAt}</span>
          )}
        />
        <Column
          header="Admin"
          field="adminEmail"
          body={(row: LogRow) => (
            <span className="font-medium text-[var(--text-primary)]">{row.adminEmail}</span>
          )}
        />
        <Column
          header="Azione"
          field="action"
          body={(row: LogRow) => (
            <span className="font-mono text-[var(--text-primary)]">{row.action}</span>
          )}
        />
        <Column
          header="Entità"
          field="entityType"
          body={(row: LogRow) => (
            <span className="text-[var(--text-secondary)]">{row.entityType ?? "—"}</span>
          )}
        />
        <Column
          header="ID"
          field="entityId"
          body={(row: LogRow) => (
            <span className="font-mono text-[var(--text-muted)]">{row.entityId ?? "—"}</span>
          )}
        />
      </DataTable>
    </div>
  );
}
