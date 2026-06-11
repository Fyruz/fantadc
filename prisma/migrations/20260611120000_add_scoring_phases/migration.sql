-- Fasi di punteggio fanta: snapshot storici dei punti per fase.

-- CreateTable
CREATE TABLE "ScoringPhase" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoringPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringPhaseScore" (
    "phaseId" INTEGER NOT NULL,
    "fantasyTeamId" INTEGER NOT NULL,
    "points" DECIMAL(7,2) NOT NULL,
    "rosterPlayerIds" JSONB NOT NULL,
    "captainPlayerId" INTEGER NOT NULL,

    CONSTRAINT "ScoringPhaseScore_pkey" PRIMARY KEY ("phaseId","fantasyTeamId")
);

-- CreateIndex
CREATE INDEX "ScoringPhase_order_idx" ON "ScoringPhase"("order");

-- CreateIndex
CREATE INDEX "ScoringPhaseScore_fantasyTeamId_idx" ON "ScoringPhaseScore"("fantasyTeamId");

-- AddForeignKey
ALTER TABLE "ScoringPhase" ADD CONSTRAINT "ScoringPhase_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoringPhaseScore" ADD CONSTRAINT "ScoringPhaseScore_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ScoringPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoringPhaseScore" ADD CONSTRAINT "ScoringPhaseScore_fantasyTeamId_fkey" FOREIGN KEY ("fantasyTeamId") REFERENCES "FantasyTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
