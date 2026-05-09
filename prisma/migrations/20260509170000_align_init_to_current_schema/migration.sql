-- Convert legacy status values before enum reshape.
UPDATE "Match" SET "status" = 'CONCLUDED' WHERE "status" = 'PUBLISHED';

-- CreateEnum
CREATE TYPE "VolleyMatchStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'CONCLUDED');

-- AlterEnum
BEGIN;
CREATE TYPE "MatchStatus_new" AS ENUM ('DRAFT', 'SCHEDULED', 'CONCLUDED');
ALTER TABLE "public"."Match" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Match" ALTER COLUMN "status" TYPE "MatchStatus_new" USING ("status"::text::"MatchStatus_new");
ALTER TYPE "MatchStatus" RENAME TO "MatchStatus_old";
ALTER TYPE "MatchStatus_new" RENAME TO "MatchStatus";
DROP TYPE "public"."MatchStatus_old";
ALTER TABLE "Match" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "publishedAt",
ADD COLUMN     "awayScore" INTEGER,
ADD COLUMN     "awaySeed" TEXT,
ADD COLUMN     "bracketPosition" INTEGER,
ADD COLUMN     "groupId" INTEGER,
ADD COLUMN     "homeScore" INTEGER,
ADD COLUMN     "homeSeed" TEXT,
ADD COLUMN     "knockoutRoundId" INTEGER,
ALTER COLUMN "homeTeamId" DROP NOT NULL,
ALTER COLUMN "awayTeamId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupTeam" (
    "groupId" INTEGER NOT NULL,
    "footballTeamId" INTEGER NOT NULL,
    "qualified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GroupTeam_pkey" PRIMARY KEY ("groupId","footballTeamId")
);

-- CreateTable
CREATE TABLE "KnockoutRound" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnockoutRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchGoal" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "scorerId" INTEGER NOT NULL,
    "isOwnGoal" BOOLEAN NOT NULL DEFAULT false,
    "minute" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolleyTeam" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolleyTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolleyPlayer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolleyPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolleyMatch" (
    "id" SERIAL NOT NULL,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "status" "VolleyMatchStatus" NOT NULL DEFAULT 'DRAFT',
    "date" TIMESTAMP(3),
    "groupId" INTEGER,
    "knockoutRoundId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolleyMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolleySet" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "homePoints" INTEGER NOT NULL,
    "awayPoints" INTEGER NOT NULL,

    CONSTRAINT "VolleySet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolleyGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "VolleyGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolleyGroupTeam" (
    "groupId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "qualified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VolleyGroupTeam_pkey" PRIMARY KEY ("groupId","teamId")
);

-- CreateTable
CREATE TABLE "VolleyKnockoutRound" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "VolleyKnockoutRound_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Group_slug_key" ON "Group"("slug");

-- CreateIndex
CREATE INDEX "Group_order_idx" ON "Group"("order");

-- CreateIndex
CREATE INDEX "GroupTeam_footballTeamId_idx" ON "GroupTeam"("footballTeamId");

-- CreateIndex
CREATE INDEX "KnockoutRound_order_idx" ON "KnockoutRound"("order");

-- CreateIndex
CREATE INDEX "MatchGoal_matchId_idx" ON "MatchGoal"("matchId");

-- CreateIndex
CREATE INDEX "MatchGoal_scorerId_idx" ON "MatchGoal"("scorerId");

-- CreateIndex
CREATE INDEX "VolleyPlayer_teamId_idx" ON "VolleyPlayer"("teamId");

-- CreateIndex
CREATE INDEX "VolleyMatch_homeTeamId_idx" ON "VolleyMatch"("homeTeamId");

-- CreateIndex
CREATE INDEX "VolleyMatch_awayTeamId_idx" ON "VolleyMatch"("awayTeamId");

-- CreateIndex
CREATE INDEX "VolleyMatch_groupId_idx" ON "VolleyMatch"("groupId");

-- CreateIndex
CREATE INDEX "VolleyMatch_knockoutRoundId_idx" ON "VolleyMatch"("knockoutRoundId");

-- CreateIndex
CREATE INDEX "VolleySet_matchId_idx" ON "VolleySet"("matchId");

-- CreateIndex
CREATE INDEX "Match_groupId_idx" ON "Match"("groupId");

-- CreateIndex
CREATE INDEX "Match_knockoutRoundId_idx" ON "Match"("knockoutRoundId");

-- AddForeignKey
ALTER TABLE "GroupTeam" ADD CONSTRAINT "GroupTeam_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupTeam" ADD CONSTRAINT "GroupTeam_footballTeamId_fkey" FOREIGN KEY ("footballTeamId") REFERENCES "FootballTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_knockoutRoundId_fkey" FOREIGN KEY ("knockoutRoundId") REFERENCES "KnockoutRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchGoal" ADD CONSTRAINT "MatchGoal_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchGoal" ADD CONSTRAINT "MatchGoal_scorerId_fkey" FOREIGN KEY ("scorerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolleyPlayer" ADD CONSTRAINT "VolleyPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "VolleyTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolleyMatch" ADD CONSTRAINT "VolleyMatch_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "VolleyTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolleyMatch" ADD CONSTRAINT "VolleyMatch_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "VolleyTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolleyMatch" ADD CONSTRAINT "VolleyMatch_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "VolleyGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolleyMatch" ADD CONSTRAINT "VolleyMatch_knockoutRoundId_fkey" FOREIGN KEY ("knockoutRoundId") REFERENCES "VolleyKnockoutRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolleySet" ADD CONSTRAINT "VolleySet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "VolleyMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolleyGroupTeam" ADD CONSTRAINT "VolleyGroupTeam_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "VolleyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolleyGroupTeam" ADD CONSTRAINT "VolleyGroupTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "VolleyTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
