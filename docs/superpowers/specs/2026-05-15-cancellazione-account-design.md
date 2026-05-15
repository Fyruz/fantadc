# Design: Cancellazione Account

**Data:** 2026-05-15  
**Stato:** Approvato

## Obiettivo

Aggiungere la possibilità di cancellare definitivamente un account utente:
- Da parte dell'utente stesso (auto-cancellazione dalla pagina Account)
- Da parte di un admin (dalla pagina dettaglio utente in area admin)

Entrambi i flussi richiedono reinserimento password come conferma. La cancellazione è un hard delete con cascade automatico via Prisma.

## Decisioni prese

- Admin può cancellare solo utenti con ruolo `USER`, non altri admin
- Entrambi i flussi (utente e admin) richiedono reinserimento password
- Dopo auto-cancellazione: redirect a `/` con query param `?deleted=1` per mostrare banner
- Dopo cancellazione da admin: revalidate e redirect a `/admin/utenti`
- Approccio UI: nuovo componente `DeleteAccountDialog` dedicato (non estendere `ConfirmDialog`)

## Componenti

### `components/delete-account-dialog.tsx` (nuovo, client)

Dialog PrimeReact con:
- Icona warning + testo descrittivo parametrizzabile
- Campo `Password` (PrimeReact) per conferma, con `<input type="hidden">` per il form
- Bottoni "Annulla" / "Sì, elimina" (severity `danger`)
- Errore inline (password errata, errore generico)
- Prop `pending` per disabilitare i controlli durante l'invio

**Props:**
```ts
interface Props {
  visible: boolean;
  onHide: () => void;
  onConfirm: (password: string) => Promise<{ error?: string }>;
  description: string;
  pending?: boolean;
}
```

## Server Actions

### `deleteOwnAccount` — `app/actions/account.ts` (nuova)

1. `requireAuth()` — verifica sessione
2. Rate limit su `delete-account-{userId}` (limiter dedicato, massimo 5 tentativi)
3. Valida `password` (min 1 char)
4. `bcrypt.compare(password, dbUser.passwordHash)` — errore se non corrisponde
5. `db.user.delete({ where: { id } })` — cascade elimina: `FantasyTeam`, `Vote`, `PushSubscription`, `AdminAuditLog`
6. `signOut({ redirectTo: "/?deleted=1" })`

### `adminDeleteUser` — `app/actions/admin/users.ts` (nuova)

1. `requireAdmin()` — verifica sessione admin
2. Fetch target user — errore se non trovato
3. Guard: `target.role !== USER` → errore "Non puoi eliminare un admin"
4. Guard: `target.id === admin.id` → impossibile per ruolo ma check difensivo
5. `bcrypt.compare(password, adminDbUser.passwordHash)` — errore se non corrisponde
6. `db.user.delete({ where: { id: userId } })` — cascade
7. `logAdminAction(adminId, "DELETE_USER", "User", userId, snapshot, null)`
8. `revalidatePath("/admin/utenti")`
9. Ritorna `{ success: true }`

**Tipo ritorno:**
```ts
type DeleteUserResult = { error?: string; success?: boolean }
```

## Integrazioni UI

### `app/(user)/account/page.tsx` + nuovo `_delete-account-form.tsx`

- Nuova sezione "Zona pericolosa" in fondo alla pagina Account
- Card con header/bordo rosso per segnalare la criticità
- Bottone "Elimina account" (outlined, danger) → apre `DeleteAccountDialog`
- `description`: "Questa azione è permanente e irreversibile. La tua squadra fanta e tutti i tuoi dati verranno eliminati."
- On success: `signOut` gestito dalla server action con redirect

### `app/(public)/page.tsx` (homepage)

- Legge `searchParams.deleted` — se `"1"`, mostra un banner/toast "Account eliminato con successo."

### `app/(admin)/admin/utenti/[id]/_actions-form.tsx`

- Aggiunta prop `userEmail: string` per il messaggio del dialog
- Bottone "Elimina utente" visibile solo se `isAdmin === false` (severity `danger`, outlined)
- `description`: `Eliminare definitivamente l'account di {email}? Inserisci la tua password admin per confermare. Questa azione è irreversibile.`
- On success: `router.push("/admin/utenti")`

## Cascade Prisma (già configurato)

Cancellare un `User` elimina automaticamente:
- `FantasyTeam` (onDelete: Cascade) → `FantasyTeamPlayer` (Cascade)
- `Vote` (onDelete: Cascade)
- `PushSubscription` (onDelete: Cascade) → `PushNotificationDelivery` (Cascade)
- `AdminAuditLog` (onDelete: Cascade)

Nessuna migrazione DB necessaria.

## Sicurezza

- Password verificata server-side con bcrypt prima di qualsiasi cancellazione
- Rate limiting su auto-cancellazione per prevenire brute force
- Admin non può cancellare altri admin (guard esplicito)
- Audit log registra ogni cancellazione admin con snapshot pre-delete
- Sessione invalidata immediatamente dopo auto-cancellazione via `signOut`
