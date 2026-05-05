# Task 6 — Admin Squadre CRUD

**File da creare:**
- `app/(admin)/admin/greenvolley/squadre/page.tsx`
- `app/(admin)/admin/greenvolley/squadre/_table.tsx`
- `app/(admin)/admin/greenvolley/squadre/_form.tsx`
- `app/(admin)/admin/greenvolley/squadre/new/page.tsx`
- `app/(admin)/admin/greenvolley/squadre/[id]/edit/page.tsx`

**Dipendenze:** Task 1 (schema), Task 3 (actions)

---

## Passi

- [ ] **Step 1: Crea `app/(admin)/admin/greenvolley/squadre/page.tsx`**

```tsx
import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
import VolleyTeamsTable from "./_table";

export default async function VolleySquadrePage() {
  const teams = await db.volleyTeam.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { players: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="Squadre GreenVolley"
        cta={{ href: "/admin/greenvolley/squadre/new", label: "Nuova squadra" }}
      />
      <VolleyTeamsTable
        teams={teams.map((t) => ({
          id: t.id,
          name: t.name,
          playerCount: t._count.players,
        }))}
      />
    </div>
  );
}
```

- [ ] **Step 2: Crea `app/(admin)/admin/greenvolley/squadre/_table.tsx`**

```tsx
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
```

- [ ] **Step 3: Crea `app/(admin)/admin/greenvolley/squadre/_form.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { createVolleyTeam, updateVolleyTeam } from "@/app/actions/admin/volley";

type Team = { id: number; name: string };

export default function VolleyTeamForm({ team }: { team?: Team }) {
  const action = team
    ? updateVolleyTeam.bind(null, team.id)
    : createVolleyTeam;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="text-sm font-semibold" style={{ color: "var(--error, #dc2626)" }}>
          {state.error}
        </p>
      )}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Nome squadra *</label>
        <InputText
          name="name"
          defaultValue={team?.name ?? ""}
          required
          className="w-full"
          placeholder="es. GreenVolley Milano"
        />
      </div>
      <Button
        type="submit"
        label={team ? "Salva modifiche" : "Crea squadra"}
        loading={pending}
        style={{ background: "#3DD907", border: "none", color: "#fff" }}
      />
    </form>
  );
}
```

- [ ] **Step 4: Crea `app/(admin)/admin/greenvolley/squadre/new/page.tsx`**

```tsx
import AdminPageHeader from "@/components/admin-page-header";
import VolleyTeamForm from "../_form";

export default function NuovaVolleySquadraPage() {
  return (
    <div>
      <AdminPageHeader
        title="Nuova squadra"
        backHref="/admin/greenvolley/squadre"
      />
      <div className="admin-card p-5 max-w-lg">
        <VolleyTeamForm />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Crea `app/(admin)/admin/greenvolley/squadre/[id]/edit/page.tsx`**

```tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin-page-header";
import VolleyTeamForm from "../../_form";

export default async function EditVolleySquadraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await db.volleyTeam.findUnique({ where: { id: Number(id) } });
  if (!team) notFound();

  return (
    <div>
      <AdminPageHeader
        title="Modifica squadra"
        backHref="/admin/greenvolley/squadre"
      />
      <div className="admin-card p-5 max-w-lg">
        <VolleyTeamForm team={team} />
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
git add app/(admin)/admin/greenvolley/squadre/
git commit -m "feat: add GreenVolley admin teams CRUD pages"
```
