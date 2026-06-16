-- Impostazioni singleton dell'app (sempre una sola riga con id=1).

CREATE TABLE "AppSetting" (
    "id" INTEGER NOT NULL,
    "registrationOpen" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- Riga iniziale: registrazioni aperte di default.
INSERT INTO "AppSetting" ("id", "registrationOpen") VALUES (1, true);
