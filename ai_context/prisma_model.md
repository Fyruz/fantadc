generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          Int          @id @default(autoincrement())
  email       String       @unique
  name        String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  fantasyTeam FantasyTeam?
  votes       Vote[]
}

model FantasyTeam {
  id         Int                 @id @default(autoincrement())
  name       String
  userId     Int                 @unique
  coachId    Int
  createdAt  DateTime            @default(now())
  updatedAt  DateTime            @updatedAt

  user       User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  coach      FantasyCoach        @relation(fields: [coachId], references: [id])
  players    FantasyTeamPlayer[]

  @@index([coachId])
}

model FantasyCoach {
  id         Int           @id @default(autoincrement())
  name       String        @unique
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  teams      FantasyTeam[]
}

model FootballTeam {
  id         Int           @id @default(autoincrement())
  name       String        @unique
  shortName  String?
  logoUrl    String?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  players    Player[]
  homeMatches Match[]      @relation("HomeTeamMatches")
  awayMatches Match[]      @relation("AwayTeamMatches")
}

model Player {
  id          Int                 @id @default(autoincrement())
  name        String
  role        PlayerRole?
  footballTeamId Int
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  footballTeam FootballTeam       @relation(fields: [footballTeamId], references: [id], onDelete: Restrict)
  fantasyTeams FantasyTeamPlayer[]
  votes       Vote[]
  matchBonuses PlayerMatchBonus[]

  @@index([footballTeamId])
  @@index([name])
}

model Match {
  id          Int                 @id @default(autoincrement())
  homeTeamId  Int
  awayTeamId  Int
  startsAt    DateTime
  endsAt      DateTime?
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  homeTeam    FootballTeam        @relation("HomeTeamMatches", fields: [homeTeamId], references: [id], onDelete: Restrict)
  awayTeam    FootballTeam        @relation("AwayTeamMatches", fields: [awayTeamId], references: [id], onDelete: Restrict)
  votes       Vote[]
  bonuses     PlayerMatchBonus[]

  @@index([homeTeamId])
  @@index([awayTeamId])
  @@index([startsAt])
}

model Vote {
  id         Int        @id @default(autoincrement())
  userId     Int
  matchId    Int
  playerId   Int
  createdAt  DateTime   @default(now())

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  match      Match      @relation(fields: [matchId], references: [id], onDelete: Cascade)
  player     Player     @relation(fields: [playerId], references: [id], onDelete: Restrict)

  @@unique([userId, matchId])
  @@index([matchId])
  @@index([playerId])
  @@index([matchId, playerId])
}

model BonusType {
  id         Int                 @id @default(autoincrement())
  code       String              @unique
  name       String              @unique
  points     Decimal             @db.Decimal(4, 2)
  createdAt  DateTime            @default(now())
  updatedAt  DateTime            @updatedAt

  assignments PlayerMatchBonus[]
}

model PlayerMatchBonus {
  id          Int         @id @default(autoincrement())
  playerId    Int
  matchId     Int
  bonusTypeId Int
  points      Decimal     @db.Decimal(4, 2)
  quantity    Int         @default(1)
  createdAt   DateTime    @default(now())

  player      Player      @relation(fields: [playerId], references: [id], onDelete: Cascade)
  match       Match       @relation(fields: [matchId], references: [id], onDelete: Cascade)
  bonusType   BonusType   @relation(fields: [bonusTypeId], references: [id], onDelete: Restrict)

  @@index([playerId])
  @@index([matchId])
  @@index([bonusTypeId])
  @@index([matchId, playerId])
}

model FantasyTeamPlayer {
  fantasyTeamId Int
  playerId      Int
  createdAt     DateTime    @default(now())

  fantasyTeam   FantasyTeam @relation(fields: [fantasyTeamId], references: [id], onDelete: Cascade)
  player        Player      @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@id([fantasyTeamId, playerId])
  @@index([playerId])
}

enum PlayerRole {
  GK
  DEF
  MID
  FWD
}