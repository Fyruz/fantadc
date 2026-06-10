-- Finestra di modifica rosa ("mercato") aperta dall'admin + conteggio cambi per squadra.

-- CreateTable
CREATE TABLE "RosterEditWindow" (
    "id" SERIAL NOT NULL,
    "opensAt" TIMESTAMP(3) NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "maxChanges" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RosterEditWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RosterEditUsage" (
    "windowId" INTEGER NOT NULL,
    "fantasyTeamId" INTEGER NOT NULL,
    "baselinePlayerIds" JSONB NOT NULL,
    "changesUsed" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RosterEditUsage_pkey" PRIMARY KEY ("windowId","fantasyTeamId")
);

-- CreateIndex
CREATE INDEX "RosterEditWindow_opensAt_closesAt_idx" ON "RosterEditWindow"("opensAt", "closesAt");

-- CreateIndex
CREATE INDEX "RosterEditUsage_fantasyTeamId_idx" ON "RosterEditUsage"("fantasyTeamId");

-- AddForeignKey
ALTER TABLE "RosterEditWindow" ADD CONSTRAINT "RosterEditWindow_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterEditUsage" ADD CONSTRAINT "RosterEditUsage_windowId_fkey" FOREIGN KEY ("windowId") REFERENCES "RosterEditWindow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterEditUsage" ADD CONSTRAINT "RosterEditUsage_fantasyTeamId_fkey" FOREIGN KEY ("fantasyTeamId") REFERENCES "FantasyTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
