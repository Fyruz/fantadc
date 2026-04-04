"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

type ScoreRow = {
  playerId: number;
  playerName: string;
  bonusPoints: number;
  isMvp: boolean;
  mvpPoints: number;
  basePoints: number;
  isCaptain: boolean;
  finalPoints: number;
};

export default function ScoreTable({ rows }: { rows: ScoreRow[] }) {
  return (
    <DataTable value={rows} size="small" className="text-xs mt-1">
      <Column
        header="Giocatore"
        field="playerName"
        body={(row: ScoreRow) => (
          <span>
            {row.isCaptain && <span className="text-amber-500 mr-0.5">★</span>}
            {row.playerName}
            {row.isMvp && <span className="ml-1 text-yellow-600 font-medium">(MVP)</span>}
          </span>
        )}
      />
      <Column
        header="Bonus"
        field="bonusPoints"
        style={{ textAlign: "right" }}
        body={(row: ScoreRow) => (
          <span className="text-[var(--text-secondary)]">{row.bonusPoints.toFixed(1)}</span>
        )}
      />
      <Column
        header="MVP"
        field="mvpPoints"
        style={{ textAlign: "right" }}
        body={(row: ScoreRow) => (
          <span className="text-[var(--text-secondary)]">
            {row.mvpPoints > 0 ? `+${row.mvpPoints.toFixed(1)}` : "—"}
          </span>
        )}
      />
      <Column
        header="Totale"
        field="finalPoints"
        style={{ textAlign: "right" }}
        body={(row: ScoreRow) => (
          <span className="font-medium text-[var(--text-primary)]">
            {row.finalPoints.toFixed(1)}
            {row.isCaptain && row.basePoints !== 0 && (
              <span className="text-amber-600 text-xs ml-0.5">×2</span>
            )}
          </span>
        )}
      />
    </DataTable>
  );
}
