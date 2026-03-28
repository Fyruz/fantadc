# Admin UI Redesign — Sports Dashboard

**Date:** 2026-03-28
**Scope:** All admin pages (`/admin/**`)
**Theme:** Light, premium, sports dashboard
**Approach:** Sports Dashboard (Approach A)

---

## 1. Layout & Navigation

### Top Bar (56px, sticky)
- White background, `border-b border-[#E5E7EB]`, subtle `shadow-sm`
- Left: logo "⚽ fantadc admin" — bold, navy color
- Right: avatar circle with user initials
- Desktop: nav links inline between logo and avatar
- Mobile: logo + avatar only, no nav links visible

### Bottom Nav Bar (mobile only, fixed bottom, 64px)
- White background, `border-t border-[#E5E7EB]`
- `padding-bottom: env(safe-area-inset-bottom)` for notch devices
- 5 items with icon + label:
  1. Dashboard (`pi-home`)
  2. Partite (`pi-calendar`)
  3. Giocatori (`pi-users`)
  4. Squadre (`pi-shield`)
  5. Altro (`pi-ellipsis-h`) — opens bottom sheet drawer
- "Altro" drawer contains: Utenti, Tipi bonus, Squadre fantasy, Audit log
- Active item: navy icon + text + 2px navy indicator bar on top
- Inactive: `#9CA3AF` gray

### Content Area
- Background: `#F8F9FC`
- Padding: `16px` mobile / `24px` desktop
- `max-w-screen-xl mx-auto w-full`
- Mobile: `pb-20` to clear bottom nav
- Desktop: no bottom padding adjustment needed

---

## 2. Design Tokens

### Color Palette
| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#0107A3` | Buttons, active nav, header accents |
| `--primary-light` | `#E8E9F8` | Hover states, badge backgrounds |
| `--gold` | `#F5C518` | Highlights, live badge, secondary accents |
| `--bg` | `#F8F9FC` | Page background |
| `--surface` | `#FFFFFF` | Cards, tables, forms |
| `--border` | `#E5E7EB` | Card borders, dividers |
| `--text-primary` | `#111827` | Titles, body text |
| `--text-secondary` | `#6B7280` | Labels, placeholders, metadata |
| `--success` | `#10B981` | PUBLISHED status |
| `--warning` | `#F59E0B` | CONCLUDED status |
| `--danger` | `#EF4444` | Delete actions, errors |

### Card Base Component
```
bg-white rounded-2xl shadow-sm border border-[#E5E7EB]
padding: 16px mobile / 20px desktop
```

### Typography (Geist Sans, already in project)
| Role | Size | Weight |
|---|---|---|
| Page title | 22px | 700 |
| Section header | 16px | 600 |
| Body | 14px | 400 |
| Label/meta | 12px | 500 |
| Stat number | 32px | 700 |

### Status Badges
Replace PrimeReact `<Tag>` with custom `StatusBadge` component:
- Shape: `rounded-full px-2.5 py-0.5 text-xs font-medium`
- `DRAFT`: gray dot + "Bozza", bg `#F3F4F6`, text `#6B7280`
- `SCHEDULED`: blue dot + "Programmata", bg `#EFF6FF`, text `#1D4ED8`
- `CONCLUDED`: amber dot + "Conclusa", bg `#FFFBEB`, text `#B45309`
- `PUBLISHED`: green dot + "Pubblicata", bg `#ECFDF5`, text `#059669`

### Role Badges (players)
`PlayerRole` enum has only two values:
- `GK` (Portiere): green — `bg-green-100 text-green-700`
- `PLAYER` (Giocatore): blue — `bg-blue-100 text-blue-700`

The player card left border also uses this two-color scheme (green for GK, blue for PLAYER).

---

## 3. Dashboard Page

### Page Header
- "Dashboard" title left, current date right in text-secondary

### Stat Cards
- Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4`
- Each card: card base + Link wrapper
- Stat number (32px/700) in navy top-left
- Label (12px/500) in text-secondary below number
- Icon in `--primary-light` circle (`40px`) top-right: `pi-users`, `pi-futbol`, `pi-calendar`, `pi-id-card`, `pi-shield`
- Hover: `shadow-md` + `translateY(-1px)` transition

### Anomalie Section
- Title "Da verificare" with `animate-pulse` red dot
- Alert cards with 3px left border (orange / blue)
- Orange background `#FFFBEB` for concluded matches without players
- Blue background `#EFF6FF` for users without fantasy team
- "Gestisci →" text-only button (navy) right-aligned

### No Anomalies State
- Small green pill "✓ Tutto ok" below dashboard title

---

## 4. List Pages (Table Pages)

### Page Header
- Page title (22px/700) left + CTA button right
- CTA: navy bg, white text, `rounded-xl`, min 36px height (touch-friendly)

### Table Card
- Wrapped in card base (white, rounded-2xl, shadow-sm)
- DataTable PrimeReact with CSS overrides:
  - Header row: `#F8F9FC` bg, `11px uppercase tracking-wide` text-secondary
  - Row height: `52px`
  - Even rows: `#FAFAFA`
  - Hover row: `#F0F1FC` (navy tint)
  - Borders: horizontal dividers only, no vertical lines

### Responsive Column Visibility
- **Partite**: mobile shows Partita + Stato + actions only; md+ shows Data and Giocatori
- **Giocatori**: mobile shows Nome + Squadra + actions; md+ shows Ruolo
- **Squadre, Utenti**: similar pattern — hide low-priority columns on mobile

### Action Column
- Mobile: icon-only buttons (`pi-eye` link, `pi-trash` delete), 36px touch target
- Desktop: "Gestisci" text link + delete icon

### Paginator
- Centered, rounded pill buttons
- Current page: navy bg, white text

---

## 5. Form Pages (New / Edit)

### Layout
- Back link "← Torna indietro" above card
- Form in card base, `max-w-lg` desktop (centered), full-width mobile

### Field Layout
- Label: 12px/500 text-secondary, `mb-1`
- PrimeReact components: `w-full`, border `#E5E7EB`, navy focus ring
- Errors: red 12px text below field
- Side-by-side fields (date + time): `flex-col` mobile → `flex-row` desktop

### Submit Button
- Mobile: `w-full`, 48px height
- Desktop: `auto` width
- Loading state: inline spinner + "Salvo..."

### Inline Form Pages (Bonus Types)
- Table card on top
- "Aggiungi nuovo" card below with title

---

## 6. Match Detail Page

### Header Card
- Navy gradient: `from-[#0107A3] to-[#0106c4]`
- White text: team names 20px/700
- Date/time: 13px, opacity-80
- Status badge in gold (`#F5C518`), dark text, top-right
- Full-width, rounded-2xl

### Status Actions
- Row of pill buttons below header card
- Only valid transitions shown for current status
- Active/primary: navy; secondary: outline navy
- Mobile: horizontal scroll if needed

### Edit Form
- `<details>` collapsed by default
- Summary styled: `pi-pencil` icon + "Modifica dati partita"
- Card with dashed border when open

### Players Section
- Header: "Partecipanti (8/22)" + "+ Aggiungi tutti (N)" button right
- Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3`

### Player Card
- Card base, `rounded-xl`, `p-3`
- Left border 3px colored by role: green for GK, blue for PLAYER
- Top-right: remove button (`pi-times`, danger, icon-only, small)
- Name: 13px/600
- Role badge (colored pill) + team name 11px text-secondary
- Bonus chips: compact pills `bg-[#F3F4F6] rounded-full px-2 py-0.5 text-xs`
  - Format: "GOL +3pt"
- Tap entire card → opens Dialog to assign bonus

### Bonus Dialog (existing, minor tweaks)
- Header: player name + role badge
- Form: Dropdown (bonus type) + InputNumber (quantity)
- Assigned bonuses list with remove button
- Two action buttons: "Chiudi" (secondary) + "Assegna" (primary)

### Add Player Form
- Inline: Dropdown + "Aggiungi" button on same row
- Below player grid

---

## 7. Implementation Notes

### New Shared Components
- `components/status-badge.tsx` — replaces PrimeReact `<Tag>` for match status
- `components/role-badge.tsx` — player role colored badge
- `components/admin-page-header.tsx` — title + optional CTA button
- `components/stat-card.tsx` — dashboard stat card

### CSS Changes
- `globals.css`: update CSS variables, add admin-specific utility classes
- Override PrimeReact DataTable styles via CSS (no theme change)
- Add bottom nav safe area handling

### Layout Changes
- `app/(admin)/admin/layout.tsx`: full redesign — top bar + bottom nav
- All page files: update wrapper divs, use new shared components

### Constraint: No PrimeReact theme change
Keep `lara-light-blue` — override only via CSS class targeting (`.p-datatable`, `.p-paginator`, etc.)

### Mobile Testing Priority
- Bottom nav usability at 375px (iPhone SE)
- Player grid touch targets (44px minimum)
- Dialog full-screen on small devices
- Form fields stacking correctly
