# Task 1 — Prisma Schema + Migrazione

**File modificato:** `prisma/schema.prisma`

---

## Passi

- [ ] **Step 1: Aggiungi i modelli volley in fondo a `prisma/schema.prisma`**

Apri `prisma/schema.prisma` e aggiungi in fondo (dopo l'ultimo modello esistente) il seguente blocco:

```prisma
// ─── GreenVolley ─────────────────────────────────────────────────────────────

model VolleyTeam {
  id          Int               @id @default(autoincrement())
  name        String
  players     VolleyPlayer[]
  homeMatches VolleyMatch[]     @relation("VolleyHomeTeam")
  awayMatches VolleyMatch[]     @relation("VolleyAwayTeam")
  groups      VolleyGroupTeam[]
  createdAt   DateTime          @default(now())
}

model VolleyPlayer {
  id        Int        @id @default(autoincrement())
  name      String
  team      VolleyTeam @relation(fields: [teamId], references: [id], onDelete: Cascade)
  teamId    Int
  createdAt DateTime   @default(now())

  @@index([teamId])
}

model VolleyMatch {
  id              Int                  @id @default(autoincrement())
  homeTeam        VolleyTeam           @relation("VolleyHomeTeam", fields: [homeTeamId], references: [id])
  homeTeamId      Int
  awayTeam        VolleyTeam           @relation("VolleyAwayTeam", fields: [awayTeamId], references: [id])
  awayTeamId      Int
  status          VolleyMatchStatus    @default(DRAFT)
  date            DateTime?
  sets            VolleySet[]
  group           VolleyGroup?         @relation(fields: [groupId], references: [id])
  groupId         Int?
  knockoutRound   VolleyKnockoutRound? @relation(fields: [knockoutRoundId], references: [id])
  knockoutRoundId Int?
  createdAt       DateTime             @default(now())

  @@index([homeTeamId])
  @@index([awayTeamId])
  @@index([groupId])
  @@index([knockoutRoundId])
}

enum VolleyMatchStatus {
  DRAFT
  SCHEDULED
  CONCLUDED
}

model VolleySet {
  id         Int         @id @default(autoincrement())
  match      VolleyMatch @relation(fields: [matchId], references: [id], onDelete: Cascade)
  matchId    Int
  setNumber  Int
  homePoints Int
  awayPoints Int

  @@index([matchId])
}

model VolleyGroup {
  id      Int               @id @default(autoincrement())
  name    String
  teams   VolleyGroupTeam[]
  matches VolleyMatch[]
}

model VolleyGroupTeam {
  group     VolleyGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  groupId   Int
  team      VolleyTeam  @relation(fields: [teamId], references: [id], onDelete: Cascade)
  teamId    Int
  qualified Boolean     @default(false)

  @@id([groupId, teamId])
}

model VolleyKnockoutRound {
  id      Int           @id @default(autoincrement())
  name    String
  order   Int
  matches VolleyMatch[]
}
```

- [ ] **Step 2: Crea la migrazione**

```bash
npx prisma migrate dev --name add_greenvolley
```

Output atteso: `✔  Your database is now in sync with your schema.`

- [ ] **Step 3: Verifica che il client Prisma sia aggiornato**

```bash
npx prisma generate
```

Output atteso: nessun errore, `Generated Prisma Client`.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add GreenVolley Prisma models (VolleyTeam, VolleyPlayer, VolleyMatch, VolleySet, VolleyGroup, VolleyGroupTeam, VolleyKnockoutRound)"
```
