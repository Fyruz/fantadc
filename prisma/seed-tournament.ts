/**
 * Seed per squadre reali e giocatori del torneo.
 *
 * Come usarlo:
 *   1. Modifica l'array TEAMS qui sotto con i dati reali del torneo.
 *   2. Ogni squadra ha un array "players" con 1 P e qualsiasi numero di A.
 *   3. Esegui: npx tsx prisma/seed-tournament.ts
 *
 * Il seed usa upsert (basato su email player = nome+squadra slug):
 * può essere rieseguito senza duplicare i dati.
 */

import { PrismaClient, PlayerRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// ─── DATI REALI DEL TORNEO ───────────────────────────────────────────────────
// Sostituire i valori placeholder con i dati reali prima di eseguire il seed.

const TEAMS: {
  name: string;
  shortName: string;
  players: { name: string; role: PlayerRole }[];
}[] = [
  {
    name: "Squadra Alpha",
    shortName: "ALP",
    players: [
      { name: "Portiere Alpha", role: PlayerRole.P },
      { name: "Giocatore A1",   role: PlayerRole.A },
      { name: "Giocatore A2",   role: PlayerRole.A },
      { name: "Giocatore A3",   role: PlayerRole.A },
      { name: "Giocatore A4",   role: PlayerRole.A },
    ],
  },
  {
    name: "Squadra Beta",
    shortName: "BET",
    players: [
      { name: "Portiere Beta",  role: PlayerRole.P },
      { name: "Giocatore B1",   role: PlayerRole.A },
      { name: "Giocatore B2",   role: PlayerRole.A },
      { name: "Giocatore B3",   role: PlayerRole.A },
      { name: "Giocatore B4",   role: PlayerRole.A },
    ],
  },
  {
    name: "Squadra Gamma",
    shortName: "GAM",
    players: [
      { name: "Portiere Gamma", role: PlayerRole.P },
      { name: "Giocatore G1",   role: PlayerRole.A },
      { name: "Giocatore G2",   role: PlayerRole.A },
      { name: "Giocatore G3",   role: PlayerRole.A },
      { name: "Giocatore G4",   role: PlayerRole.A },
    ],
  },
  {
    name: "Squadra Delta",
    shortName: "DEL",
    players: [
      { name: "Portiere Delta", role: PlayerRole.P },
      { name: "Giocatore D1",   role: PlayerRole.A },
      { name: "Giocatore D2",   role: PlayerRole.A },
      { name: "Giocatore D3",   role: PlayerRole.A },
      { name: "Giocatore D4",   role: PlayerRole.A },
    ],
  },
  {
    name: "Squadra Epsilon",
    shortName: "EPS",
    players: [
      { name: "Portiere Epsilon", role: PlayerRole.P },
      { name: "Giocatore E1",     role: PlayerRole.A },
      { name: "Giocatore E2",     role: PlayerRole.A },
      { name: "Giocatore E3",     role: PlayerRole.A },
      { name: "Giocatore E4",     role: PlayerRole.A },
    ],
  },
  {
    name: "Squadra Zeta",
    shortName: "ZET",
    players: [
      { name: "Portiere Zeta", role: PlayerRole.P },
      { name: "Giocatore Z1",  role: PlayerRole.A },
      { name: "Giocatore Z2",  role: PlayerRole.A },
      { name: "Giocatore Z3",  role: PlayerRole.A },
      { name: "Giocatore Z4",  role: PlayerRole.A },
    ],
  },
  {
    name: "Squadra Eta",
    shortName: "ETA",
    players: [
      { name: "Portiere Eta", role: PlayerRole.P },
      { name: "Giocatore H1", role: PlayerRole.A },
      { name: "Giocatore H2", role: PlayerRole.A },
      { name: "Giocatore H3", role: PlayerRole.A },
      { name: "Giocatore H4", role: PlayerRole.A },
    ],
  },
  {
    name: "Squadra Theta",
    shortName: "THE",
    players: [
      { name: "Portiere Theta", role: PlayerRole.P },
      { name: "Giocatore T1",   role: PlayerRole.A },
      { name: "Giocatore T2",   role: PlayerRole.A },
      { name: "Giocatore T3",   role: PlayerRole.A },
      { name: "Giocatore T4",   role: PlayerRole.A },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────

async function main() {
  let teamCount = 0;
  let playerCount = 0;

  for (const team of TEAMS) {
    const ft = await db.footballTeam.upsert({
      where: { name: team.name },
      update: { shortName: team.shortName },
      create: { name: team.name, shortName: team.shortName },
    });
    teamCount++;

    for (const p of team.players) {
      const existing = await db.player.findFirst({
        where: { name: p.name, footballTeamId: ft.id },
      });
      if (!existing) {
        await db.player.create({
          data: { name: p.name, role: p.role, footballTeamId: ft.id },
        });
      }
      playerCount++;
    }
  }

  console.log(`✓ Squadre: ${teamCount}`);
  console.log(`✓ Giocatori: ${playerCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
