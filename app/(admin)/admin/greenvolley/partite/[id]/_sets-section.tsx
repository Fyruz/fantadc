"use client";

import { useActionState, useTransition } from "react";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addVolleySet,
  deleteVolleySet,
  scheduleVolleyMatch,
  concludeVolleyMatch,
  reopenVolleyMatch,
} from "@/app/actions/admin/volley";

type SetRow = {
  id: number;
  setNumber: number;
  homePoints: number;
  awayPoints: number;
};

type MatchInfo = {
  id: number;
  status: string;
  homeTeamName: string;
  awayTeamName: string;
  sets: SetRow[];
};

export default function SetSection({ match }: { match: MatchInfo }) {
  const router = useRouter();
  const [homePoints, setHomePoints] = useState<number | null>(null);
  const [awayPoints, setAwayPoints] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const addSetAction = addVolleySet.bind(null, match.id);
  const [addState, formAction, addPending] = useActionState(addSetAction, undefined);

  const isConcluded = match.status === "CONCLUDED";
  const canAddSet = !isConcluded && match.sets.length < 5;

  return (
    <div className="flex flex-col gap-4">
      {/* Set table */}
      <div className="admin-card">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h2 className="font-black text-base uppercase tracking-wide">Set</h2>
          <span className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
            {match.sets.length} / 5
          </span>
        </div>
        <DataTable value={match.sets} emptyMessage="Nessun set registrato">
          <Column field="setNumber" header="Set" style={{ width: "60px" }} />
          <Column
            header={match.homeTeamName}
            body={(s: SetRow) => (
              <span className={s.homePoints > s.awayPoints ? "font-black" : ""}>
                {s.homePoints}
              </span>
            )}
          />
          <Column
            header={match.awayTeamName}
            body={(s: SetRow) => (
              <span className={s.awayPoints > s.homePoints ? "font-black" : ""}>
                {s.awayPoints}
              </span>
            )}
          />
          <Column
            header="Vincitore"
            body={(s: SetRow) => (
              <span style={{ color: "#3DD907", fontWeight: 700 }}>
                {s.homePoints > s.awayPoints
                  ? match.homeTeamName
                  : match.awayTeamName}
              </span>
            )}
          />
          {!isConcluded && (
            <Column
              header=""
              style={{ width: "60px" }}
              body={(s: SetRow) => (
                <Button
                  icon="pi pi-trash"
                  text
                  size="small"
                  severity="danger"
                  onClick={() =>
                    startTransition(async () => {
                      await deleteVolleySet(s.id, match.id);
                      router.refresh();
                    })
                  }
                  aria-label="Elimina set"
                />
              )}
            />
          )}
        </DataTable>
      </div>

      {/* Aggiungi set */}
      {canAddSet && (
        <div className="admin-card p-5">
          <h3 className="font-black text-sm uppercase tracking-wide mb-4">
            Aggiungi Set {match.sets.length + 1}
          </h3>
          <form action={formAction} className="flex flex-col gap-3">
            {addState?.error && (
              <p className="text-sm font-semibold" style={{ color: "var(--error, #dc2626)" }}>
                {addState.error}
              </p>
            )}
            <div className="flex gap-4 items-end">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm font-semibold">{match.homeTeamName}</label>
                <InputNumber
                  value={homePoints}
                  onValueChange={(e) => setHomePoints(e.value ?? null)}
                  min={0}
                  max={99}
                  placeholder="0"
                  className="w-full"
                />
                <input type="hidden" name="homePoints" value={homePoints ?? ""} />
              </div>
              <span className="text-xl font-black pb-2" style={{ color: "var(--text-muted)" }}>
                –
              </span>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm font-semibold">{match.awayTeamName}</label>
                <InputNumber
                  value={awayPoints}
                  onValueChange={(e) => setAwayPoints(e.value ?? null)}
                  min={0}
                  max={99}
                  placeholder="0"
                  className="w-full"
                />
                <input type="hidden" name="awayPoints" value={awayPoints ?? ""} />
              </div>
            </div>
            <Button
              type="submit"
              label="Aggiungi set"
              loading={addPending}
              style={{ background: "#3DD907", border: "none", color: "#fff" }}
            />
          </form>
        </div>
      )}

      {/* Azioni stato */}
      <div className="admin-card p-4 flex gap-3 flex-wrap">
        {match.status === "DRAFT" && (
          <Button
            label="Segna come programmata"
            icon="pi pi-calendar"
            onClick={() =>
              startTransition(async () => {
                await scheduleVolleyMatch(match.id);
                router.refresh();
              })
            }
            loading={isPending}
            outlined
          />
        )}
        {match.status === "SCHEDULED" && match.sets.length > 0 && (
          <Button
            label="Segna come conclusa"
            icon="pi pi-check"
            onClick={() =>
              startTransition(async () => {
                await concludeVolleyMatch(match.id);
                router.refresh();
              })
            }
            loading={isPending}
            style={{ background: "#3DD907", border: "none", color: "#fff" }}
          />
        )}
        {match.status === "CONCLUDED" && (
          <Button
            label="Riapri partita"
            icon="pi pi-refresh"
            severity="warning"
            onClick={() =>
              startTransition(async () => {
                await reopenVolleyMatch(match.id);
                router.refresh();
              })
            }
            loading={isPending}
            outlined
          />
        )}
      </div>
    </div>
  );
}
