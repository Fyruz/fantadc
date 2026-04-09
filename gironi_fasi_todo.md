# Gironi & Fasi — Piano di implementazione

## Contesto

Il torneo attuale ha partite piatte senza nessuna struttura di fase. Tutti i match condividono lo stesso schema e la classifica è calcolata globalmente su tutte le partite CONCLUDED.

Il nuovo sistema introduce due fasi distinte:
1. **Fase a gironi** — squadre divise in gruppi, ciascun gruppo ha la propria classifica, le prime N di ogni girone passano
2. **Fase ad eliminazione diretta** — turni (quarti, semifinali, finale) con accoppiamenti e avanzamento

Il punteggio fantasy rimane cumulativo su tutte le fasi — non si resetta tra fase a gironi e fase ad eliminazione.

---

## Decisioni da prendere prima dell'implementazione

Prima di iniziare il lavoro, risolvere questi punti con l'organizzatore:

1. **Quanti gironi?** Probabilmente 2–4. Il numero influisce solo sulla configurazione, non sul modello.
2. **Quante squadre passano per girone?** (es. le prime 2 di 4, oppure la prima di 3 + 2 migliori seconde)
3. **Regola per le migliori seconde?** Se passano più seconde, serve un criterio per ordinarle tra gironi diversi.
4. **Esiste il terzo posto?** Partita tra i perdenti delle semifinali.
5. **Il bracket knockout è visibile prima dei match?** (es. mostrare già "Semifinale 1 — da definire" o aspettare che l'admin assegni le squadre)
6. **Le partite d'eliminazione mostrano il bracket o solo la lista turni?** (bracket grafico o lista semplice)

---

## Schema — Nuovi modelli

### Aggiungere a `prisma/schema.prisma`

```prisma
model Group {
  id          Int          @id @default(autoincrement())
  name        String       // "Girone A", "Girone B", …
  order       Int          @default(0)
  createdAt   DateTime     @default(now())

  teams       GroupTeam[]
  matches     Match[]

  @@index([order])
}

model GroupTeam {
  groupId        Int
  footballTeamId Int
  qualified      Boolean     @default(false) // admin lo segna a mano quando il girone finisce

  group          Group        @relation(fields: [groupId], references: [id], onDelete: Cascade)
  footballTeam   FootballTeam @relation(fields: [footballTeamId], references: [id], onDelete: Restrict)

  @@id([groupId, footballTeamId])
  @@index([footballTeamId])
}

model KnockoutRound {
  id        Int      @id @default(autoincrement())
  name      String   // "Quarti di finale", "Semifinale", "Finale", "Terzo posto"
  order     Int      // 1 = prima fase, 2 = seconda, … usato per ordinamento bracket
  createdAt DateTime @default(now())

  matches   Match[]

  @@index([order])
}
```

### Modifiche al modello `Match`

```prisma
// Aggiungere a Match:
groupId         Int?
knockoutRoundId Int?

group           Group?         @relation(fields: [groupId], references: [id], onDelete: SetNull)
knockoutRound   KnockoutRound? @relation(fields: [knockoutRoundId], references: [id], onDelete: SetNull)

@@index([groupId])
@@index([knockoutRoundId])
```

### Modifiche a `FootballTeam`

```prisma
// Aggiungere a FootballTeam:
groupTeams   GroupTeam[]
```

### Migration

Poiché viene aggiunto `groupId` e `knockoutRoundId` nullable su Match, non serve pre-migration SQL — tutte le partite esistenti avranno `null` e rimangono valide come "partite senza fase".

Sequenza deploy:
```
npx prisma db push   # aggiunge le nuove tabelle e i campi nullable
# nessun seed obbligatorio — i gironi vengono creati dall'admin
```

---

## Aggiornamenti a `ai_context/`

- `prisma_model.md` — aggiungere i tre nuovi modelli e i campi su Match
- `db.md` — aggiungere la sezione "Fasi del torneo"
- `domain_rules.md` — aggiungere regole gironi (qualificazione, classifica per girone, spareggi)
- `open_questions.md` — chiudere o spostare le domande sopra una volta decise

---

## Modifiche a `lib/standings.ts`

La funzione `computeStandings()` attuale calcola su tutte le partite CONCLUDED globalmente.

### Nuove funzioni da aggiungere

```typescript
// Classifica di un singolo girone (filtra per groupId)
computeGroupStandings(groupId: number): Promise<StandingEntry[]>

// Classifica globale della fase a gironi (tutte le partite con groupId non null)
computeAllGroupsStandings(): Promise<Map<number, StandingEntry[]>>
```

`computeStandings()` esistente rimane invariata — usata per classifica torneo generale.

---

## Admin — Nuove pagine e componenti

### 1. Gestione gironi

#### `app/(admin)/admin/gironi/page.tsx`
- Lista dei gironi esistenti
- Bottone "Nuovo girone"
- Per ogni girone: nome, numero squadre, numero partite, stato (in corso / concluso)
- Click sulla riga → apre `/admin/gironi/[id]`

#### `app/(admin)/admin/gironi/new/page.tsx` + `_form.tsx`
- Form: nome girone (es. "Girone A"), ordine
- Server action `createGroup` in `app/actions/admin/groups.ts`

#### `app/(admin)/admin/gironi/[id]/page.tsx`
- Layout a due colonne:
  - **Sinistra**: form modifica nome, lista squadre assegnate con pulsante rimozione, form aggiungi squadra (Dropdown con squadre non già in altri gironi), toggle "qualificata" per ciascuna squadra
  - **Destra**: mini-classifica del girone (usa `computeGroupStandings`), lista partite del girone linkate
- Azioni: eliminare girone (solo se senza partite assegnate)

#### `app/actions/admin/groups.ts`
```typescript
createGroup(formData)         // nome, ordine
updateGroup(formData)         // rename
deleteGroup(formData)         // solo se nessuna partita assegnata
addTeamToGroup(formData)      // groupId, footballTeamId — valida unicità squadra tra gironi
removeTeamFromGroup(formData) // groupId, footballTeamId
setTeamQualified(formData)    // groupId, footballTeamId, qualified: boolean
```

---

### 2. Gestione eliminazione diretta

#### `app/(admin)/admin/eliminazione/page.tsx`
- Lista turni (KnockoutRound) ordinati per `order`
- Bottone "Nuovo turno"
- Per ogni turno: nome, numero partite, stato
- Click → apre dettaglio turno (o espande inline)

#### `app/(admin)/admin/eliminazione/new/page.tsx` + `_form.tsx`
- Form: nome turno (es. "Semifinale"), ordine
- Server action `createKnockoutRound`

#### `app/(admin)/admin/eliminazione/[id]/page.tsx`
- Lista partite di questo turno con link a gestione partita
- Bottone "Aggiungi partita" (crea nuova partita con `knockoutRoundId` pre-impostato)
- Per ogni partita: squadre, data, stato, risultato

#### `app/actions/admin/knockout.ts`
```typescript
createKnockoutRound(formData) // nome, ordine
updateKnockoutRound(formData) // rename, riordino
deleteKnockoutRound(formData) // solo se senza partite
```

---

### 3. Modifiche alle pagine esistenti

#### `app/(admin)/admin/partite/new/page.tsx` + `_form.tsx`
- Aggiungere sezione opzionale "Assegna a fase":
  - Radio: Nessuna fase / Girone / Eliminazione diretta
  - Se Girone: Dropdown con lista gironi
  - Se Eliminazione: Dropdown con lista turni
- La selezione pre-imposta `groupId` o `knockoutRoundId` sulla partita

#### `app/(admin)/admin/partite/[id]/_edit-form.tsx`
- Aggiungere gli stessi campi di selezione fase (modifica dopo creazione)

#### `app/(admin)/admin/partite/page.tsx` + `_table.tsx`
- Aggiungere filtro/tab per fase: "Tutte" | "Gironi" | "Eliminazione" | "Senza fase"
- Colonna o badge che indica a quale girone/turno appartiene la partita
- Raggruppamento opzionale per girone o per turno

#### `app/(admin)/admin/squadre/[id]/edit/page.tsx`
- Nel pannello info destra: aggiungere "Girone di appartenenza" (se la squadra è assegnata a un girone)

#### `app/(admin)/admin/page.tsx` (Dashboard)
- Aggiungere card "Stato gironi": X gironi su Y conclusi, X squadre qualificate
- Aggiungere card "Prossimo turno eliminazione" se applicabile

---

## Lato utente — Nuove pagine e componenti

### 1. Pagina gironi

#### `app/(public)/gironi/page.tsx`
- Titolo "GIRONI"
- Per ogni girone (ordinati per `order`): card con
  - Nome girone (es. "Girone A")
  - Classifica mini-table: pos / squadra / G / V / N / S / PT
  - Badge "Qualificata" per le squadre con `qualified = true`
  - Lista partite del girone (con stati e risultati)
- Se nessun girone configurato: messaggio "Gironi non ancora definiti"

### 2. Pagina eliminazione diretta

#### `app/(public)/eliminazione/page.tsx`
- Titolo "FASE AD ELIMINAZIONE DIRETTA"
- Per ogni turno (ordinati per `order`): sezione con
  - Nome turno (es. "Quarti di finale")
  - Lista partite del turno: squadre, data, stato, risultato
  - Badge risultato quando CONCLUDED
- Eventuale bracket grafico (fase 2 — da valutare complessità)

### 3. Aggiornamenti navigazione

#### `components/public-nav.tsx` e `components/public-bottom-nav.tsx`
- Aggiungere link "Gironi" sotto la sezione Torneo
- Aggiungere link "Eliminazione" (o "Bracket") quando la fase knockout è iniziata
- Il nav torneo diventa: Partite | Gironi | Bracket | Classifica torneo

#### `app/(public)/partite/page.tsx`
- Aggiungere filtro visivo (tabs o segmented control): "Tutte" | "Gironi" | "Eliminazione"
- Raggruppare partite per girone o per turno nella rispettiva tab

#### `app/(public)/partite/[id]/page.tsx`
- Aggiungere nel banner o in una info strip: "Girone A" o "Semifinale" a seconda della fase

---

## Modifiche alla navigazione admin

#### `app/(admin)/admin/_top-bar.tsx`
- Nel gruppo "Torneo": aggiungere "Gironi" e "Eliminazione" dopo "Partite"

---

## Ordine di implementazione consigliato

### Step 1 — Schema e base
1. Aggiornare `prisma/schema.prisma` con i nuovi modelli
2. Aggiornare `ai_context/prisma_model.md` e `ai_context/db.md`
3. `npx prisma db push` in dev
4. Aggiungere `computeGroupStandings(groupId)` in `lib/standings.ts`
5. Aggiungere le server actions in `app/actions/admin/groups.ts` e `knockout.ts`

### Step 2 — Admin gironi
6. Pagina lista gironi (`/admin/gironi`)
7. Creazione e modifica girone (`/admin/gironi/new`, `/admin/gironi/[id]`)
8. Assegnazione squadre a girone e toggle qualificazione
9. Modifica form partita per selezione girone/turno

### Step 3 — Admin eliminazione
10. Pagina lista turni (`/admin/eliminazione`)
11. Creazione turno e assegnazione partite

### Step 4 — Lato utente
12. Pagina gironi pubblica (`/public/gironi`)
13. Pagina eliminazione pubblica (`/public/eliminazione`)
14. Aggiornamento navigazione (nav, bottom nav, partite list)
15. Badge fase nel dettaglio partita

### Step 5 — Raffinamento
16. Filtri nella lista partite admin e pubblica
17. Stato gironi nella dashboard admin
18. Bracket grafico (opzionale, da valutare)

---

## File coinvolti — riepilogo

| File | Tipo modifica |
|------|---------------|
| `prisma/schema.prisma` | Nuovi modelli Group, GroupTeam, KnockoutRound; campi su Match |
| `ai_context/prisma_model.md` | Sync con schema |
| `ai_context/db.md` | Nuova sezione fasi |
| `ai_context/domain_rules.md` | Regole gironi e qualificazione |
| `lib/standings.ts` | `computeGroupStandings()`, `computeAllGroupsStandings()` |
| `app/actions/admin/groups.ts` | **nuovo** — CRUD gironi + squadre |
| `app/actions/admin/knockout.ts` | **nuovo** — CRUD turni eliminazione |
| `app/(admin)/admin/gironi/page.tsx` | **nuovo** |
| `app/(admin)/admin/gironi/new/page.tsx` | **nuovo** |
| `app/(admin)/admin/gironi/[id]/page.tsx` | **nuovo** |
| `app/(admin)/admin/eliminazione/page.tsx` | **nuovo** |
| `app/(admin)/admin/eliminazione/new/page.tsx` | **nuovo** |
| `app/(admin)/admin/eliminazione/[id]/page.tsx` | **nuovo** |
| `app/(admin)/admin/partite/new/` | Aggiungere selezione fase |
| `app/(admin)/admin/partite/[id]/_edit-form.tsx` | Aggiungere selezione fase |
| `app/(admin)/admin/partite/page.tsx` + `_table.tsx` | Filtri per fase, colonna fase |
| `app/(admin)/admin/squadre/[id]/edit/page.tsx` | Girone di appartenenza |
| `app/(admin)/admin/page.tsx` | Card stato gironi |
| `app/(admin)/admin/_top-bar.tsx` | Link Gironi ed Eliminazione |
| `app/(public)/gironi/page.tsx` | **nuovo** |
| `app/(public)/eliminazione/page.tsx` | **nuovo** |
| `app/(public)/partite/page.tsx` | Filtri per fase |
| `app/(public)/partite/[id]/page.tsx` | Badge fase nel banner |
| `components/public-nav.tsx` | Link Gironi, Eliminazione |
| `components/public-bottom-nav.tsx` | Aggiornare sezione Torneo |

---

## Note architetturali

- Una partita ha al massimo UN `groupId` o UN `knockoutRoundId` (mai entrambi) — da validare nelle server actions
- Le partite senza `groupId` e senza `knockoutRoundId` continuano a funzionare normalmente (retrocompatibilità)
- `computeStandings()` globale rimane invariata — utile per classifica generale del torneo
- La qualificazione (`GroupTeam.qualified`) è gestita manualmente dall'admin, non calcolata automaticamente — questo evita edge cases su parità punti, scontri diretti, ecc.
- Il punteggio fantasy non cambia per fase — rimane cumulativo su tutte le partite
- L'eliminazione diretta non ha bisogno di un modello "risultato vincitore" esplicito — si deduce dal risultato della partita
