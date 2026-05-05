# Admin GreenVolley — Redesign (Round 2, punto 1)

**Data:** 2026-05-05  
**Scope:** Sezione admin — navigazione desktop/mobile + stile pagine lista GreenVolley

---

## Obiettivo

Portare la sezione admin GreenVolley allo stesso livello di qualità visiva e di usabilità della sezione DCup:

1. Menu desktop riorganizzato con dropdown per gruppo (no overflow orizzontale)
2. Top bar mobile compatta (no scroll orizzontale)
3. Pagine lista GreenVolley convertite al pattern DCup (righe cliccabili, metadata inline)

---

## 1. Top bar desktop — Dropdown per gruppo

**File:** `app/(admin)/admin/_top-bar.tsx`

**Problema attuale:** La nav desktop mostra tutti i link in orizzontale con label di gruppo come separatori testuali. Su schermi medi, i link traboccano in scroll orizzontale.

**Soluzione:** I gruppi `Torneo`, `GreenVolley`, `Fanta`, `Sistema` diventano pulsanti cliccabili con indicatore `▾` che aprono/chiudono un dropdown. `Dashboard` rimane link diretto.

**Comportamento dropdown:**
- Apre/chiude al click sul pulsante del gruppo
- Si chiude cliccando fuori (stesso pattern già usato per l'avatar dropdown)
- Un solo dropdown aperto alla volta (aprirne uno chiude gli altri)
- La voce attiva nel dropdown colora il pulsante del gruppo col colore sport corrente
- Dropdown posizionato `absolute` sotto il pulsante, `z-50`, con `box-shadow` e `border-radius`

**Struttura gruppi (invariata):**
- DCup: Dashboard | Torneo (Squadre, Giocatori, Partite, Gironi, Eliminazione, Tipi bonus) | Fanta (Squadre Fanta) | Sistema (Utenti, Audit)
- GreenVolley: Dashboard | GreenVolley (Squadre, Giocatori, Partite, Gironi, Eliminazione) | Sistema (Utenti, Audit)

**Stato attivo:** Se una qualunque voce del dropdown è la pagina corrente, il pulsante del gruppo mostra il colore attivo (background `primaryLight`, testo `primary`).

---

## 2. Top bar mobile — Switcher a icone

**File:** `app/(admin)/admin/_top-bar.tsx`

**Problema attuale:** Il sport switcher mostra `⚽ DCup` e `🏐 GreenVolley` come testo completo, causando overflow della top bar su schermi stretti (≤375px).

**Soluzione:** Su mobile (`md:hidden` / `hidden md:flex` pattern), il switcher mostra solo le emoji:
- Pillola con due slot: `⚽` e `🏐`
- Slot attivo: background bianco, `box-shadow` leggero
- Slot inattivo: solo icona su background trasparente
- Dimensione slot: `w-7 h-7` (28px), sufficiente per tap target

**La top bar mobile mostra:** Logo (emoji box + nome testo) → switcher icone → avatar. Tutto in una riga, senza overflow.

**Il bottom nav rimane invariato.** Lo sport switcher nel drawer "Altro" continua a mostrare il testo completo (lì c'è spazio).

---

## 3. Pagine lista GreenVolley — Pattern DCup

**Pattern di riferimento:** `app/(admin)/admin/squadre/_table.tsx` (DCup)

**Regole del pattern:**
- Contenitore: `<div className="card overflow-hidden">` (stessa classe CSS di DCup)
- Ogni riga: `flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-1)] transition-colors cursor-pointer`
- Click sulla riga → `router.push(...)` alla pagina di edit
- Bordo separatore tra righe: `borderBottom: "1px solid var(--border-soft)"` (tranne ultima)
- Chevron a destra: `<i className="pi pi-chevron-right text-xs flex-shrink-0" style={{ color: "var(--text-disabled)" }} />`
- Delete: `<ConfirmDeleteForm>` (da `@/components/confirm-delete-form`), `onClick={(e) => e.stopPropagation()}`
- Nessun `window.confirm()` — sempre `ConfirmDeleteForm`
- Paginazione opzionale se le liste crescono (PAGE_SIZE = 15, come DCup)
- Colore accent: `#3DD907` (GreenVolley) al posto di `var(--primary)`

### 3a. `greenvolley/squadre/_table.tsx`

**Riga:**
- Titolo: nome squadra
- Subtitle: `👥 N giocatori`
- Badge warning: se `playerCount === 0` → badge giallo `⚠ nessun giocatore`
- Click → `/admin/greenvolley/squadre/[id]/edit`

### 3b. `greenvolley/giocatori/_table.tsx`

**Riga:**
- Titolo: nome giocatore (nessun ruolo/posizione — tutti uguali)
- Subtitle: nome squadra (o `—` se non assegnato)
- Badge warning: se nessuna squadra → badge giallo `⚠ senza squadra`
- Click → `/admin/greenvolley/giocatori/[id]/edit`

### 3c. `greenvolley/partite/_table.tsx`

**Riga:**
- Titolo: `[Squadra Casa] vs [Squadra Ospite]`
- Subtitle: score set (es. `3–1`) + girone se presente
- Tag stato: `CONCLUSA` (verde `#3DD907`) / `IN CORSO` (arancio) / `DRAFT` (grigio)
- Click → `/admin/greenvolley/partite/[id]/edit`

### 3d. Gironi e Eliminazione

Strutture ad hoc (bracket, tabellone) — **non** vengono convertite a lista semplice. Intervento limitato a:
- Usare `className="card"` o `className="admin-card"` in modo coerente con il resto
- Colori accent aggiornati a `#3DD907`
- Eventuali `window.confirm()` sostituiti con `ConfirmDeleteForm`

---

## File modificati

| File | Tipo di modifica |
|---|---|
| `app/(admin)/admin/_top-bar.tsx` | Dropdown desktop + switcher icone mobile |
| `app/(admin)/admin/greenvolley/squadre/_table.tsx` | DataTable → righe cliccabili |
| `app/(admin)/admin/greenvolley/giocatori/_table.tsx` | DataTable → righe cliccabili |
| `app/(admin)/admin/greenvolley/partite/_table.tsx` | DataTable → righe cliccabili con stato/score |
| `app/(admin)/admin/greenvolley/gironi/*` | Allineamento stile (colori, card class, no window.confirm) |
| `app/(admin)/admin/greenvolley/eliminazione/*` | Allineamento stile (colori, card class, no window.confirm) |

**File NON modificati:** `_bottom-nav.tsx` (già funziona bene), pagine DCup, form di creazione/modifica.

---

## Vincoli

- Nessuna modifica alle server actions o al DB
- Nessuna modifica ai form (`_form.tsx`) — solo le tabelle lista
- PrimeReact `Button` va mantenuto dove già usato (paginazione, delete nel drawer)
- `ConfirmDeleteForm` è già presente in `@/components/confirm-delete-form` e funziona con server actions
- TypeScript strict: nessun errore `tsc --noEmit` al termine
