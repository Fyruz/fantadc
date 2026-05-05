# Task 3 — Server Actions Admin

**File da creare:** `app/actions/admin/volley.ts`

Contiene tutte le mutazioni CRUD per GreenVolley: squadre, giocatori, partite, set, gironi, knockout.

---

## Passi

- [ ] **Step 1: Crea `app/actions/admin/volley.ts`**

```ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionResult = { error?: string } | undefined;

// ─── SQUADRE ──────────────────────────────────────────────────────────────────

export async function createVolleyTeam(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return { error: "Nome obbligatorio" };
  await db.volleyTeam.create({ data: { name } });
  revalidatePath("/admin/greenvolley/squadre");
  redirect("/admin/greenvolley/squadre");
}

export async function updateVolleyTeam(
  id: number,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return { error: "Nome obbligatorio" };
  await db.volleyTeam.update({ where: { id }, data: { name } });
  revalidatePath("/admin/greenvolley/squadre");
  redirect("/admin/greenvolley/squadre");
}

export async function deleteVolleyTeam(id: number): Promise<void> {
  await db.volleyTeam.delete({ where: { id } });
  revalidatePath("/admin/greenvolley/squadre");
}

// ─── GIOCATORI ────────────────────────────────────────────────────────────────

export async function createVolleyPlayer(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string | null)?.trim();
  const teamId = Number(formData.get("teamId"));
  if (!name) return { error: "Nome obbligatorio" };
  if (!teamId) return { error: "Squadra obbligatoria" };
  await db.volleyPlayer.create({ data: { name, teamId } });
  revalidatePath("/admin/greenvolley/giocatori");
  redirect("/admin/greenvolley/giocatori");
}

export async function updateVolleyPlayer(
  id: number,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string | null)?.trim();
  const teamId = Number(formData.get("teamId"));
  if (!name) return { error: "Nome obbligatorio" };
  if (!teamId) return { error: "Squadra obbligatoria" };
  await db.volleyPlayer.update({ where: { id }, data: { name, teamId } });
  revalidatePath("/admin/greenvolley/giocatori");
  redirect("/admin/greenvolley/giocatori");
}

export async function deleteVolleyPlayer(id: number): Promise<void> {
  await db.volleyPlayer.delete({ where: { id } });
  revalidatePath("/admin/greenvolley/giocatori");
}

// ─── PARTITE ──────────────────────────────────────────────────────────────────

export async function createVolleyMatch(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const homeTeamId = Number(formData.get("homeTeamId"));
  const awayTeamId = Number(formData.get("awayTeamId"));
  const dateRaw = formData.get("date") as string | null;
  const groupId = Number(formData.get("groupId")) || null;
  const knockoutRoundId = Number(formData.get("knockoutRoundId")) || null;

  if (!homeTeamId || !awayTeamId) return { error: "Seleziona entrambe le squadre" };
  if (homeTeamId === awayTeamId) return { error: "Le squadre devono essere diverse" };

  await db.volleyMatch.create({
    data: {
      homeTeamId,
      awayTeamId,
      date: dateRaw ? new Date(dateRaw) : null,
      groupId,
      knockoutRoundId,
    },
  });
  revalidatePath("/admin/greenvolley/partite");
  redirect("/admin/greenvolley/partite");
}

export async function updateVolleyMatch(
  id: number,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const homeTeamId = Number(formData.get("homeTeamId"));
  const awayTeamId = Number(formData.get("awayTeamId"));
  const dateRaw = formData.get("date") as string | null;
  const groupId = Number(formData.get("groupId")) || null;
  const knockoutRoundId = Number(formData.get("knockoutRoundId")) || null;

  if (!homeTeamId || !awayTeamId) return { error: "Seleziona entrambe le squadre" };
  if (homeTeamId === awayTeamId) return { error: "Le squadre devono essere diverse" };

  await db.volleyMatch.update({
    where: { id },
    data: {
      homeTeamId,
      awayTeamId,
      date: dateRaw ? new Date(dateRaw) : null,
      groupId,
      knockoutRoundId,
    },
  });
  revalidatePath("/admin/greenvolley/partite");
  revalidatePath(`/admin/greenvolley/partite/${id}`);
  redirect(`/admin/greenvolley/partite/${id}`);
}

export async function deleteVolleyMatch(id: number): Promise<void> {
  await db.volleyMatch.delete({ where: { id } });
  revalidatePath("/admin/greenvolley/partite");
}

export async function scheduleVolleyMatch(id: number): Promise<void> {
  await db.volleyMatch.update({ where: { id }, data: { status: "SCHEDULED" } });
  revalidatePath(`/admin/greenvolley/partite/${id}`);
}

export async function concludeVolleyMatch(id: number): Promise<void> {
  await db.volleyMatch.update({ where: { id }, data: { status: "CONCLUDED" } });
  revalidatePath(`/admin/greenvolley/partite/${id}`);
  revalidatePath("/greenvolley/classifica");
}

export async function reopenVolleyMatch(id: number): Promise<void> {
  await db.volleyMatch.update({ where: { id }, data: { status: "SCHEDULED" } });
  revalidatePath(`/admin/greenvolley/partite/${id}`);
}

// ─── SET ──────────────────────────────────────────────────────────────────────

export async function addVolleySet(
  matchId: number,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const homePoints = Number(formData.get("homePoints"));
  const awayPoints = Number(formData.get("awayPoints"));

  if (isNaN(homePoints) || homePoints < 0) return { error: "Punti casa non validi" };
  if (isNaN(awayPoints) || awayPoints < 0) return { error: "Punti ospiti non validi" };

  const existing = await db.volleySet.count({ where: { matchId } });
  if (existing >= 5) return { error: "Massimo 5 set per partita" };

  await db.volleySet.create({
    data: { matchId, setNumber: existing + 1, homePoints, awayPoints },
  });
  revalidatePath(`/admin/greenvolley/partite/${matchId}`);
}

export async function deleteVolleySet(setId: number, matchId: number): Promise<void> {
  await db.volleySet.delete({ where: { id: setId } });
  // Rinumera i set rimanenti
  const remaining = await db.volleySet.findMany({
    where: { matchId },
    orderBy: { setNumber: "asc" },
  });
  for (let i = 0; i < remaining.length; i++) {
    await db.volleySet.update({
      where: { id: remaining[i].id },
      data: { setNumber: i + 1 },
    });
  }
  revalidatePath(`/admin/greenvolley/partite/${matchId}`);
}

// ─── GIRONI ───────────────────────────────────────────────────────────────────

export async function createVolleyGroup(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return { error: "Nome obbligatorio" };
  await db.volleyGroup.create({ data: { name } });
  revalidatePath("/admin/greenvolley/gironi");
  redirect("/admin/greenvolley/gironi");
}

export async function deleteVolleyGroup(id: number): Promise<void> {
  await db.volleyGroup.delete({ where: { id } });
  revalidatePath("/admin/greenvolley/gironi");
}

export async function addTeamToVolleyGroup(
  groupId: number,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const teamId = Number(formData.get("teamId"));
  if (!teamId) return { error: "Seleziona una squadra" };
  const exists = await db.volleyGroupTeam.findUnique({
    where: { groupId_teamId: { groupId, teamId } },
  });
  if (exists) return { error: "Squadra già nel girone" };
  await db.volleyGroupTeam.create({ data: { groupId, teamId } });
  revalidatePath("/admin/greenvolley/gironi");
}

export async function removeTeamFromVolleyGroup(
  groupId: number,
  teamId: number
): Promise<void> {
  await db.volleyGroupTeam.delete({
    where: { groupId_teamId: { groupId, teamId } },
  });
  revalidatePath("/admin/greenvolley/gironi");
}

export async function setVolleyTeamQualified(
  groupId: number,
  teamId: number,
  qualified: boolean
): Promise<void> {
  await db.volleyGroupTeam.update({
    where: { groupId_teamId: { groupId, teamId } },
    data: { qualified },
  });
  revalidatePath("/admin/greenvolley/gironi");
}

// ─── KNOCKOUT ─────────────────────────────────────────────────────────────────

export async function createVolleyKnockoutRound(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string | null)?.trim();
  const order = Number(formData.get("order"));
  if (!name) return { error: "Nome obbligatorio" };
  if (!order) return { error: "Ordine obbligatorio" };
  await db.volleyKnockoutRound.create({ data: { name, order } });
  revalidatePath("/admin/greenvolley/eliminazione");
  redirect("/admin/greenvolley/eliminazione");
}

export async function deleteVolleyKnockoutRound(id: number): Promise<void> {
  await db.volleyKnockoutRound.delete({ where: { id } });
  revalidatePath("/admin/greenvolley/eliminazione");
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Output atteso: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add app/actions/admin/volley.ts
git commit -m "feat: add GreenVolley admin server actions"
```
