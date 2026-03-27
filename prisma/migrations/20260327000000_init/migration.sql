Loaded Prisma config from prisma.config.ts.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PlayerRole" AS ENUM ('GK', 'PLAYER');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'CONCLUDED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FantasyTeam" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "captainPlayerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FantasyTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FootballTeam" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FootballTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" "PlayerRole" NOT NULL,
    "footballTeamId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "concludedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchPlayer" (
    "matchId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchPlayer_pkey" PRIMARY KEY ("matchId","playerId")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "points" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BonusType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMatchBonus" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "bonusTypeId" INTEGER NOT NULL,
    "points" DECIMAL(5,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerMatchBonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FantasyTeamPlayer" (
    "fantasyTeamId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FantasyTeamPlayer_pkey" PRIMARY KEY ("fantasyTeamId","playerId")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" SERIAL NOT NULL,
    "adminUserId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FantasyTeam_userId_key" ON "FantasyTeam"("userId");

-- CreateIndex
CREATE INDEX "FantasyTeam_captainPlayerId_idx" ON "FantasyTeam"("captainPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballTeam_name_key" ON "FootballTeam"("name");

-- CreateIndex
CREATE INDEX "Player_footballTeamId_idx" ON "Player"("footballTeamId");

-- CreateIndex
CREATE INDEX "Player_name_idx" ON "Player"("name");

-- CreateIndex
CREATE INDEX "Player_role_idx" ON "Player"("role");

-- CreateIndex
CREATE INDEX "Match_homeTeamId_idx" ON "Match"("homeTeamId");

-- CreateIndex
CREATE INDEX "Match_awayTeamId_idx" ON "Match"("awayTeamId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_startsAt_idx" ON "Match"("startsAt");

-- CreateIndex
CREATE INDEX "MatchPlayer_playerId_idx" ON "MatchPlayer"("playerId");

-- CreateIndex
CREATE INDEX "Vote_matchId_idx" ON "Vote"("matchId");

-- CreateIndex
CREATE INDEX "Vote_playerId_idx" ON "Vote"("playerId");

-- CreateIndex
CREATE INDEX "Vote_matchId_playerId_idx" ON "Vote"("matchId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_matchId_key" ON "Vote"("userId", "matchId");

-- CreateIndex
CREATE UNIQUE INDEX "BonusType_code_key" ON "BonusType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BonusType_name_key" ON "BonusType"("name");

-- CreateIndex
CREATE INDEX "PlayerMatchBonus_playerId_idx" ON "PlayerMatchBonus"("playerId");

-- CreateIndex
CREATE INDEX "PlayerMatchBonus_matchId_idx" ON "PlayerMatchBonus"("matchId");

-- CreateIndex
CREATE INDEX "PlayerMatchBonus_bonusTypeId_idx" ON "PlayerMatchBonus"("bonusTypeId");

-- CreateIndex
CREATE INDEX "PlayerMatchBonus_matchId_playerId_idx" ON "PlayerMatchBonus"("matchId", "playerId");

-- CreateIndex
CREATE INDEX "FantasyTeamPlayer_playerId_idx" ON "FantasyTeamPlayer"("playerId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminUserId_idx" ON "AdminAuditLog"("adminUserId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_entityType_entityId_idx" ON "AdminAuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "FantasyTeam" ADD CONSTRAINT "FantasyTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyTeam" ADD CONSTRAINT "FantasyTeam_captainPlayerId_fkey" FOREIGN KEY ("captainPlayerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_footballTeamId_fkey" FOREIGN KEY ("footballTeamId") REFERENCES "FootballTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "FootballTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "FootballTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchBonus" ADD CONSTRAINT "PlayerMatchBonus_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchBonus" ADD CONSTRAINT "PlayerMatchBonus_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchBonus" ADD CONSTRAINT "PlayerMatchBonus_bonusTypeId_fkey" FOREIGN KEY ("bonusTypeId") REFERENCES "BonusType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyTeamPlayer" ADD CONSTRAINT "FantasyTeamPlayer_fantasyTeamId_fkey" FOREIGN KEY ("fantasyTeamId") REFERENCES "FantasyTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyTeamPlayer" ADD CONSTRAINT "FantasyTeamPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

