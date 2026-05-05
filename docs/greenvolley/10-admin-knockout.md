# Task 10 — Admin Eliminazione Diretta

**File da creare:**
- `app/(admin)/admin/greenvolley/eliminazione/page.tsx`

**Dipendenze:** Task 1 (schema), Task 3 (actions)

---

## Passi

- [ ] **Step 1: Crea `app/(admin)/admin/greenvolley/eliminazione/page.tsx`**

```tsx
"use client";

import { useActionState, useTransition, useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import AdminPageHeader from "@/components/admin-page-header";
import {
  createVolleyKnockoutRound,
  deleteVolleyKnockoutRound,
} from "@/app/actions/admin/volley";

// Nota: questa pagina è un client component perché gestisce
// sia la lista che il form di creazione in una sola schermata.
// Per la lista usiamo un server component wrapper separato.

export { default } from "./_page-wrapper";
```

Questo file è solo un re-export. Crea il vero componente nel prossimo step.

- [ ] **Step 2: Sostituisci `app/(admin)/admin/greenvolley/eliminazione/page.tsx` con il seguente (ignora lo step 1, scrivi direttamente questo)**

```tsx
import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
import KnockoutRoundsClient from "./_rounds-client";

export default async function VolleyEliminazionePage() {
  const rounds = await db.volleyKnockoutRound.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { matches: true } },
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader title="Eliminazione GreenVolley" />
      <KnockoutRoundsClient
        rounds={rounds.map((r) => ({
          id: r.id,
          name: r.name,
          order: r.order,
          matchCount: r._count.matches,
        }))}
      />
    </div>
  );
}
```

- [ ] **Step 3: Crea `app/(admin)/admin/greenvolley/eliminazione/_rounds-client.tsx`**

```tsx
"use client";

import { useActionState, useTransition } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createVolleyKnockoutRound,
  deleteVolleyKnockoutRound,
} from "@/app/actions/admin/volley";

type Round = { id: number; name: string; order: number; matchCount: number };

export default function KnockoutRoundsClient({ rounds }: { rounds: Round[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [order, setOrder] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState(
    createVolleyKnockoutRound,
    undefined
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Lista turni */}
      <div className="admin-card">
        <DataTable value={rounds} emptyMessage="Nessun turno">
          <Column field="order" header="Ordine" style={{ width: "80px" }} />
          <Column field="name" header="Nome" />
          <Column
            field="matchCount"
            header="Partite"
            style={{ width: "90px" }}
          />
          <Column
            header=""
            style={{ width: "80px" }}
            body={(row: Round) => (
              <Button
                icon="pi pi-trash"
                text
                size="small"
                severity="danger"
                disabled={row.matchCount > 0}
                title={
                  row.matchCount > 0
                    ? "Rimuovi prima le partite associate"
                    : "Elimina turno"
                }
                onClick={() => {
                  if (confirm(`Eliminare "${row.name}"?`)) {
                    startTransition(async () => {
                      await deleteVolleyKnockoutRound(row.id);
                      router.refresh();
                    });
                  }
                }}
                loading={isPending}
                aria-label="Elimina"
              />
            )}
          />
        </DataTable>
      </div>

      {/* Form nuovo turno */}
      <div className="admin-card p-5 max-w-lg">
        <h3 className="font-black text-sm uppercase tracking-wide mb-4">
          Nuovo turno
        </h3>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--error, #dc2626)" }}
            >
              {state.error}
            </p>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Nome *</label>
            <InputText
              name="name"
              required
              className="w-full"
              placeholder="es. Semifinale, Finale"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Ordine *</label>
            <InputNumber
              value={order}
              onValueChange={(e) => setOrder(e.value ?? null)}
              min={1}
              placeholder="1"
              className="w-full"
            />
            <input type="hidden" name="order" value={order ?? ""} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              1 = primo turno, 2 = secondo, ecc.
            </span>
          </div>
          <Button
            type="submit"
            label="Crea turno"
            loading={pending}
            style={{ background: "#3DD907", border: "none", color: "#fff" }}
          />
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Crea la dashboard GreenVolley `app/(admin)/admin/greenvolley/page.tsx`**

```tsx
import { db } from "@/lib/db";
import Link from "next/link";

export default async function GreenVolleyDashboard() {
  const [teamCount, playerCount, matchCount, concludedCount] = await Promise.all([
    db.volleyTeam.count(),
    db.volleyPlayer.count(),
    db.volleyMatch.count(),
    db.volleyMatch.count({ where: { status: "CONCLUDED" } }),
  ]);

  const stats = [
    { label: "Squadre", value: teamCount, href: "/admin/greenvolley/squadre", icon: "pi-shield" },
    { label: "Giocatori", value: playerCount, href: "/admin/greenvolley/giocatori", icon: "pi-users" },
    { label: "Partite", value: matchCount, href: "/admin/greenvolley/partite", icon: "pi-calendar" },
    { label: "Concluse", value: concludedCount, href: "/admin/greenvolley/partite", icon: "pi-check-circle" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div
          className="text-[10px] font-black uppercase tracking-widest mb-1"
          style={{ color: "#3DD907" }}
        >
          GreenVolley
        </div>
        <h1 className="font-display font-black text-2xl uppercase">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Link
            key={s.href + s.label}
            href={s.href}
            className="admin-card p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2" style={{ color: "#3DD907" }}>
              <i className={`pi ${s.icon}`} />
              <span className="text-xs font-black uppercase tracking-wide">
                {s.label}
              </span>
            </div>
            <div className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              {s.value}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Output atteso: nessun errore.

- [ ] **Step 6: Commit**

```bash
git add app/(admin)/admin/greenvolley/eliminazione/ app/(admin)/admin/greenvolley/page.tsx
git commit -m "feat: add GreenVolley admin knockout and dashboard pages"
```
