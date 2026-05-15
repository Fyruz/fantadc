# Cancellazione Account Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere cancellazione account per utenti (auto-cancellazione con password) e admin (cancellazione utenti USER con propria password).

**Architecture:** Nuovo componente `DeleteAccountDialog` riutilizzato in due contesti; due server action separate (`deleteOwnAccount`, `adminDeleteUser`); banner homepage via `?deleted=1` query param.

**Tech Stack:** Next.js 15 App Router, Prisma, NextAuth (auth.js), bcryptjs, PrimeReact, rate-limiter-flexible, Zod, TypeScript

---

### Task 1: Rate limiter per cancellazione account

**Files:**
- Modify: `lib/rate-limit.ts`

- [ ] Aggiungere il limiter in `lib/rate-limit.ts` dopo `passwordChangeLimiter`:

```ts
// Cancellazione account: max 5 tentativi per utente all'ora
export const deleteAccountLimiter = new RateLimiterMemory({
  points: 5,
  duration: 3600,
  blockDuration: 3600,
});
```

---

### Task 2: Server action `deleteOwnAccount`

**Files:**
- Modify: `app/actions/account.ts`

- [ ] Aggiungere import `deleteAccountLimiter` nell'import da `@/lib/rate-limit` in `app/actions/account.ts`

- [ ] Aggiungere type e action in fondo al file:

```ts
export type DeleteOwnAccountResult = { error?: string; success?: boolean };

export async function deleteOwnAccount(
  _prev: DeleteOwnAccountResult | undefined,
  formData: FormData
): Promise<DeleteOwnAccountResult> {
  const user = await requireAuth();

  const { limited, retryAfter } = await checkRateLimit(
    deleteAccountLimiter,
    `delete-account-${user.id}`
  );
  if (limited) {
    return { error: `Troppi tentativi. Riprova tra ${retryAfter} secondi.` };
  }

  const password = formData.get("password");
  if (!password || typeof password !== "string" || password.length < 1) {
    return { error: "Inserisci la password." };
  }

  const dbUser = await db.user.findUnique({
    where: { id: Number(user.id) },
    select: { passwordHash: true },
  });
  if (!dbUser) return { error: "Utente non trovato." };

  const valid = await bcrypt.compare(password, dbUser.passwordHash);
  if (!valid) return { error: "Password non corretta." };

  await db.user.delete({ where: { id: Number(user.id) } });

  await signOut({ redirectTo: "/?deleted=1" });
  return { success: true };
}
```

---

### Task 3: Server action `adminDeleteUser`

**Files:**
- Modify: `app/actions/admin/users.ts`

- [ ] Aggiungere in fondo a `app/actions/admin/users.ts`:

```ts
export type AdminDeleteUserResult = { error?: string; success?: boolean };

export async function adminDeleteUser(
  _prev: AdminDeleteUserResult | undefined,
  formData: FormData
): Promise<AdminDeleteUserResult> {
  const admin = await requireAdmin();

  const userId = Number(formData.get("userId"));
  const password = formData.get("password");

  if (!password || typeof password !== "string" || password.length < 1) {
    return { error: "Inserisci la tua password." };
  }

  const targetUser = await db.user.findUnique({ where: { id: userId } });
  if (!targetUser) return { error: "Utente non trovato." };
  if (targetUser.role !== "USER") return { error: "Non puoi eliminare un admin." };
  if (targetUser.id === Number(admin.id)) return { error: "Non puoi eliminare te stesso." };

  const adminDbUser = await db.user.findUnique({
    where: { id: Number(admin.id) },
    select: { passwordHash: true },
  });
  if (!adminDbUser) return { error: "Sessione non valida." };

  const valid = await bcrypt.compare(password, adminDbUser.passwordHash);
  if (!valid) return { error: "Password admin non corretta." };

  await logAdminAction(
    Number(admin.id),
    "DELETE_USER",
    "User",
    userId,
    { email: targetUser.email, role: targetUser.role, name: targetUser.name },
    null
  );

  await db.user.delete({ where: { id: userId } });

  revalidatePath("/admin/utenti");
  return { success: true };
}
```

---

### Task 4: Componente `DeleteAccountDialog`

**Files:**
- Create: `components/delete-account-dialog.tsx`

- [ ] Creare il file:

```tsx
"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Password } from "primereact/password";

interface Props {
  visible: boolean;
  onHide: () => void;
  onConfirm: (password: string) => Promise<{ error?: string }>;
  description: string;
}

export default function DeleteAccountDialog({ visible, onHide, onConfirm, description }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleHide = () => {
    setPassword("");
    setError(null);
    onHide();
  };

  const handleConfirm = async () => {
    if (!password) { setError("Inserisci la password."); return; }
    setPending(true);
    setError(null);
    const result = await onConfirm(password);
    if (result.error) {
      setError(result.error);
      setPending(false);
    }
    // Se successo, la server action fa redirect — non serve reset
  };

  return (
    <Dialog
      visible={visible}
      onHide={handleHide}
      header={null}
      closable={!pending}
      style={{ width: "min(24rem, 92vw)", padding: 0 }}
      contentStyle={{ padding: 0 }}
      pt={{ root: { style: { borderRadius: "20px", overflow: "hidden" } } }}
      modal
      draggable={false}
      resizable={false}
    >
      <div className="flex flex-col px-6 py-8 gap-5">
        {/* Icon + title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#FEF2F2" }}
          >
            <i className="pi pi-trash text-2xl" style={{ color: "#DC2626" }} />
          </div>
          <div>
            <p
              className="font-display font-black text-base uppercase"
              style={{ color: "var(--text-primary)" }}
            >
              Elimina account
            </p>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {description}
            </p>
          </div>
        </div>

        {/* Password field */}
        <div>
          <label
            className="block text-xs font-bold uppercase tracking-wide mb-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            Conferma con la tua password
          </label>
          <Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            feedback={false}
            toggleMask
            className="w-full"
            inputClassName="w-full"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={pending}
          />
          {error && (
            <p className="text-xs mt-1.5" style={{ color: "#DC2626" }}>
              {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            label="Annulla"
            severity="secondary"
            outlined
            className="flex-1"
            onClick={handleHide}
            disabled={pending}
          />
          <Button
            label={pending ? "Eliminazione..." : "Sì, elimina"}
            severity="danger"
            className="flex-1"
            onClick={handleConfirm}
            disabled={pending}
          />
        </div>
      </div>
    </Dialog>
  );
}
```

---

### Task 5: Form auto-cancellazione utente

**Files:**
- Create: `app/(user)/account/_delete-account-form.tsx`
- Modify: `app/(user)/account/page.tsx`

- [ ] Creare `app/(user)/account/_delete-account-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import DeleteAccountDialog from "@/components/delete-account-dialog";
import { deleteOwnAccount } from "@/app/actions/account";

export default function DeleteAccountForm() {
  const [visible, setVisible] = useState(false);

  const handleConfirm = async (password: string) => {
    const fd = new FormData();
    fd.append("password", password);
    const result = await deleteOwnAccount(undefined, fd);
    return { error: result?.error };
  };

  return (
    <>
      <DeleteAccountDialog
        visible={visible}
        onHide={() => setVisible(false)}
        onConfirm={handleConfirm}
        description="Questa azione è permanente e irreversibile. La tua squadra fanta e tutti i tuoi dati verranno eliminati."
      />
      <Button
        label="Elimina account"
        icon="pi pi-trash"
        severity="danger"
        outlined
        onClick={() => setVisible(true)}
      />
    </>
  );
}
```

- [ ] Aggiungere sezione "Zona pericolosa" in fondo a `app/(user)/account/page.tsx`:

```tsx
import DeleteAccountForm from "./_delete-account-form";

// Dentro il return, dopo la sezione "Cambia password":
<div
  className="card px-5 py-5"
  style={{ borderColor: "rgba(239,68,68,0.3)", borderWidth: 1, borderStyle: "solid" }}
>
  <div className="over-label mb-1" style={{ color: "#DC2626" }}>Zona pericolosa</div>
  <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
    La cancellazione dell&apos;account è permanente e non può essere annullata.
  </p>
  <DeleteAccountForm />
</div>
```

---

### Task 6: Banner homepage post-cancellazione

**Files:**
- Modify: `app/page.tsx`

- [ ] Aggiungere `searchParams` alla firma di `HomePage` in `app/page.tsx`:

```tsx
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const params = await searchParams;
  const accountDeleted = params.deleted === "1";
  // ... rest of existing code
```

- [ ] Aggiungere il banner subito dopo `<main className="flex-1 pb-24 md:pb-0">`, prima della sezione HERO:

```tsx
{accountDeleted && (
  <div
    className="max-w-lg mx-auto w-full px-4 pt-4"
    style={{ position: "relative", zIndex: 20 }}
  >
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0" }}
    >
      <i className="pi pi-check-circle flex-shrink-0" style={{ color: "#059669" }} />
      <p className="text-sm font-semibold" style={{ color: "#065F46" }}>
        Account eliminato con successo.
      </p>
    </div>
  </div>
)}
```

---

### Task 7: Cancellazione utente lato admin

**Files:**
- Modify: `app/(admin)/admin/utenti/[id]/_actions-form.tsx`
- Modify: `app/(admin)/admin/utenti/[id]/page.tsx`

- [ ] In `app/(admin)/admin/utenti/[id]/page.tsx`, passare `userEmail` a `UserActionsForm`:

Modificare la riga:
```tsx
<UserActionsForm userId={user.id} isSuspended={user.isSuspended} isAdmin={user.role === "ADMIN"} />
```
in:
```tsx
<UserActionsForm userId={user.id} isSuspended={user.isSuspended} isAdmin={user.role === "ADMIN"} userEmail={user.email} />
```

- [ ] Aggiornare `app/(admin)/admin/utenti/[id]/_actions-form.tsx` — aggiungere import, prop `userEmail` e bottone elimina:

```tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import ConfirmDialog from "@/components/confirm-dialog";
import DeleteAccountDialog from "@/components/delete-account-dialog";
import { suspendUser, unsuspendUser, promoteToAdmin, demoteToUser, adminDeleteUser } from "@/app/actions/admin/users";

export default function UserActionsForm({
  userId,
  isSuspended,
  isAdmin,
  userEmail,
}: {
  userId: number;
  isSuspended: boolean;
  isAdmin: boolean;
  userEmail: string;
}) {
  const router = useRouter();
  const suspendFormRef = useRef<HTMLFormElement>(null);
  const demoteFormRef = useRef<HTMLFormElement>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const [dialog, setDialog] = useState<{
    visible: boolean;
    message: string;
    confirmLabel: string;
    severity: "danger" | "warning";
    onConfirm: () => void;
  }>({ visible: false, message: "", confirmLabel: "Sì, confermo", severity: "danger", onConfirm: () => {} });

  const hide = () => setDialog((d) => ({ ...d, visible: false }));

  const handleDeleteConfirm = async (password: string) => {
    const fd = new FormData();
    fd.append("userId", String(userId));
    fd.append("password", password);
    const result = await adminDeleteUser(undefined, fd);
    if (result.error) return { error: result.error };
    router.push("/admin/utenti");
    return {};
  };

  return (
    <div className="flex flex-wrap gap-3">
      <ConfirmDialog
        visible={dialog.visible}
        onHide={hide}
        onConfirm={dialog.onConfirm}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        severity={dialog.severity}
      />

      <DeleteAccountDialog
        visible={deleteVisible}
        onHide={() => setDeleteVisible(false)}
        onConfirm={handleDeleteConfirm}
        description={`Eliminare definitivamente l'account di ${userEmail}? Inserisci la tua password admin per confermare. Questa azione è irreversibile.`}
      />

      {/* Promozione / Retrocessione ruolo */}
      {isAdmin ? (
        <form ref={demoteFormRef} action={demoteToUser as unknown as (fd: FormData) => void}>
          <input type="hidden" name="userId" value={userId} />
          <Button
            type="button"
            label="Rimuovi admin"
            icon="pi pi-user-minus"
            severity="warning"
            onClick={() =>
              setDialog({
                visible: true,
                message: "Rimuovere i privilegi admin da questo utente?",
                confirmLabel: "Sì, rimuovi",
                severity: "warning",
                onConfirm: () => demoteFormRef.current?.requestSubmit(),
              })
            }
          />
        </form>
      ) : (
        <form action={promoteToAdmin as unknown as (fd: FormData) => void}>
          <input type="hidden" name="userId" value={userId} />
          <Button
            type="submit"
            label="Promuovi ad admin"
            icon="pi pi-user-plus"
          />
        </form>
      )}

      {/* Sospensione */}
      {isSuspended ? (
        <form action={unsuspendUser as unknown as (fd: FormData) => void}>
          <input type="hidden" name="userId" value={userId} />
          <Button type="submit" label="Riattiva utente" severity="secondary" icon="pi pi-check" />
        </form>
      ) : (
        <form ref={suspendFormRef} action={suspendUser as unknown as (fd: FormData) => void}>
          <input type="hidden" name="userId" value={userId} />
          <Button
            type="button"
            label="Sospendi utente"
            severity="danger"
            icon="pi pi-ban"
            onClick={() =>
              setDialog({
                visible: true,
                message: "Sospendere questo utente? Non potrà più accedere fino alla riattivazione.",
                confirmLabel: "Sì, sospendi",
                severity: "danger",
                onConfirm: () => suspendFormRef.current?.requestSubmit(),
              })
            }
          />
        </form>
      )}

      {/* Eliminazione — solo utenti non admin */}
      {!isAdmin && (
        <Button
          type="button"
          label="Elimina utente"
          severity="danger"
          outlined
          icon="pi pi-trash"
          onClick={() => setDeleteVisible(true)}
        />
      )}
    </div>
  );
}
```

---

### Task 8: TypeScript check e build

- [ ] Eseguire `npx tsc --noEmit` e correggere eventuali errori
- [ ] Eseguire `npm run build` e verificare che la build passi

---

### Task 9: Commit

- [ ] `git add` di tutti i file modificati e nuovi
- [ ] Commit con messaggio descrittivo
