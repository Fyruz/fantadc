import { MatchStatus, PlayerRole, PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

const DEV_TEAMS: {
  name: string;
  shortName: string;
  players: { name: string; role: PlayerRole }[];
}[] = [
  {
    name: "Atletico San Marco",
    shortName: "ASM",
    players: [
      { name: "Luca Ferri", role: PlayerRole.P },
      { name: "Davide Riva", role: PlayerRole.A },
      { name: "Nicolò Serra", role: PlayerRole.A },
      { name: "Matteo Guidi", role: PlayerRole.A },
      { name: "Samuele Costa", role: PlayerRole.A },
    ],
  },
  {
    name: "Borgo United",
    shortName: "BOR",
    players: [
      { name: "Marco Neri", role: PlayerRole.P },
      { name: "Andrea Testa", role: PlayerRole.A },
      { name: "Gabriele Vanni", role: PlayerRole.A },
      { name: "Tommaso Fabbri", role: PlayerRole.A },
      { name: "Edoardo Sala", role: PlayerRole.A },
    ],
  },
  {
    name: "FC Aurora",
    shortName: "AUR",
    players: [
      { name: "Pietro Villa", role: PlayerRole.P },
      { name: "Riccardo Leoni", role: PlayerRole.A },
      { name: "Francesco Pini", role: PlayerRole.A },
      { name: "Mattia Orsi", role: PlayerRole.A },
      { name: "Alessio Bassi", role: PlayerRole.A },
    ],
  },
  {
    name: "Real Montello",
    shortName: "RMO",
    players: [
      { name: "Simone Gallo", role: PlayerRole.P },
      { name: "Lorenzo Greco", role: PlayerRole.A },
      { name: "Filippo Conte", role: PlayerRole.A },
      { name: "Leonardo Parisi", role: PlayerRole.A },
      { name: "Christian Berni", role: PlayerRole.A },
    ],
  },
  {
    name: "Stella Rossa 1987",
    shortName: "SR8",
    players: [
      { name: "Michele Bruni", role: PlayerRole.P },
      { name: "Daniele Sarti", role: PlayerRole.A },
      { name: "Jacopo Romani", role: PlayerRole.A },
      { name: "Elia Marini", role: PlayerRole.A },
      { name: "Diego Bellini", role: PlayerRole.A },
    ],
  },
  {
    name: "Virtus Porto",
    shortName: "VPO",
    players: [
      { name: "Federico Rossi", role: PlayerRole.P },
      { name: "Giulio Donati", role: PlayerRole.A },
      { name: "Kevin Napoletano", role: PlayerRole.A },
      { name: "Yuri Magnani", role: PlayerRole.A },
      { name: "Natan De Luca", role: PlayerRole.A },
    ],
  },
];

const DEV_MATCHES: {
  homeTeam: string;
  awayTeam: string;
  startsAt: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  concludedAt: string | null;
}[] = [
  {
    homeTeam: "Atletico San Marco",
    awayTeam: "Borgo United",
    startsAt: "2026-05-02T18:30:00.000Z",
    status: MatchStatus.CONCLUDED,
    homeScore: 2,
    awayScore: 1,
    concludedAt: "2026-05-02T20:20:00.000Z",
  },
  {
    homeTeam: "FC Aurora",
    awayTeam: "Real Montello",
    startsAt: "2026-05-03T19:00:00.000Z",
    status: MatchStatus.CONCLUDED,
    homeScore: 0,
    awayScore: 0,
    concludedAt: "2026-05-03T20:45:00.000Z",
  },
  {
    homeTeam: "Stella Rossa 1987",
    awayTeam: "Virtus Porto",
    startsAt: "2026-05-04T20:00:00.000Z",
    status: MatchStatus.SCHEDULED,
    homeScore: null,
    awayScore: null,
    concludedAt: null,
  },
  {
    homeTeam: "Atletico San Marco",
    awayTeam: "FC Aurora",
    startsAt: "2026-05-10T18:00:00.000Z",
    status: MatchStatus.SCHEDULED,
    homeScore: null,
    awayScore: null,
    concludedAt: null,
  },
  {
    homeTeam: "Borgo United",
    awayTeam: "Virtus Porto",
    startsAt: "2026-05-11T19:30:00.000Z",
    status: MatchStatus.SCHEDULED,
    homeScore: null,
    awayScore: null,
    concludedAt: null,
  },
];

async function seedAdmin() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@fantadc.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme";

  const existing = await db.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await db.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "Admin",
        role: UserRole.ADMIN,
      },
    });
    console.log(`✓ Admin creato: ${adminEmail}`);
  } else {
    console.log(`· Admin già presente: ${adminEmail}`);
  }
}

async function seedBonusTypes() {
  const bonusTypes = [
    { code: "GOAL", name: "Gol", points: 3.0 },
    { code: "ASSIST", name: "Assist", points: 1.0 },
    { code: "PENALTY_GOAL", name: "Rigore segnato", points: 3.0 },
    { code: "PENALTY_MISSED", name: "Rigore sbagliato", points: -3.0 },
    { code: "OWN_GOAL", name: "Autorete", points: -2.0 },
    { code: "YELLOW_CARD", name: "Cartellino giallo", points: -0.5 },
    { code: "RED_CARD", name: "Cartellino rosso", points: -2.0 },
    { code: "CLEAN_SHEET_GK", name: "Clean sheet (portiere)", points: 1.0 },
    { code: "MVP", name: "MVP Partita", points: 3.0 },
  ];

  for (const bonusType of bonusTypes) {
    await db.bonusType.upsert({
      where: { code: bonusType.code },
      update: {},
      create: bonusType,
    });
  }

  console.log(`✓ Bonus type verificati: ${bonusTypes.map((bonus) => bonus.code).join(", ")}`);
}

async function seedDevTournamentData() {
  if (process.env.NODE_ENV === "production") {
    console.log("· Seed dev torneo saltato in produzione");
    return;
  }

  const teamIds = new Map<string, number>();
  const playerIdsByTeam = new Map<string, number[]>();

  for (const team of DEV_TEAMS) {
    const footballTeam = await db.footballTeam.upsert({
      where: { name: team.name },
      update: { shortName: team.shortName },
      create: { name: team.name, shortName: team.shortName },
    });

    teamIds.set(team.name, footballTeam.id);
    playerIdsByTeam.set(team.name, []);

    for (const player of team.players) {
      const existingPlayer = await db.player.findFirst({
        where: { name: player.name, footballTeamId: footballTeam.id },
      });

      const savedPlayer =
        existingPlayer ??
        (await db.player.create({
          data: { name: player.name, role: player.role, footballTeamId: footballTeam.id },
        }));

      playerIdsByTeam.get(team.name)?.push(savedPlayer.id);
    }
  }

  for (const match of DEV_MATCHES) {
    const homeTeamId = teamIds.get(match.homeTeam);
    const awayTeamId = teamIds.get(match.awayTeam);
    if (!homeTeamId || !awayTeamId) {
      throw new Error(`Squadre mancanti per il match ${match.homeTeam} vs ${match.awayTeam}`);
    }

    const startsAt = new Date(match.startsAt);
    const concludedAt = match.concludedAt ? new Date(match.concludedAt) : null;

    const existingMatch = await db.match.findFirst({
      where: {
        homeTeamId,
        awayTeamId,
        startsAt,
      },
      select: { id: true },
    });

    const savedMatch = existingMatch
      ? await db.match.update({
          where: { id: existingMatch.id },
          data: {
            status: match.status,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            concludedAt,
          },
        })
      : await db.match.create({
          data: {
            homeTeamId,
            awayTeamId,
            startsAt,
            status: match.status,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            concludedAt,
          },
        });

    const involvedPlayers = [
      ...(playerIdsByTeam.get(match.homeTeam) ?? []),
      ...(playerIdsByTeam.get(match.awayTeam) ?? []),
    ];

    for (const playerId of involvedPlayers) {
      await db.matchPlayer.upsert({
        where: { matchId_playerId: { matchId: savedMatch.id, playerId } },
        update: {},
        create: { matchId: savedMatch.id, playerId },
      });
    }
  }

  console.log(`✓ Seed dev: ${DEV_TEAMS.length} squadre, ${DEV_TEAMS.flatMap((team) => team.players).length} giocatori, ${DEV_MATCHES.length} partite`);
}

async function main() {
  await seedAdmin();
  await seedBonusTypes();
  await seedDevTournamentData();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
