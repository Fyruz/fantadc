-- Add MVP override support for admin tie resolution/corrections.
ALTER TABLE "Match" ADD COLUMN "mvpOverridePlayerId" INTEGER;

CREATE INDEX "Match_mvpOverridePlayerId_idx" ON "Match"("mvpOverridePlayerId");

ALTER TABLE "Match"
  ADD CONSTRAINT "Match_mvpOverridePlayerId_fkey"
  FOREIGN KEY ("mvpOverridePlayerId") REFERENCES "Player"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- MVP is now worth 5 fantasy points.
UPDATE "BonusType"
SET "points" = 5.00
WHERE "code" = 'MVP';
