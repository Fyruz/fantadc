# Task 9 — Admin Gironi

**File da creare:**
- `app/(admin)/admin/greenvolley/gironi/page.tsx`
- `app/(admin)/admin/greenvolley/gironi/_group-card.tsx`
- `app/(admin)/admin/greenvolley/gironi/new/page.tsx`

**Dipendenze:** Task 1 (schema), Task 3 (actions)

---

## Passi

- [ ] **Step 1: Crea `app/(admin)/admin/greenvolley/gironi/page.tsx`**

```tsx
import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
import GroupCard from "./_group-card";

export default async function VolleyGironiPage() {
  const [groups, allTeams] = await Promise.all([
    db.volleyGroup.findMany({
      orderBy: { name: "asc" },
      include: {
        teams: {
          include: { team: { select: { id: true, name: true } } },
        },
      },
    }),
    db.volleyTeam.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Gironi GreenVolley"
        cta={{ href: "/admin/greenvolley/gironi/new", label: "Nuovo girone" }}
      />
      {groups.length === 0 ? (
        <div className="admin-card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun girone. Creane uno.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g) => (
            <GroupCard
              key={g.id}
              group={{
                id: g.id,
                name: g.name,
                teams: g.teams.map((gt) => ({
                  teamId: gt.teamId,
                  teamName: gt.team.name,
                  qualified: gt.qualified,
                })),
              }}
              availableTeams={allTeams.filter(
                (t) => !g.teams.some((gt) => gt.teamId === t.id)
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Crea `app/(admin)/admin/greenvolley/gironi/_group-card.tsx`**

```tsx
"use client";

import { useActionState, useTransition } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addTeamToVolleyGroup,
  removeTeamFromVolleyGroup,
  setVolleyTeamQualified,
  deleteVolleyGroup,
} from "@/app/actions/admin/volley";

type GroupTeam = { teamId: number; teamName: string; qualified: boolean };
type Group = { id: number; name: string; teams: GroupTeam[] };
type SelectItem = { id: number; name: string };

export default function GroupCard({
  group,
  availableTeams,
}: {
  group: Group;
  availableTeams: SelectItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const addAction = addTeamToVolleyGroup.bind(null, group.id);
  const [addState, formAction, addPending] = useActionState(addAction, undefined);

  return (
    <div className="admin-card p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-black text-base uppercase tracking-wide">{group.name}</h3>
        <Button
          icon="pi pi-trash"
          text
          size="small"
          severity="danger"
          onClick={() => {
            if (confirm(`Eliminare il girone "${group.name}"?`)) {
              startTransition(async () => {
                await deleteVolleyGroup(group.id);
                router.refresh();
              });
            }
          }}
          loading={isPending}
          aria-label="Elimina girone"
        />
      </div>

      {/* Team list */}
      <div className="flex flex-col gap-2">
        {group.teams.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Nessuna squadra nel girone.
          </p>
        ) : (
          group.teams.map((gt) => (
            <div
              key={gt.teamId}
              className="flex items-center justify-between rounded-xl px-3 py-2"
              style={{ background: "var(--surface-1)" }}
            >
              <span className="text-sm font-semibold">{gt.teamName}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    startTransition(async () => {
                      await setVolleyTeamQualified(group.id, gt.teamId, !gt.qualified);
                      router.refresh();
                    })
                  }
                  className="text-xs font-bold"
                >
                  {gt.qualified ? (
                    <Tag value="Qualificata" severity="success" />
                  ) : (
                    <Tag value="Non qualificata" severity="secondary" />
                  )}
                </button>
                <Button
                  icon="pi pi-times"
                  text
                  size="small"
                  severity="danger"
                  onClick={() =>
                    startTransition(async () => {
                      await removeTeamFromVolleyGroup(group.id, gt.teamId);
                      router.refresh();
                    })
                  }
                  aria-label="Rimuovi"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add team form */}
      {availableTeams.length > 0 && (
        <form action={formAction} className="flex gap-2">
          {addState?.error && (
            <p className="text-xs" style={{ color: "var(--error, #dc2626)" }}>
              {addState.error}
            </p>
          )}
          <Dropdown
            options={availableTeams}
            optionLabel="name"
            optionValue="id"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.value)}
            placeholder="Aggiungi squadra"
            className="flex-1"
          />
          <input type="hidden" name="teamId" value={selectedTeamId ?? ""} />
          <Button
            type="submit"
            icon="pi pi-plus"
            loading={addPending}
            style={{ background: "#3DD907", border: "none", color: "#fff" }}
            aria-label="Aggiungi"
          />
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Crea `app/(admin)/admin/greenvolley/gironi/new/page.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import AdminPageHeader from "@/components/admin-page-header";
import { createVolleyGroup } from "@/app/actions/admin/volley";

export default function NuovoVolleyGironePage() {
  const [state, formAction, pending] = useActionState(createVolleyGroup, undefined);

  return (
    <div>
      <AdminPageHeader title="Nuovo girone" backHref="/admin/greenvolley/gironi" />
      <div className="admin-card p-5 max-w-lg">
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <p className="text-sm font-semibold" style={{ color: "var(--error, #dc2626)" }}>
              {state.error}
            </p>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Nome girone *</label>
            <InputText
              name="name"
              required
              className="w-full"
              placeholder="es. Girone A"
            />
          </div>
          <Button
            type="submit"
            label="Crea girone"
            loading={pending}
            style={{ background: "#3DD907", border: "none", color: "#fff" }}
          />
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Output atteso: nessun errore.

- [ ] **Step 5: Commit**

```bash
git add app/(admin)/admin/greenvolley/gironi/
git commit -m "feat: add GreenVolley admin groups pages"
```
