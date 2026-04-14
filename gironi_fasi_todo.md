# Gironi & Fasi — Piano di implementazione

## Contesto

Il torneo attuale ha partite piatte senza nessuna struttura di fase. Tutti i match condividono lo stesso schema e la classifica è calcolata globalmente su tutte le partite CONCLUDED.

Il nuovo sistema introduce due fasi distinte:
1. **Fase a gironi** — squadre divise in gruppi, ciascun gruppo ha la propria classifica, le prime N di ogni girone passano
2. **Fase ad eliminazione diretta** — turni (quarti, semifinali, finale) con accoppiamenti e avanzamento

Il punteggio fantasy rimane cumulativo su tutte le fasi — non si resetta tra fase a gironi e fase ad eliminazione.

---

## Decisioni — CHIUSE ✓

Tutte le decisioni sono state confermate dall'organizzatore:

1. **4 gironi** da **4 squadre** ciascuno (16 squadre totali), determinati tramite sorteggio
2. **Le prime 2 classificate** di ogni girone passano → 8 squadre al knockout
3. **Bracket fisso** — gli accoppiamenti dei quarti sono predeterminati dalla posizione nel girone:
   - QF 1: **1°A vs 2°B**
   - QF 2: **1°C vs 2°D**
   - QF 3: **2°A vs 1°B**
   - QF 4: **2°C vs 1°D**
   - SF 1: Vincente QF1 vs Vincente QF2
   - SF 2: Vincente QF3 vs Vincente QF4
   - Finale 3°/4°: Perdente SF1 vs Perdente SF2
   - Finale 1°/2°: Vincente SF1 vs Vincente SF2
4. **Sì, c'è il terzo posto** (partita tra perdenti delle semifinali)
5. **Il bracket è visibile prima** — mostra "TBD" finché l'admin non assegna le squadre
6. **Bracket grafico** — non solo lista turni

---

## Schema — Nuovi modelli

### Aggiungere a `prisma/schema.prisma`

```prisma
model Group {
  id          Int          @id @default(autoincrement())
  name        String       // "Girone A", "Girone B", "Girone C", "Girone D"
  slug        String       @unique // "A", "B", "C", "D" — usato nel bracket (es. "1A", "2B")
  order       Int          @default(0)
  createdAt   DateTime     @default(now())

  teams       GroupTeam[]
  matches     Match[]

  @@index([order])
}

model GroupTeam {
  groupId        Int
  footballTeamId Int
  qualified      Boolean     @default(false) // admin lo segna manualmente a fine girone

  group          Group        @relation(fields: [groupId], references: [id], onDelete: Cascade)
  footballTeam   FootballTeam @relation(fields: [footballTeamId], references: [id], onDelete: Restrict)

  @@id([groupId, footballTeamId])
  @@index([footballTeamId])
}

model KnockoutRound {
  id        Int      @id @default(autoincrement())
  name      String   // "Quarti di finale", "Semifinale", "Finale 3°/4° posto", "Finale"
  order     Int      // 1=QF, 2=SF, 3=Finale 3°posto, 4=Finale — ordine bracket
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

// Bracket seed — mostra l'accoppiamento prima che le squadre siano assegnate
// Es. "1A" = primo classificato Girone A, "2B" = secondo classificato Girone B
homeSeed        String?   // es. "1A", "2B" — nullo una volta assegnata la squadra reale
awaySeed        String?   // es. "1C", "2D"

// Bracket position — per ordinare le partite di uno stesso turno nel bracket
bracketPosition Int?      // 1,2,3,4 per i QF; 1,2 per le SF; 1 per 3°/4°; 1 per Finale

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

### Seed del bracket (fatto dall'admin una volta sola)

Quando la fase a gironi è configurata, l'admin crea i turni knockout e i match placeholder:

```
KnockoutRound: Quarti di finale (order=1)
  Match QF1: homeSeed="1A" awaySeed="2B" bracketPosition=1
  Match QF2: homeSeed="1C" awaySeed="2D" bracketPosition=2
  Match QF3: homeSeed="2A" awaySeed="1B" bracketPosition=3
  Match QF4: homeSeed="2C" awaySeed="1D" bracketPosition=4

KnockoutRound: Semifinale (order=2)
  Match SF1: homeSeed="V QF1" awaySeed="V QF2" bracketPosition=1
  Match SF2: homeSeed="V QF3" awaySeed="V QF4" bracketPosition=2

KnockoutRound: Finale 3°/4° posto (order=3)
  Match: homeSeed="P SF1" awaySeed="P SF2" bracketPosition=1

KnockoutRound: Finale (order=4)
  Match: homeSeed="V SF1" awaySeed="V SF2" bracketPosition=1
```

Quando l'admin assegna le squadre reali ai match (dopo la fine del girone), imposta `homeTeamId` e `awayTeamId` e cancella i seed (o li mantiene per riferimento storico).

### Migration

Nessun breaking change — tutti i nuovi campi su `Match` sono nullable. Partite esistenti restano valide con tutti i nuovi campi a `null`.

```bash
npx prisma db push   # aggiunge tabelle e campi nullable
# nessun seed obbligatorio — l'admin crea gironi e turni dall'interfaccia
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
- **Bracket grafico** identico alla vista utente ma con controlli admin
- Per ogni slot partita: pulsante "Assegna squadre" quando le squadre sono TBD
- Per ogni slot: link "Gestisci partita" → `/admin/partite/[id]`
- Bottone "Inizializza bracket" (crea i turni e match placeholder se non esistono ancora — azione una-tantum)
- Stato visivo: TBD (grigio) / Programmata / In corso / Conclusa

#### `app/(admin)/admin/eliminazione/[id]/page.tsx` (dettaglio turno)
- Lista partite del turno con link a gestione
- Form per assegnare le squadre reali a un match TBD:
  - Dropdown home team (filtra su squadre qualificate o tutte)
  - Dropdown away team
  - Salva → imposta `homeTeamId`, `awayTeamId`, azzera i seed

#### `app/actions/admin/knockout.ts`
```typescript
initBracket(formData)         // crea i 4 turni e gli 8 match placeholder con seed predefiniti
updateKnockoutRound(formData) // rename se necessario
assignKnockoutTeams(formData) // matchId, homeTeamId, awayTeamId — assegna squadre al match TBD
deleteKnockoutRound(formData) // solo se senza partite con dati reali
```

#### Flusso operativo admin

1. Fase a gironi completa → admin segna le squadre qualificate in `/admin/gironi/[id]`
2. Admin va in `/admin/eliminazione` → clicca "Inizializza bracket"
3. Sistema crea automaticamente i turni e i match placeholder (QF1: 1A vs 2B, ecc.)
4. Admin assegna le squadre reali ai QF usando la classifica dei gironi come riferimento
5. Dopo ogni partita QF/SF, admin assegna le squadre ai match successivi (avanzamento manuale)
6. Admin gestisce ogni partita normalmente da `/admin/partite/[id]`

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
- **Bracket grafico** a colonne (una colonna per turno: QF → SF → Finale):
  - Ogni "slot" mostra: seed (es. "1A") o nome squadra se assegnata, risultato se CONCLUDED
  - Le linee di connessione tra i match (SVG o CSS border trick)
  - Colori: slot TBD in grigio, squadra assegnata in colore normale, vincente evidenziata
  - Mobile: layout verticale per turno (una colonna scorrevole)
- Finale 3°/4° posto mostrata separatamente sotto il bracket principale
- Click su un match del bracket → apre dettaglio partita `/partite/[id]`

**Struttura visiva bracket (desktop):**
```
QF                 SF              Finale
┌─────────┐
│ 1A vs 2B│─┐
└─────────┘ │  ┌─────────┐
             ├─▶│ V1 vs V2│─┐
┌─────────┐ │  └─────────┘ │   ┌──────────┐
│ 1C vs 2D│─┘               ├──▶│ FINALE   │
└─────────┘                 │   └──────────┘
                             │
┌─────────┐                 │
│ 2A vs 1B│─┐  ┌─────────┐ │
└─────────┘ ├─▶│ V3 vs V4│─┘
┌─────────┐ │  └─────────┘
│ 2C vs 1D│─┘
└─────────┘
```

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

- Una partita ha al massimo UN `groupId` o UN `knockoutRoundId` (mai entrambi) — validato nelle server actions
- Le partite senza `groupId` e senza `knockoutRoundId` continuano a funzionare normalmente (retrocompatibilità totale)
- `computeStandings()` globale rimane invariata — usata per classifica generale del torneo
- La qualificazione (`GroupTeam.qualified`) è **gestita manualmente dall'admin** — evita edge case su parità punti e scontri diretti tra gironi diversi
- Il **bracket è fisso** (1A vs 2B, ecc.) — non serve logica automatica di accoppiamento, l'admin assegna le squadre a mano dopo la fine dei gironi
- L'avanzamento nel bracket è **manuale** — l'admin assegna le squadre a SF/Finale dopo i risultati QF/SF, non c'è logica automatica di "vincente passa"
- Il punteggio fantasy non cambia per fase — rimane cumulativo su tutte le partite di tutte le fasi
- Il vincitore di una partita knockout si deduce dal risultato (`homeScore` vs `awayScore`) — non serve campo dedicato
- I campi `homeSeed`/`awaySeed` (es. "1A", "V QF1") servono solo per display nei placeholder TBD — azzerati o ignorati quando le squadre reali sono assegnate
- Il bracket grafico lato utente/admin è **CSS-based** (grid + border trick) — non serve libreria dedicata; i dati sono abbastanza semplici (4+2+1+1 match)
- **Struttura gironi confermata**: 4 gironi (A, B, C, D) × 4 squadre = 16 squadre totali, partite di sola andata, prime 2 per girone qualificate = 8 team al knockout
