import { PrismaClient, VolleyMatchStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// ─── Dati squadre ────────────────────────────────────────────────────────────

const TEAMS = [
  {
    name: "Volley Club Rossini",
    players: [
      "Matteo Rossini", "Luca Bianchi", "Andrea Conti", "Simone Ferrara",
      "Marco Vitali", "Davide Esposito", "Nicolò Ricci", "Federico Mancini",
    ],
  },
  {
    name: "Pallavolo San Pietro",
    players: [
      "Giacomo Lombardi", "Lorenzo De Luca", "Riccardo Barbieri", "Stefano Marini",
      "Alessandro Russo", "Emanuele Greco", "Filippo Serra", "Cristian Gallo",
    ],
  },
  {
    name: "ASD Falchi Verdi",
    players: [
      "Diego Caruso", "Roberto Farina", "Claudio Pellegrini", "Giorgio Amato",
      "Vincenzo Moretti", "Antonio Ruggiero", "Salvatore Bruno", "Francesco Pio",
    ],
  },
  {
    name: "Aquile Bianche Volley",
    players: [
      "Mirko Cattaneo", "Enrico Bassi", "Samuele Fiore", "Tommaso Negri",
      "Valerio Colombo", "Daniele Fontana", "Leonardo Martini", "Giulio Testa",
    ],
  },
  {
    name: "Virtus Pallavolo",
    players: [
      "Massimo Ferri", "Cristiano Villa", "Fabrizio Monti", "Augusto Gatti",
      "Pietro Riva", "Renato Coppola", "Gianluca Mosca", "Edoardo Longo",
    ],
  },
  {
    name: "Sporting Volley",
    players: [
      "Umberto Rizzi", "Cesare D'Angelo", "Ottavio Prati", "Maurizio Ferretti",
      "Luciano Sala", "Aldo Bianco", "Sergio Conte", "Bruno Pace",
    ],
  },
];

// ─── Helper per creare set ────────────────────────────────────────────────────

type SetScore = { home: number; away: number };

async function addSets(matchId: number, scores: SetScore[]) {
  for (let i = 0; i < scores.length; i++) {
    await db.volleySet.create({
      data: {
        matchId,
        setNumber: i + 1,
        homePoints: scores[i].home,
        awayPoints: scores[i].away,
      },
    });
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🏐 Seeding GreenVolley...");

  // Pulisce dati GreenVolley esistenti
  await db.volleySet.deleteMany();
  await db.volleyMatch.deleteMany();
  await db.volleyGroupTeam.deleteMany();
  await db.volleyGroup.deleteMany();
  await db.volleyKnockoutRound.deleteMany();
  await db.volleyPlayer.deleteMany();
  await db.volleyTeam.deleteMany();
  console.log("  ✓ Dati esistenti rimossi");

  // Crea squadre e giocatori
  const teams: Record<string, { id: number }> = {};
  for (const t of TEAMS) {
    const team = await db.volleyTeam.create({
      data: {
        name: t.name,
        players: { create: t.players.map((name) => ({ name })) },
      },
    });
    teams[t.name] = team;
  }
  console.log(`  ✓ ${TEAMS.length} squadre create con giocatori`);

  // ID shorthand
  const vcr = teams["Volley Club Rossini"].id;
  const psp = teams["Pallavolo San Pietro"].id;
  const afv = teams["ASD Falchi Verdi"].id;
  const abv = teams["Aquile Bianche Volley"].id;
  const vtp = teams["Virtus Pallavolo"].id;
  const spv = teams["Sporting Volley"].id;

  // Crea gironi
  const gironeA = await db.volleyGroup.create({ data: { name: "Girone A" } });
  const gironeB = await db.volleyGroup.create({ data: { name: "Girone B" } });

  // Assegna squadre ai gironi
  await db.volleyGroupTeam.createMany({
    data: [
      { groupId: gironeA.id, teamId: vcr, qualified: true  },
      { groupId: gironeA.id, teamId: psp, qualified: true  },
      { groupId: gironeA.id, teamId: afv, qualified: false },
      { groupId: gironeB.id, teamId: abv, qualified: true  },
      { groupId: gironeB.id, teamId: vtp, qualified: true  },
      { groupId: gironeB.id, teamId: spv, qualified: false },
    ],
  });
  console.log("  ✓ Gironi creati e squadre assegnate");

  // Turni eliminazione diretta
  const semifinali = await db.volleyKnockoutRound.create({ data: { name: "Semifinali", order: 1 } });
  const finale     = await db.volleyKnockoutRound.create({ data: { name: "Finale",     order: 2 } });
  console.log("  ✓ Turni eliminazione creati");

  // ── Partite girone A ──────────────────────────────────────────────────────

  // VCR vs PSP  →  3-1  (25-22, 23-25, 25-20, 25-18)
  const m1 = await db.volleyMatch.create({
    data: {
      homeTeamId: vcr, awayTeamId: psp,
      groupId: gironeA.id, status: VolleyMatchStatus.CONCLUDED,
      date: new Date("2025-03-08T15:00:00"),
    },
  });
  await addSets(m1.id, [
    { home: 25, away: 22 }, { home: 23, away: 25 },
    { home: 25, away: 20 }, { home: 25, away: 18 },
  ]);

  // VCR vs AFV  →  3-0  (25-17, 25-21, 25-19)
  const m2 = await db.volleyMatch.create({
    data: {
      homeTeamId: vcr, awayTeamId: afv,
      groupId: gironeA.id, status: VolleyMatchStatus.CONCLUDED,
      date: new Date("2025-03-15T15:00:00"),
    },
  });
  await addSets(m2.id, [
    { home: 25, away: 17 }, { home: 25, away: 21 }, { home: 25, away: 19 },
  ]);

  // PSP vs AFV  →  3-2  (25-23, 22-25, 25-22, 21-25, 15-12)
  const m3 = await db.volleyMatch.create({
    data: {
      homeTeamId: psp, awayTeamId: afv,
      groupId: gironeA.id, status: VolleyMatchStatus.CONCLUDED,
      date: new Date("2025-03-22T15:00:00"),
    },
  });
  await addSets(m3.id, [
    { home: 25, away: 23 }, { home: 22, away: 25 },
    { home: 25, away: 22 }, { home: 21, away: 25 }, { home: 15, away: 12 },
  ]);

  // ── Partite girone B ──────────────────────────────────────────────────────

  // ABV vs VTP  →  3-1  (25-20, 25-23, 22-25, 25-21)
  const m4 = await db.volleyMatch.create({
    data: {
      homeTeamId: abv, awayTeamId: vtp,
      groupId: gironeB.id, status: VolleyMatchStatus.CONCLUDED,
      date: new Date("2025-03-08T17:00:00"),
    },
  });
  await addSets(m4.id, [
    { home: 25, away: 20 }, { home: 25, away: 23 },
    { home: 22, away: 25 }, { home: 25, away: 21 },
  ]);

  // ABV vs SPV  →  3-0  (25-18, 25-16, 25-22)
  const m5 = await db.volleyMatch.create({
    data: {
      homeTeamId: abv, awayTeamId: spv,
      groupId: gironeB.id, status: VolleyMatchStatus.CONCLUDED,
      date: new Date("2025-03-15T17:00:00"),
    },
  });
  await addSets(m5.id, [
    { home: 25, away: 18 }, { home: 25, away: 16 }, { home: 25, away: 22 },
  ]);

  // VTP vs SPV  →  3-2  (25-23, 21-25, 25-22, 22-25, 15-13)
  const m6 = await db.volleyMatch.create({
    data: {
      homeTeamId: vtp, awayTeamId: spv,
      groupId: gironeB.id, status: VolleyMatchStatus.CONCLUDED,
      date: new Date("2025-03-22T17:00:00"),
    },
  });
  await addSets(m6.id, [
    { home: 25, away: 23 }, { home: 21, away: 25 },
    { home: 25, away: 22 }, { home: 22, away: 25 }, { home: 15, away: 13 },
  ]);

  // ── Semifinali ────────────────────────────────────────────────────────────
  // 1° Girone A vs 2° Girone B → VCR vs VTP  →  3-1  (25-22, 23-25, 25-20, 25-19)
  const m7 = await db.volleyMatch.create({
    data: {
      homeTeamId: vcr, awayTeamId: vtp,
      knockoutRoundId: semifinali.id, status: VolleyMatchStatus.CONCLUDED,
      date: new Date("2025-04-05T15:00:00"),
    },
  });
  await addSets(m7.id, [
    { home: 25, away: 22 }, { home: 23, away: 25 },
    { home: 25, away: 20 }, { home: 25, away: 19 },
  ]);

  // 1° Girone B vs 2° Girone A → ABV vs PSP  →  3-2  (25-23, 21-25, 25-20, 22-25, 15-10)
  const m8 = await db.volleyMatch.create({
    data: {
      homeTeamId: abv, awayTeamId: psp,
      knockoutRoundId: semifinali.id, status: VolleyMatchStatus.CONCLUDED,
      date: new Date("2025-04-05T17:00:00"),
    },
  });
  await addSets(m8.id, [
    { home: 25, away: 23 }, { home: 21, away: 25 },
    { home: 25, away: 20 }, { home: 22, away: 25 }, { home: 15, away: 10 },
  ]);

  // ── Finale ────────────────────────────────────────────────────────────────
  // VCR vs ABV  →  3-2  (23-25, 25-22, 25-21, 22-25, 15-11)
  const m9 = await db.volleyMatch.create({
    data: {
      homeTeamId: vcr, awayTeamId: abv,
      knockoutRoundId: finale.id, status: VolleyMatchStatus.CONCLUDED,
      date: new Date("2025-04-19T16:00:00"),
    },
  });
  await addSets(m9.id, [
    { home: 23, away: 25 }, { home: 25, away: 22 },
    { home: 25, away: 21 }, { home: 22, away: 25 }, { home: 15, away: 11 },
  ]);

  console.log("  ✓ 9 partite create con set");
  console.log("\n✅ Seed GreenVolley completato!");
  console.log("   Girone A: Volley Club Rossini (1°), Pallavolo San Pietro (2°), ASD Falchi Verdi (3°)");
  console.log("   Girone B: Aquile Bianche Volley (1°), Virtus Pallavolo (2°), Sporting Volley (3°)");
  console.log("   Finale: Volley Club Rossini vince 3-2 su Aquile Bianche Volley");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
