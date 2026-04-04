"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

type RosterRow = {
  id: number;
  name: string;
  role: string;
  footballTeamName: string;
  isCaptain: boolean;
};

export default function RosterTable({ rows }: { rows: RosterRow[] }) {
  return (
    <div className="admin-card overflow-hidden">
      <DataTable value={rows}>
        <Column
          header="Giocatore"
          field="name"
          sortable
          body={(row: RosterRow) => (
            <span className="font-medium text-[var(--text-primary)]">
              {row.isCaptain && <span className="text-amber-500 mr-1">★</span>}
              {row.name}
            </span>
          )}
        />
        <Column
          header="Ruolo"
          field="role"
          sortable
          body={(row: RosterRow) => (
            <span className="text-[var(--text-secondary)]">{row.role}</span>
          )}
        />
        <Column
          header="Squadra"
          field="footballTeamName"
          sortable
          body={(row: RosterRow) => (
            <span className="text-[var(--text-secondary)]">{row.footballTeamName}</span>
          )}
        />
      </DataTable>
    </div>
  );
}
