# Task 8 — Admin Partite + Gestione Set

**File da creare:**
- `app/(admin)/admin/greenvolley/partite/page.tsx`
- `app/(admin)/admin/greenvolley/partite/_table.tsx`
- `app/(admin)/admin/greenvolley/partite/new/page.tsx`
- `app/(admin)/admin/greenvolley/partite/new/_form.tsx`
- `app/(admin)/admin/greenvolley/partite/[id]/page.tsx`
- `app/(admin)/admin/greenvolley/partite/[id]/_sets-section.tsx`

**Dipendenze:** Task 1 (schema), Task 3 (actions)

---

## Passi

- [ ] **Step 1: Crea `app/(admin)/admin/greenvolley/partite/page.tsx`**

```tsx
import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
import VolleyMatchesTable from "./_table";

export default async function VolleyPartitePage() {
  const matches = await db.volleyMatch.findMany({
    orderBy: { date: "desc" },
    include: {
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
      sets: true,
    },
  });

  return (
    <div>
      <AdminPageHeader
        title="Partite GreenVolley"
        cta={{ href: "/admin/greenvolley/partite/new", label: "Nuova partita" }}
      />
      <VolleyMatchesTable
        matches={matches.map((m) => {
          const homeSets = m.sets.filter((s) => s.homePoints > s.awayPoints).length;
          const awaySets = m.sets.filter((s) => s.awayPoints > s.homePoints).length;
          return {
            id: m.id,
            homeTeamName: m.homeTeam.name,
            awayTeamName: m.awayTeam.name,
            status: m.status,
            date: m.date?.toLocaleDateString("it-IT") ?? "—",
            result: m.sets.length > 0 ? `${homeSets}-${awaySets}` : "—",
          };
        })}
      />
    </div>
  );
}
```

- [ ] **Step 2: Crea `app/(admin)/admin/greenvolley/partite/_table.tsx`**

```tsx
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
```

- [ ] **Step 3: Crea `app/(admin)/admin/greenvolley/partite/new/page.tsx`**

```tsx
import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
import NewVolleyMatchForm from "./_form";

export default async function NuovaVolleyPartitaPage() {
  const [teams, groups, rounds] = await Promise.all([
    db.volleyTeam.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.volleyGroup.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.volleyKnockoutRound.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Nuova partita"
        backHref="/admin/greenvolley/partite"
      />
      <div className="admin-card p-5 max-w-lg">
        <NewVolleyMatchForm teams={teams} groups={groups} rounds={rounds} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Crea `app/(admin)/admin/greenvolley/partite/new/_form.tsx`**

```tsx
"use client";

import { useActionState, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { createVolleyMatch } from "@/app/actions/admin/volley";

type SelectItem = { id: number; name: string };

export default function NewVolleyMatchForm({
  teams,
  groups,
  rounds,
}: {
  teams: SelectItem[];
  groups: SelectItem[];
  rounds: SelectItem[];
}) {
  const [state, formAction, pending] = useActionState(createVolleyMatch, undefined);
  const [homeTeamId, setHomeTeamId] = useState<number | null>(null);
  const [awayTeamId, setAwayTeamId] = useState<number | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [knockoutRoundId, setKnockoutRoundId] = useState<number | null>(null);
  const [date, setDate] = useState<Date | null>(null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="text-sm font-semibold" style={{ color: "var(--error, #dc2626)" }}>
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Squadra casa *</label>
        <Dropdown
          options={teams}
          optionLabel="name"
          optionValue="id"
          value={homeTeamId}
          onChange={(e) => setHomeTeamId(e.value)}
          placeholder="Seleziona"
          className="w-full"
        />
        <input type="hidden" name="homeTeamId" value={homeTeamId ?? ""} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Squadra ospite *</label>
        <Dropdown
          options={teams}
          optionLabel="name"
          optionValue="id"
          value={awayTeamId}
          onChange={(e) => setAwayTeamId(e.value)}
          placeholder="Seleziona"
          className="w-full"
        />
        <input type="hidden" name="awayTeamId" value={awayTeamId ?? ""} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Data</label>
        <Calendar
          value={date}
          onChange={(e) => setDate(e.value as Date | null)}
          showTime
          hourFormat="24"
          dateFormat="dd/mm/yy"
          className="w-full"
          placeholder="Opzionale"
        />
        <input
          type="hidden"
          name="date"
          value={date ? date.toISOString() : ""}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Girone</label>
        <Dropdown
          options={[{ id: 0, name: "Nessuno" }, ...groups]}
          optionLabel="name"
          optionValue="id"
          value={groupId ?? 0}
          onChange={(e) => setGroupId(e.value || null)}
          className="w-full"
        />
        <input type="hidden" name="groupId" value={groupId ?? ""} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Turno eliminazione</label>
        <Dropdown
          options={[{ id: 0, name: "Nessuno" }, ...rounds]}
          optionLabel="name"
          optionValue="id"
          value={knockoutRoundId ?? 0}
          onChange={(e) => setKnockoutRoundId(e.value || null)}
          className="w-full"
        />
        <input type="hidden" name="knockoutRoundId" value={knockoutRoundId ?? ""} />
      </div>

      <Button
        type="submit"
        label="Crea partita"
        loading={pending}
        style={{ background: "#3DD907", border: "none", color: "#fff" }}
      />
    </form>
  );
}
```

- [ ] **Step 5: Crea `app/(admin)/admin/greenvolley/partite/[id]/page.tsx`**

```tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin-page-header";
import { Tag } from "primereact/tag";
import SetSection from "./_sets-section";

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

export default async function VolleyMatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await db.volleyMatch.findUnique({
    where: { id: Number(id) },
    include: {
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
      sets: { orderBy: { setNumber: "asc" } },
      group: { select: { id: true, name: true } },
      knockoutRound: { select: { id: true, name: true } },
    },
  });
  if (!match) notFound();

  const homeSets = match.sets.filter((s) => s.homePoints > s.awayPoints).length;
  const awaySets = match.sets.filter((s) => s.awayPoints > s.homePoints).length;

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Gestione partita"
        backHref="/admin/greenvolley/partite"
      />

      {/* Hero */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg, #1a3a1a 0%, #0d1f0d 100%)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag
              value={STATUS_LABEL[match.status] ?? match.status}
              severity={STATUS_SEVERITY[match.status] ?? "secondary"}
            />
            {match.group && (
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: "rgba(61,217,7,0.2)", color: "#3DD907" }}
              >
                {match.group.name}
              </span>
            )}
            {match.knockoutRound && (
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: "rgba(61,217,7,0.2)", color: "#3DD907" }}
              >
                {match.knockoutRound.name}
              </span>
            )}
          </div>
          {match.date && (
            <span className="text-xs text-white/50">
              {match.date.toLocaleDateString("it-IT", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-6">
          <span className="text-white font-black text-xl">{match.homeTeam.name}</span>
          <div className="text-center">
            <div className="text-4xl font-black" style={{ color: "#3DD907" }}>
              {match.sets.length > 0 ? `${homeSets} – ${awaySets}` : "vs"}
            </div>
            {match.sets.length > 0 && (
              <div className="text-xs text-white/50 mt-1">set vinti</div>
            )}
          </div>
          <span className="text-white font-black text-xl">{match.awayTeam.name}</span>
        </div>
      </div>

      {/* Sezione set */}
      <SetSection
        match={{
          id: match.id,
          status: match.status,
          homeTeamName: match.homeTeam.name,
          awayTeamName: match.awayTeam.name,
          sets: match.sets,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 6: Crea `app/(admin)/admin/greenvolley/partite/[id]/_sets-section.tsx`**

```tsx
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
```

- [ ] **Step 7: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Output atteso: nessun errore.

- [ ] **Step 8: Commit**

```bash
git add app/(admin)/admin/greenvolley/partite/
git commit -m "feat: add GreenVolley admin matches pages with set management"
```
