-- Flag per indicare i bonus segreti, non ancora svelati ai partecipanti
-- (vengono rivelati nella pagina Bonus Segreti dopo la prima assegnazione).
ALTER TABLE "BonusType" ADD COLUMN "isSecret" BOOLEAN NOT NULL DEFAULT false;
