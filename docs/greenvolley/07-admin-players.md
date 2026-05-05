# Task 7 — Admin Giocatori CRUD

**File da creare:**
- `app/(admin)/admin/greenvolley/giocatori/page.tsx`
- `app/(admin)/admin/greenvolley/giocatori/_table.tsx`
- `app/(admin)/admin/greenvolley/giocatori/_form.tsx`
- `app/(admin)/admin/greenvolley/giocatori/new/page.tsx`
- `app/(admin)/admin/greenvolley/giocatori/[id]/edit/page.tsx`

**Dipendenze:** Task 1 (schema), Task 3 (actions)

---

## Passi

- [ ] **Step 1: Crea `app/(admin)/admin/greenvolley/giocatori/page.tsx`**

```tsx
import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
import VolleyPlayersTable from "./_table";

export default async function VolleyGiocatoriPage() {
  const players = await db.volleyPlayer.findMany({
    orderBy: [{ team: { name: "asc" } }, { name: "asc" }],
    include: { team: { select: { id: true, name: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="Giocatori GreenVolley"
        cta={{ href: "/admin/greenvolley/giocatori/new", label: "Nuovo giocatore" }}
      />
      <VolleyPlayersTable
        players={players.map((p) => ({
          id: p.id,
          name: p.name,
          teamId: p.teamId,
          teamName: p.team.name,
        }))}
      />
    </div>
  );
}
```

- [ ] **Step 2: Crea `app/(admin)/admin/greenvolley/giocatori/_table.tsx`**

```tsx
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
```

- [ ] **Step 3: Crea `app/(admin)/admin/greenvolley/giocatori/_form.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useState } from "react";
import { createVolleyPlayer, updateVolleyPlayer } from "@/app/actions/admin/volley";

type Team = { id: number; name: string };
type Player = { id: number; name: string; teamId: number };

export default function VolleyPlayerForm({
  player,
  teams,
}: {
  player?: Player;
  teams: Team[];
}) {
  const action = player
    ? updateVolleyPlayer.bind(null, player.id)
    : createVolleyPlayer;
  const [state, formAction, pending] = useActionState(action, undefined);
  const [teamId, setTeamId] = useState<number | null>(player?.teamId ?? null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="text-sm font-semibold" style={{ color: "var(--error, #dc2626)" }}>
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Nome giocatore *</label>
        <InputText
          name="name"
          defaultValue={player?.name ?? ""}
          required
          className="w-full"
          placeholder="Nome Cognome"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Squadra *</label>
        <Dropdown
          options={teams}
          optionLabel="name"
          optionValue="id"
          value={teamId}
          onChange={(e) => setTeamId(e.value)}
          placeholder="Seleziona squadra"
          className="w-full"
        />
        {/* hidden input per il form action */}
        <input type="hidden" name="teamId" value={teamId ?? ""} />
      </div>

      <Button
        type="submit"
        label={player ? "Salva modifiche" : "Crea giocatore"}
        loading={pending}
        style={{ background: "#3DD907", border: "none", color: "#fff" }}
      />
    </form>
  );
}
```

- [ ] **Step 4: Crea `app/(admin)/admin/greenvolley/giocatori/new/page.tsx`**

```tsx
import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
import VolleyPlayerForm from "../_form";

export default async function NuovoVolleyGiocatorePage() {
  const teams = await db.volleyTeam.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="Nuovo giocatore"
        backHref="/admin/greenvolley/giocatori"
      />
      <div className="admin-card p-5 max-w-lg">
        <VolleyPlayerForm teams={teams} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Crea `app/(admin)/admin/greenvolley/giocatori/[id]/edit/page.tsx`**

```tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin-page-header";
import VolleyPlayerForm from "../../_form";

export default async function EditVolleyGiocatorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [player, teams] = await Promise.all([
    db.volleyPlayer.findUnique({ where: { id: Number(id) } }),
    db.volleyTeam.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!player) notFound();

  return (
    <div>
      <AdminPageHeader
        title="Modifica giocatore"
        backHref="/admin/greenvolley/giocatori"
      />
      <div className="admin-card p-5 max-w-lg">
        <VolleyPlayerForm player={player} teams={teams} />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Output atteso: nessun errore.

- [ ] **Step 7: Commit**

```bash
git add app/(admin)/admin/greenvolley/giocatori/
git commit -m "feat: add GreenVolley admin players CRUD pages"
```
