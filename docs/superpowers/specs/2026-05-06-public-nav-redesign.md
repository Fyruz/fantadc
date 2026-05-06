# Public Nav Redesign (Round 2, punto 2)

**Data:** 2026-05-06  
**Scope:** Navigazione pubblica — top bar trasformabile per sport, dropdown desktop DCup, bottom nav mobile adattivo

---

## Obiettivo

Quando l'utente naviga su `/greenvolley/*`, tutta la navigazione (top bar desktop + bottom nav mobile) deve trasformarsi in una navigazione GreenVolley con colore verde e link propri — non più una sub-nav sotto quella DCup. Il feeling deve essere di sito a parte. Su `/` e tutte le route DCup, la navigazione rimane invariata rispetto ad oggi ma con i link di Torneo organizzati in dropdown.

---

## 1. Architettura — Split server/client di public-nav

**Problema:** `components/public-nav.tsx` è un server component async (chiama `getCurrentUser()`). Rilevare il percorso corrente richiede `usePathname()` che è un hook client.

**Soluzione:** Split in due file:

### `components/public-nav.tsx` (server wrapper, invariato nella firma)
```tsx
import { getCurrentUser } from "@/lib/session";
import PublicNavClient from "./public-nav-client";

export default async function PublicNav() {
  const user = await getCurrentUser();
  return <PublicNavClient user={user} />;
}
```

Il file `app/(public)/layout.tsx` rimane invariato — importa `PublicNav` e non sa nulla del cambio interno.

### `components/public-nav-client.tsx` (nuovo, "use client")
Contiene tutta la logica di rendering. Riceve `user` come prop (tipo: il risultato di `getCurrentUser()` — `User | null`). Usa `usePathname()` per rilevare `isGV = pathname.startsWith("/greenvolley")`.

---

## 2. Desktop nav — due stati

### Stato DCup (default, route non-GreenVolley)

**Logo:** `⚽ DCUP 26` (invariato)

**Sport switcher:** pillola con `⚽ DCup` (attivo) e `🏐 GreenVolley`. Testo completo su desktop, solo emoji su mobile (`hidden md:inline` — stesso pattern admin). Link attivo → bg bianco + colore `var(--primary)`. Link inattivo → `var(--text-muted)`. Navigazione a `/greenvolley` per GreenVolley, `/` per DCup.

**Nav desktop (`hidden md:flex`):**
- **Torneo** → pulsante dropdown con `▾`, apre pannello con: Partite, Gironi, Eliminazione, Squadre, Giocatori, Classifica, Marcatori (7 link)
- **Fanta** → pulsante dropdown con `▾`, apre pannello con: Classifica Fanta
- **Regolamento** → link diretto (flat, no dropdown — singolo link)
- Dropdown si apre/chiude al click, si chiude su click esterno (stesso pattern `navRef` + `useEffect` dell'admin top bar)
- Pulsante del gruppo colorato con `var(--primary-light)` / `var(--primary)` se qualsiasi child è attivo
- Nessun `NavDivider` — rimosso

**Auth:** invariato (Accedi + REGISTRATI oppure Dashboard + Admin + ESCI)

**Bordo bottom header:** `1px solid var(--border-soft)` (DCup — invariato)

### Stato GreenVolley (route `/greenvolley/*`)

**Logo:** `🏐 GREENVOLLEY` (testo: "GREEN" normale + "VOLLEY" in `#3DD907`)

**Sport switcher:** stesso componente, stile invertito — GreenVolley attivo in `#3DD907`, DCup inattivo

**Nav desktop (`hidden md:flex`):** 7 link **flat** (nessun dropdown — tutti entrano):
- Home (`/greenvolley`), Partite, Classifica, Gironi, Eliminazione, Squadre, Giocatori
- Link attivo: bg `#f0fde7`, testo `#3DD907`
- Link inattivo: `var(--text-muted)`

**Auth:** stesso contenuto ma il pulsante REGISTRATI usa background `#3DD907` (verde)

**Bordo bottom header:** `2px solid #3DD907` (distingue visivamente la nav GreenVolley)

---

## 3. Mobile top bar — switcher compatto

Su mobile (`md:hidden` inverso: i link nav restano nascosti), la top bar mostra:

- Logo (cambia tra DCup e GreenVolley come su desktop)
- Switcher compatto: solo emoji `⚽` / `🏐` (testo nascosto con `hidden md:inline`) — stesso pattern admin
- Auth buttons (compact)

Il switcher su mobile non causa overflow perché le emoji sono piccole (stesso approccio della top bar admin).

---

## 4. Mobile bottom nav — due stati

**File:** `components/public-bottom-nav.tsx` (già client component)

Aggiunge rilevamento sport: `const isGV = pathname.startsWith("/greenvolley")`.

### Stato GreenVolley (`isGV === true`)

**Main bar (4 + 1 items):**
1. Partite → `/greenvolley/partite` (`pi-calendar`) — verde
2. Classifica → `/greenvolley/classifica` (`pi-list`) — verde (link diretto, no drawer)
3. Squadre → `/greenvolley/squadre` (`pi-shield`) — verde
4. Giocatori → `/greenvolley/giocatori` (`pi-users`) — verde
5. Altro → drawer verde

**Drawer "Altro" GreenVolley:**
- Sport switcher in testa (⚽ DCup / 🏐 GreenVolley) — stesso stile del drawer admin
- Gironi → `/greenvolley/gironi`
- Eliminazione → `/greenvolley/eliminazione`
- Home → `/greenvolley`

**Colori accento:** `#3DD907` (tutti gli indicatori attivi, bordo top del bottom nav)

### Stato DCup (`isGV === false`)

**Main bar:** invariata rispetto ad oggi (Partite, Classifica drawer, Fanta, Il Mio, Altro)

**Drawer "Altro":** invariato — rimuovere solo la riga `GreenVolley` (ora raggiungibile via switcher nel drawer stesso)

**Drawer "Altro" DCup aggiornato:**
- Sport switcher in testa (⚽ DCup attivo / 🏐 GreenVolley)
- Gironi, Eliminazione, Giocatori, Squadre, Regolamento (invariati)

---

## 5. Rimozione sub-nav GreenVolley

**`app/(public)/greenvolley/layout.tsx`:** rimuovere import e uso di `GreenVolleySubNav`. Il file diventa semplicemente `{ children }`.

**`app/(public)/greenvolley/_sub-nav.tsx`:** il file può essere eliminato — i link ora vivono nella top bar.

---

## 6. Chiusura dropdown su cambio sport

Come nell'admin (`useEffect(() => { setOpenGroup(null); }, [isGV])`), se un dropdown è aperto e l'utente cambia sport, lo stato `openGroup` va resettato.

---

## File modificati

| File | Tipo |
|---|---|
| `components/public-nav.tsx` | Modify — diventa thin server wrapper |
| `components/public-nav-client.tsx` | Create — tutta la logica UI (client) |
| `components/public-bottom-nav.tsx` | Modify — aggiunge modalità GreenVolley |
| `app/(public)/greenvolley/layout.tsx` | Modify — rimuove sub-nav |
| `app/(public)/greenvolley/_sub-nav.tsx` | Delete |

**File NON modificati:** `app/(public)/layout.tsx`, nessuna route page.

---

## Vincoli

- `public-nav.tsx` rimane importato dall'esterno con la stessa firma — nessun cambio ai layout che lo usano
- `getCurrentUser()` viene chiamato solo nel server wrapper, mai nel client component
- PrimeReact `Button` per i pulsanti interattivi nel bottom nav (già in uso)
- TypeScript strict: nessun errore `tsc --noEmit`
- Il tipo di `user` passato come prop al client è quello restituito da `getCurrentUser()` — verificare il tipo esatto prima dell'implementazione (`User | null` da Prisma/NextAuth)
