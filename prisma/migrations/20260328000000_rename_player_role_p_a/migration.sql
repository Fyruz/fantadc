-- Rename PlayerRole enum values GK→P and PLAYER→A
ALTER TYPE "PlayerRole" RENAME VALUE 'GK' TO 'P';
ALTER TYPE "PlayerRole" RENAME VALUE 'PLAYER' TO 'A';
