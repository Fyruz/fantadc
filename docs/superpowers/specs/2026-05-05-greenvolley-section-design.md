# GreenVolley Section — Design Spec

**Date:** 2026-05-05  
**Status:** Approved  

---

## Context

The fantadc site currently manages the DCup football tournament. The same admin users also run a volleyball championship called **GreenVolley**. The goal is to add a separate, self-contained section to the site for tracking GreenVolley matches (divided into sets with per-set scores) and standings, without any fantasy-team or MVP-voting features. Admin users manage both championships from a shared admin area, switching between them easily via a topbar switcher.

---

## Scope

**In scope:**
- Teams and players (anagrafica only — no per-match player stats)
- Matches with up to 5 sets, each set storing home/away points
- Group stage + knockout rounds (same structure as DCup football)
- Standings calculated on-the-fly: each set won = 1 point; tiebreaker: set ratio then points ratio
- Public-facing pages: matches, standings, groups, knockout, teams, players
- Admin CRUD for all entities
- Admin switcher between DCup and GreenVolley contexts

**Out of scope:**
- Fantasy teams / fantasy standings
- MVP voting
- Player match stats (goals, bonuses, etc.)
- Push notifications for volleyball matches

---

## Data Model

All models are independent from football models. No shared tables.

### Prisma Models

```prisma
model VolleyTeam {
  id        String         @id @default(cuid())
  name      String
  players   VolleyPlayer[]
  homeMatches VolleyMatch[] @relation("VolleyHomeTeam")
  awayMatches VolleyMatch[] @relation("VolleyAwayTeam")
  groups    VolleyGroupTeam[]
  createdAt DateTime       @default(now())
}

model VolleyPlayer {
  id        String      @id @default(cuid())
  name      String
  team      VolleyTeam  @relation(fields: [teamId], references: [id])
  teamId    String
  createdAt DateTime    @default(now())
}

model VolleyMatch {
  id               String               @id @default(cuid())
  homeTeam         VolleyTeam           @relation("VolleyHomeTeam", fields: [homeTeamId], references: [id])
  homeTeamId       String
  awayTeam         VolleyTeam           @relation("VolleyAwayTeam", fields: [awayTeamId], references: [id])
  awayTeamId       String
  status           VolleyMatchStatus    @default(DRAFT)
  date             DateTime?
  sets             VolleySet[]
  group            VolleyGroup?         @relation(fields: [groupId], references: [id])
  groupId          String?
  knockoutRound    VolleyKnockoutRound? @relation(fields: [knockoutRoundId], references: [id])
  knockoutRoundId  String?
  createdAt        DateTime             @default(now())
}

enum VolleyMatchStatus {
  DRAFT
  SCHEDULED
  CONCLUDED
}

model VolleySet {
  id          String      @id @default(cuid())
  match       VolleyMatch @relation(fields: [matchId], references: [id], onDelete: Cascade)
  matchId     String
  setNumber   Int         // 1–5
  homePoints  Int
  awayPoints  Int
}

model VolleyGroup {
  id      String            @id @default(cuid())
  name    String            // "Girone A", "Girone B", ...
  teams   VolleyGroupTeam[]
  matches VolleyMatch[]
}

model VolleyGroupTeam {
  group     VolleyGroup @relation(fields: [groupId], references: [id])
  groupId   String
  team      VolleyTeam  @relation(fields: [teamId], references: [id])
  teamId    String
  qualified Boolean     @default(false)

  @@id([groupId, teamId])
}

model VolleyKnockoutRound {
  id      String        @id @default(cuid())
  name    String        // "Quarti", "Semifinali", "Finale"
  order   Int
  matches VolleyMatch[]
}
```

### Standings Calculation

Computed on-the-fly from `VolleySet` records — no denormalized counters.

For each team in a group:
- **Points** = total sets won across all group matches
- **Tiebreaker 1** = set ratio (sets won / sets lost)
- **Tiebreaker 2** = points ratio (total points scored / total points conceded)

Example: match result 3-1 → home team gets 3 pts, away team gets 1 pt.

---

## Routing

### Public — `app/(public)/greenvolley/`

| Route | Page |
|---|---|
| `/greenvolley` | Overview: next match + quick standings |
| `/greenvolley/partite` | Match list (upcoming + past) |
| `/greenvolley/partite/[id]` | Match detail with per-set scores |
| `/greenvolley/classifica` | Group standings |
| `/greenvolley/gironi` | Groups with teams |
| `/greenvolley/eliminazione` | Knockout bracket |
| `/greenvolley/squadre` | Teams + roster |
| `/greenvolley/giocatori` | Player list |

### Admin — `app/(admin)/admin/greenvolley/`

| Route | Page |
|---|---|
| `/admin/greenvolley` | GreenVolley admin dashboard |
| `/admin/greenvolley/squadre` | CRUD teams |
| `/admin/greenvolley/giocatori` | CRUD players |
| `/admin/greenvolley/partite` | Manage matches + set entry |
| `/admin/greenvolley/partite/new` | Create match |
| `/admin/greenvolley/partite/[id]` | Edit match, add/edit sets, set status |
| `/admin/greenvolley/gironi` | Manage groups |
| `/admin/greenvolley/eliminazione` | Manage knockout rounds |

---

## Navigation

### Public Navbar (`components/public-nav.tsx`)

Add a single **"🏐 GreenVolley"** link in the navbar (desktop), placed after the existing sections. Links to `/greenvolley`. No sub-menu for now — navigation within the GreenVolley section happens via the section's own internal nav.

### Public Bottom Nav (`components/public-bottom-nav.tsx`)

Add **"GreenVolley"** to the **Altro** drawer, linking to `/greenvolley`.

### Admin Topbar (`app/(admin)/admin/_top-bar.tsx`)

Add a **pill switcher** at the top of the topbar, always visible:

```
[ ⚽ DCup ]  [ 🏐 GreenVolley ]
```

- Active context determined by current URL prefix (`/admin/greenvolley/*` → GreenVolley active)
- Clicking a pill navigates to `/admin` (DCup) or `/admin/greenvolley` (GreenVolley)
- When GreenVolley is active, nav items show: Dashboard, Squadre, Giocatori, Partite, Gironi, Eliminazione (GreenVolley variants)
- When DCup is active, existing nav items are shown unchanged

### Admin Bottom Nav (`app/(admin)/admin/_bottom-nav.tsx`)

Add same pill switcher at the top of the bottom nav drawer. When GreenVolley is active, tabs link to GreenVolley admin pages.

---

## Styling

- All GreenVolley UI uses the **existing app component library** (PrimeReact v10 + Tailwind CSS)
- GreenVolley **primary color: `#3DD907`** — used for:
  - Active switcher pill background
  - Accent color on GreenVolley pages (headers, badges, highlights)
  - Match result highlights (set scores, winner indicators)
- DCup retains its existing blue (`#3b82f6` / `--primary`)
- Define a CSS custom property `--gv-primary: #3DD907` scoped to GreenVolley pages/components

---

## Admin — Match Set Entry

In `/admin/greenvolley/partite/[id]`:
- Table listing all recorded sets (set number, home pts, away pts, winner auto-computed)
- "+ Aggiungi set" button to add next set (up to 5)
- Each set row editable inline or via modal
- "Segna come conclusa" button sets `status = CONCLUDED`
- Match result (e.g. 3-1) and points earned shown automatically from set data

---

## Error Handling & Validation

- Max 5 sets per match (enforced server-side in Server Action)
- Set points must be non-negative integers
- Cannot mark match as CONCLUDED if no sets recorded
- Cannot add a set to a CONCLUDED match

---

## Testing / Verification

1. `npx prisma migrate dev` — new volley models migrate cleanly
2. `npx tsc --noEmit` — no TypeScript errors
3. `npm run build` — production build succeeds
4. Manual walkthrough:
   - Admin: create teams, players, groups, match → add sets → mark concluded
   - Public: verify `/greenvolley/classifica` shows correct points per set-win logic
   - Admin switcher: verify switching between DCup and GreenVolley updates nav items
   - Mobile: verify GreenVolley link appears in "Altro" drawer
