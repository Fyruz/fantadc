# GreenVolley — Piano di Implementazione

Sezione pallavolo separata dal calcio. Tracking partite (set con punteggi), classifica, admin con switcher DCup/GreenVolley.

**Colore primario GreenVolley:** `#3DD907`  
**Routes pubbliche:** `/greenvolley/*`  
**Routes admin:** `/admin/greenvolley/*`

---

## Regole globali da rispettare in ogni task

- IDs Prisma: `Int @id @default(autoincrement())`
- Route params: `params: Promise<{ id: string }>` → `const { id } = await params`
- Server actions con `useActionState`: firma `(_prev: { error?: string } | undefined, formData: FormData)`
- Azioni dirette (delete): nessun prev state, solo `(id: number)`
- `AdminPageHeader` da `@/components/admin-page-header` — props: `title`, `backHref?`, `cta?: { href, label }`
- Contenitori admin: classe CSS `admin-card`
- UI: sempre PrimeReact (`Button`, `InputText`, `DataTable`+`Column`, `Dropdown`, `Tag`) — no elementi HTML nativi
- DB: `import { db } from "@/lib/db"`
- Actions: `revalidatePath(...)` poi `redirect(...)` dopo ogni mutazione
- Colore `#3DD907` hardcodato come stringa (no CSS var)

---

## Task

| # | File | Contenuto |
|---|---|---|
| 1 | [01-schema.md](docs/greenvolley/01-schema.md) | Prisma schema — 7 nuovi modelli + migrazione |
| 2 | [02-standings.md](docs/greenvolley/02-standings.md) | Utility classifica `lib/volley/standings.ts` |
| 3 | [03-actions.md](docs/greenvolley/03-actions.md) | Server actions CRUD `app/actions/admin/volley.ts` |
| 4 | [04-admin-nav.md](docs/greenvolley/04-admin-nav.md) | Switcher sport in `_top-bar.tsx` + `_bottom-nav.tsx` |
| 5 | [05-public-nav.md](docs/greenvolley/05-public-nav.md) | Link GreenVolley in `public-nav.tsx` + `public-bottom-nav.tsx` |
| 6 | [06-admin-teams.md](docs/greenvolley/06-admin-teams.md) | Admin squadre CRUD (lista, nuovo, modifica) |
| 7 | [07-admin-players.md](docs/greenvolley/07-admin-players.md) | Admin giocatori CRUD (lista, nuovo, modifica) |
| 8 | [08-admin-matches.md](docs/greenvolley/08-admin-matches.md) | Admin partite + inserimento set + stato |
| 9 | [09-admin-groups.md](docs/greenvolley/09-admin-groups.md) | Admin gironi (crea, assegna squadre, qualifica) |
| 10 | [10-admin-knockout.md](docs/greenvolley/10-admin-knockout.md) | Admin eliminazione diretta |
| 11 | [11-public-layout.md](docs/greenvolley/11-public-layout.md) | Layout pubblico + sub-nav + pagina overview |
| 12 | [12-public-matches.md](docs/greenvolley/12-public-matches.md) | Lista partite + dettaglio con set |
| 13 | [13-public-standings.md](docs/greenvolley/13-public-standings.md) | Classifica + gironi + eliminazione pubblici |
| 14 | [14-public-teams.md](docs/greenvolley/14-public-teams.md) | Squadre + giocatori pubblici |
| 15 | [15-verify.md](docs/greenvolley/15-verify.md) | `npx tsc --noEmit` + `npm run build` + commit |

---

## Ordine di esecuzione consigliato

Eseguire i task **nell'ordine numerico**. I task 1-3 sono fondamentali (schema + utility + actions) e vanno completati prima di qualsiasi pagina. I task 4-5 modificano la navigazione esistente. I task 6-15 sono indipendenti tra loro ma dipendono dai task 1-3.


### TODO Round 2
- 1. Sezione Admin ✅ fatto
    - rendere il design della sezione admin piu simile alla gestione della dcup (stile, design, feeling semplice ma completo)
    - Rivedere il menu in alto, magari organizzarlo a tendine, invece che a scorrimento verticale (da desktop)
    - Da mobile, rivederlo per renderlo piu usabile (appare lo scroll horizontale)
- 2. Sezione pubblica ✅ fatto
    - Rivedere il menu da desktop, anche qua organizzandolo magari in tendine
    - Usare lo switch come lato admin, e far cambiare anche il menu in alto (non deve essere un wrapper della parte greenvolley), il feeling deve essere di sito a parte (con colore suo)
- 3. Aggiornare loghi ✅ fatto
    - Aggiornare il logo nel menu quando siamo sulla sezione DCUP
    - Aggiornare il logo quando siamo nella sezione greenvolley
- 4. Aggiornare ICO del sito e della PWA