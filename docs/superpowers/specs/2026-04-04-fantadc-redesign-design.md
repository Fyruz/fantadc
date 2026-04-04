# Fantadc — Premium Football Redesign

**Data:** 2026-04-04  
**Approccio:** Token Swap + Componenti condivisi + Pagine principali

---

## Obiettivo

Ridisegnare l'intero sito con uno stile football premium, pulito, mobile-first. Il dark theme attuale viene sostituito con un light theme con identità calcistica forte: superfici con tinta blu, tipografia bold/condensed maiuscola, accento oro.

---

## Design System

### Palette — Blue Sport

| Token | Valore | Uso |
|---|---|---|
| `--bg-base` | `#FFFFFF` | Background principale |
| `--bg-secondary` | `#F5F6FF` | Background sezioni alternate |
| `--surface-1` | `#F0F2FF` | Card, pannelli, surface elevate |
| `--surface-2` | `#E4E7FF` | Surface più elevate, stati hover |
| `--primary` | `#0107A3` | Brand, bottoni primari, icone attive |
| `--primary-hover` | `#0A14B8` | Hover su primary |
| `--primary-dark` | `#000669` | Gradiente scuro, hero |
| `--primary-light` | `rgba(1,7,163,0.08)` | Background tinta su elementi blu |
| `--primary-glow` | `rgba(1,7,163,0.20)` | Box-shadow blu |
| `--gold` | `#E8A000` | Accento premium, CTA MVP, 1° posto |
| `--gold-shadow` | `rgba(232,160,0,0.40)` | Box-shadow oro |
| `--border-soft` | `rgba(1,7,163,0.07)` | Bordi card sottili |
| `--border-medium` | `#DDE1F7` | Bordi visibili |
| `--border-active` | `#0107A3` | Bordi focus/attivi |
| `--text-primary` | `#06073D` | Testo principale (dark blue-black) |
| `--text-secondary` | `#2D2F7A` | Testo secondario |
| `--text-muted` | `#6466A3` | Label, caption, placeholder |
| `--text-disabled` | `#9A9CC4` | Testo disabilitato |
| `--live` | `#22C55E` | Stato live |
| `--ended` | `#EF4444` | Stato errore |
| `--success` | `#065F46` | Testo successo |
| `--warning` | `#92400E` | Testo warning |

### Gradiente hero / card premium

```css
background: linear-gradient(145deg, #0107A3 0%, #000669 100%);
box-shadow: 0 6px 24px rgba(1,7,163,0.30);
```

### Tipografia

**Font strategy:** Aggiungere **Barlow Condensed** (Google Fonts, via `next/font/google`) come font display per titoli, nomi squadra e punteggi — dà il feel condensed/sport autentico dei mockup. Geist Sans resta per corpo, label e form. Usare `weight: ['700', '800', '900']` e `subsets: ['latin']`.

```tsx
// app/layout.tsx
import { Barlow_Condensed, Geist } from "next/font/google";
const barlowCondensed = Barlow_Condensed({ weight: ['700','800','900'], subsets: ['latin'], variable: '--font-display' });
```

Applicare `--font-display` come `font-family` sui titoli uppercase. Geist rimane default body.

| Uso | Stile |
|---|---|
| Logo / Nome brand | `font-weight: 900`, `text-transform: uppercase`, `letter-spacing: -0.5px` |
| Titoli sezione (H1/H2) | `font-weight: 900`, `text-transform: uppercase`, `letter-spacing: -0.5px`, `font-size: 20–28px` |
| Nome squadra / giocatore | `font-weight: 900`, `text-transform: uppercase`, `letter-spacing: 0.2px` |
| Punteggi / numeri | `font-weight: 900`, `letter-spacing: -1px`, colore `--primary` o `--gold` |
| Over-label (sopra titoli) | `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 2px`, `font-size: 9–10px`, colore `--text-muted` |
| Corpo / descrizioni | `font-weight: 400–500`, colore `--text-muted`, `font-size: 12–14px` |
| Badge / chip | `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.5px`, `font-size: 9–11px` |

### Componenti base

#### Bottoni
- **Primario:** `background: #0107A3`, `color: #fff`, `border-radius: 9999px`, `font-weight: 900`, `text-transform: uppercase`
- **Gold / MVP:** `background: #E8A000`, `color: #06073D`, stesso border-radius, con `box-shadow: 0 2px 8px rgba(232,160,0,0.35)`
- **Outline:** `border: 2px solid #0107A3`, `color: #0107A3`, trasparente
- **Secondario:** `background: #F0F2FF`, `color: #06073D`, bordo `#DDE1F7`

#### Card
```css
background: #FFFFFF;
border: 1px solid rgba(1,7,163,0.06);
border-radius: 16px;
box-shadow: 0 2px 12px rgba(1,7,163,0.08);
```

#### Card premium (hero / squadra / podio)
```css
background: linear-gradient(145deg, #0107A3, #000669);
border-radius: 18px;
box-shadow: 0 6px 24px rgba(1,7,163,0.30);
/* Cerchi decorativi in ::before/::after o div assoluti */
```

#### Badge stato partita
- `BOZZA` → `bg: #F9FAFB`, `color: #6466A3`, `border: #E4E7FF`
- `PROGRAMMATA` → `bg: #EFF6FF`, `color: #1E40AF`, `border: #BFDBFE`
- `CONCLUSA` → `bg: #FFFBEB`, `color: #92400E`, `border: #FDE68A`
- `PUBBLICATA` → `bg: #ECFDF5`, `color: #065F46`, `border: #A7F3D0`
- Border-radius: `9999px`, font-weight: `700`, uppercase, font-size: `9–11px`

#### Riga classifica — 1° posto
Badge oro: `background: linear-gradient(135deg, #E8A000, #C87800)`, `border-radius: 11px`, `box-shadow: 0 3px 10px rgba(232,160,0,0.5)`

#### Chip giocatore (dentro card squadra su sfondo blu)
```css
background: rgba(255,255,255,0.12);
border: 1px solid rgba(255,255,255,0.18);
color: rgba(255,255,255,0.9);
border-radius: 9999px;
/* Capitano: */
background: rgba(232,160,0,0.30);
border-color: rgba(232,160,0,0.50);
color: #FFD166;
```

#### Logo / Logomark
```
[⚽] FANTA[DC]
logomark: 26×26px, background #0107A3, border-radius 7px
logo-text: font-weight 900, uppercase; "DC" in colore #0107A3 (su sfondo chiaro)
```

---

## Layout

### Navigazione pubblica (desktop — top bar)
- `background: #FFFFFF`, `border-bottom: 1px solid rgba(1,7,163,0.08)`
- Logo a sinistra, nav links centrati, azioni a destra
- Link attivo: `color: #0107A3`, `font-weight: 700`
- Link inattivo: `color: #6466A3`

### Bottom nav (mobile)
- `background: #FFFFFF`, `border-top: 1px solid rgba(1,7,163,0.08)`
- 4 tab: Partite / Classifica / Fantasy / Il mio
- Indicatore attivo: barra `3px` `#0107A3` in cima al tab, label in `#0107A3`
- Tab inattivo: icona + label in `#B4B6CC`

### Admin — top bar
- Stesso stile della public nav, con breadcrumb/titolo sezione e avatar utente
- Admin bottom nav: Panoramica / Partite / Giocatori / Altro

---

## Pagine principali — specifiche

### Home (`/`)
1. **Hero section:** gradiente `#0107A3 → #000338`, pill badge torneo, titolo 2 righe "FANTA / DC" (DC in oro), divider oro 36px, sottotitolo, CTA "PARTECIPA ORA →" oro con glow
2. **Stats strip:** bianco, 3 colonne (Squadre / Giocatori / Fantasy), numero in blu, label muted
3. **Ultime partite:** card bianca con ombra blu, righe separate, badge stato, link "Vedi tutte →"
4. **Quick links:** griglia 2×2 card (Classifica / Partite / Squadre / Regolamento)

### Classifica (`/classifica`)
1. Over-label + titolo sezione
2. **Podio top-2:** card premium blu con gradiente, 1° con badge oro+glow, 2° con badge opaco, punteggi grandi
3. **Lista dal 3° in poi:** card bianca, righe alternate `#FAFBFF`, badge posizione `#E4E7FF`

### Partite (`/partite` e `/partite/[id]`)
- Lista: card bianche con ombra, layout "CASA vs OSPITE" centrato, badge stato in alto
- Partite concluse: card con `background: #F0F2FF`
- Dettaglio partita: header con squadre, sezione giocatori convocati, sezione bonus

### Dashboard utente (`/dashboard`)
1. Over-label + nome utente
2. **Card squadra premium:** gradiente blu, nome squadra + punteggio oro grande, chip giocatori (capitano in oro)
3. **Card posizione:** badge oro con numero, testo "X° su N squadre"
4. **Sezione vota MVP:** card bianca, righe partita, CTA "VOTA" oro, badge "✓ Votato" verde

### Squadra (`/squadra`)
- Card premium identica al dashboard per il riepilogo
- Lista giocatori con ruolo, squadra reale, punteggio per partita

### Vota MVP (`/vota/[id]`)
- Header partita in card premium blu
- Griglia giocatori selezionabili, stato selezione con highlight oro
- CTA "CONFERMA VOTO" blu primario

### Login / Register (`/login`, `/register`)
- Layout centrato, card bianca con ombra, logo in cima, form pulito

### Admin area
- Stessa palette light, top bar con logomark, contenuto max-width wide
- Tabelle: header `#F0F2FF`, righe alternate `#FAFBFF`, hover `rgba(1,7,163,0.04)`
- Tutte le card admin: white + ombra blu sottile

---

## Cosa cambia nei file

### `app/globals.css`
- Sostituire tutti i CSS custom properties dark con i nuovi token light
- Aggiornare PrimeReact overrides (DataTable, InputText, Dropdown, Dialog, Button) per il light theme
- Aggiungere classi: `.card-premium`, `.over-label`, `.gold-badge`, aggiornare `.badge-*`, `.btn-*`
- Rimuovere variabili dark (`--bg-base: #070B14` ecc.)

### `app/layout.tsx`
- Cambiare il tema PrimeReact: da `lara-dark-blue` a `lara-light-blue`

### `components/public-nav.tsx`
- Applicare nuovo logomark, stili link aggiornati

### `components/public-bottom-nav.tsx`
- Nuovo stile: sfondo bianco, indicatore blu in cima, label uppercase 8px

### `app/(admin)/admin/_top-bar.tsx`
- Allineare al nuovo design system

### `app/(admin)/admin/_bottom-nav.tsx`
- Stesso approccio bottom nav pubblica

### Pagine (in ordine di priorità):
1. `app/page.tsx` — Home completa
2. `app/(public)/classifica/page.tsx` + `_table.tsx`
3. `app/(public)/partite/page.tsx` + `[id]/page.tsx`
4. `app/(user)/dashboard/page.tsx`
5. `app/(user)/squadra/page.tsx` + `crea/_form.tsx`
6. `app/(user)/vota/[id]/page.tsx` + `_vote-form.tsx`
7. `app/(public)/login/page.tsx` + `_form.tsx`
8. `app/(public)/register/page.tsx`
9. `app/(public)/squadre-fantasy/page.tsx` + `[id]/page.tsx`
10. Pagine admin secondarie (ereditano già molto dai token)

---

## Checklist step completion

- [ ] `npx tsc --noEmit` senza errori
- [ ] `npm run build` senza errori
- [ ] Commit tutto incluso `.claude/` e `ai_context/.claude/`
