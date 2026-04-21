# Spec: Redesign pagina creazione squadra fanta

**Data:** 2026-04-21
**Scope:** `app/(user)/squadra/crea/page.tsx` + `_form.tsx`

---

## Obiettivo

Redesign completo della pagina di creazione squadra con focus sul mobile-first. Su mobile la schermata è dominata dal campo di gioco, con UI minimale. Su desktop il layout a due colonne viene mantenuto ma aggiornato con i nuovi componenti.

---

## Layout mobile

### Struttura pagina

La pagina elimina completamente il wrapper `admin-card`, il breadcrumb "← Dashboard", la descrizione testuale e il box info. Il layout è:

```
┌──────────────────────────────┐
│  [Input nome squadra — top, centrato]  │
│                              │
│   ┌────────────────────────┐ │
│   │                        │ │
│   │   CAMPO (full-height)  │ │
│   │   con slot cards       │ │
│   │                        │ │
│   └────────────────────────┘ │
│                              │
│    [Pulsante Conferma — bottom center, fixed] │
└──────────────────────────────┘
```

Spariscono su mobile:
- Badge di validazione (1 Portiere / 4 Giocatori / 5 squadre / Capitano)
- Sezione "Riepilogo rosa" (sidebar con `SlotSummaryRow`)
- Sezione "Capitano" (card con chip selezionabili)
- Header del campo ("Campo di gioco" + counter slot pieni)
- Breadcrumb e descrizione

### Nome squadra

- Input `InputText` centrato orizzontalmente in cima alla schermata, fuori dal campo
- Placeholder "es. I Guerrieri"
- Max-width contenuto (es. `max-w-xs` centrato)
- Nessuna label sopra (solo placeholder)

### Campo di gioco

- Occupa tutto lo spazio verticale disponibile tra nome squadra e pulsante conferma
- `aspect-[5/6]` rimosso: il campo si adatta all'altezza disponibile (`flex-1`)
- Stessi segni grafici del campo esistente (linee, cerchio, area di rigore)
- I 5 slot sono posizionati in assoluto come ora, ma con le nuove card

### Pulsante Conferma

- Ultimo elemento del layout flex della pagina, al centro orizzontale (`flex justify-center`)
- Larghezza contenuta (es. `w-56`)
- Disabilitato se la validazione non è completa
- Label: "Conferma squadra" / "Salvo..." durante il pending
- Nessun `position: fixed` — la pagina mobile non scrolla, quindi il pulsante rimane naturalmente in fondo

---

## Stile slot sul campo

Ogni slot è una **card rettangolare compatta** (sostituisce i cerchi attuali da 80-96px).

### Slot vuoto

```
┌─────────────┐
│  GK / G1    │  ← label piccola muted
│  - - - - -  │  ← bordo tratteggiato
└─────────────┘
```

- Sfondo: `rgba(255,255,255,0.12)`
- Bordo: `1.5px dashed rgba(255,255,255,0.40)`
- Border-radius: `10px`
- Padding: `6px 12px`
- Testo label: `9px`, uppercase, `rgba(255,255,255,0.55)`
- Testo secondario: "Libero", `11px`, `rgba(255,255,255,0.65)`

### Slot pieno

```
┌─────────────┐ ← bordo solid bianco/trasparente
│  JUV        │ ← codice squadra, 9px, muted
│  Vlahovic   │ ← nome, 13px, bold, bianco o testo scuro su bg bianco
└─────────────┘
  [★]           ← badge dorato angolo in alto a dx, solo se capitano
```

- Sfondo: `rgba(255,255,255,0.90)` (quasi opaco, testo scuro)
- Border-radius: `10px`
- Codice squadra: `9px`, `#6466A3`, uppercase, `letter-spacing: 1px`
- Nome: `13px`, `font-weight: 800`, `#06073D`
- Badge capitano: `★` in `#E8A000`, cerchio 18px, posizionato `top:-7px right:-7px`

### Dimensioni e posizionamento

Le card sono più compatte dei cerchi attuali: circa `80px` di larghezza, contenuto auto-height. Le posizioni assolute (% dal centro) rimangono invariate rispetto all'attuale.

---

## Interazione tocco su slot pieno — menu contestuale

Tocco su una card slot piena → appare un **mini menu contestuale** (piccolo popover o bottom-sheet compatto):

```
┌──────────────────────┐
│ ★ Nomina capitano    │  (o "Togli capitano" se già C)
│ ↔ Cambia giocatore   │
│ ✕ Rimuovi            │
└──────────────────────┘
```

- Implementato con uno stato `menuSlot: SlotKey | null` e un piccolo Dialog PrimeReact (`style={{ width: '220px' }}`) o un `div` assolutamente posizionato che appare sopra il campo
- Le 3 azioni corrispondono a: `setCaptainId(player.id)`, `openSlot(slotKey)`, `clearSlot(slotKey)`
- Si chiude cliccando fuori o scegliendo un'azione

Il tocco su slot **vuoto** apre direttamente il bottom sheet di selezione (comportamento invariato).

---

## Bottom sheet — selezione giocatore

Sostituisce il Dialog PrimeReact centrato. Su mobile: slide dal basso, campo sfocato visibile dietro.

### Struttura

1. **Handle bar** — rettangolo grigio centrato in cima al sheet
2. **Titolo** — es. "Seleziona portiere" / "Seleziona giocatore di movimento", `13px`, `font-weight: 800`
3. **Barra di ricerca** — `InputText` con icona lente, filtra nome e codice squadra in tempo reale (client-side)
4. **Lista scrollabile** — raggruppata per squadra:
   - Section header: `9px`, uppercase, `letter-spacing: 2px`, colore muted — es. `JUVENTUS`
   - Riga giocatore: nome a sinistra (`13px`, bold), codice squadra a destra (`10px`, badge pill)
   - Tap su riga → `assignPlayerToActiveSlot(player)` + chiude sheet

Nessun pannello "Slot attivo" / testo descrittivo — rimosso completamente.

### Implementazione

- Su mobile: `Dialog` PrimeReact con `position="bottom"` e `style={{ width: '100%', margin: 0, borderRadius: '20px 20px 0 0' }}`. Il backdrop semitrasparente copre il campo, che rimane visibile dietro il backdrop.
- Su desktop: Dialog centrato standard (stile attuale, semplificato)
- La ricerca è uno `useState<string>` + filtro `useMemo` che cerca su `player.name` e `player.footballTeam.shortName`/`name`

---

## Layout desktop

Il layout a due colonne viene mantenuto (`lg:grid-cols-[1fr_20rem]`) ma aggiornato:

- **Colonna sinistra** — campo di gioco con nuovi slot card, senza header "Campo di gioco"
- **Colonna destra** — card con:
  - Input nome squadra (spostato qui dal top, su desktop)
  - Riepilogo 5 slot (`SlotSummaryRow` o equivalente semplificato)
  - Sezione capitano (chip selezionabili, visibile solo se ci sono giocatori)
  - Badge di validazione (compatti)
  - Pulsante Conferma

Su desktop il menu contestuale usa lo stesso piccolo Dialog del mobile.

Sul desktop il modal rimane un **Dialog centrato** (non bottom sheet), ma con struttura semplificata: nessun pannello slot attivo, solo titolo + search + lista.

---

## Componenti da modificare

| File | Modifiche |
|------|-----------|
| `app/(user)/squadra/crea/page.tsx` | Rimuovere wrapper `admin-card`, breadcrumb, descrizione, box info. Layout mobile full-screen. |
| `app/(user)/squadra/crea/_form.tsx` | Nuovi slot (card rect), menu contestuale, bottom sheet con search, nome squadra centrato mobile, conferma fixed bottom. |

---

## Validazione e messaggi di errore

- I badge di validazione (gkOk, playerOk, teamsOk, captainOk) sono **nascosti su mobile** — il pulsante Conferma è semplicemente disabilitato finché non tutto è valido
- I messaggi di errore server (`state.errors`) restano visibili, sopra o sotto il pulsante Conferma
- Su desktop i badge rimangono nella colonna destra

---

## Fuori scope

- Cambio delle regole di validazione (5 giocatori, 5 squadre diverse, 1 portiere, 1 capitano)
- Cambio del campo visivo (grafica erba, linee del campo)
- Cambio dell'action server `createFantasyTeam`
- Animazioni di transizione elaborate
