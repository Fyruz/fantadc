-- Snapshot della classifica fantasy cumulativa pubblica.

CREATE TABLE "FantasyRankingSnapshot" (
  "fantasyTeamId" INTEGER NOT NULL,
  "rank" INTEGER NOT NULL,
  "totalPoints" DECIMAL(7,2) NOT NULL,
  "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FantasyRankingSnapshot_pkey" PRIMARY KEY ("fantasyTeamId")
);

CREATE INDEX "FantasyRankingSnapshot_rank_idx" ON "FantasyRankingSnapshot"("rank");
CREATE INDEX "FantasyRankingSnapshot_totalPoints_idx" ON "FantasyRankingSnapshot"("totalPoints");
CREATE INDEX "Match_status_concludedAt_idx" ON "Match"("status", "concludedAt");

ALTER TABLE "FantasyRankingSnapshot"
  ADD CONSTRAINT "FantasyRankingSnapshot_fantasyTeamId_fkey"
  FOREIGN KEY ("fantasyTeamId") REFERENCES "FantasyTeam"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
