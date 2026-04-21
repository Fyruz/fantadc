import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

async function main() {
  // ─── Admin di default ───────────────────────────────────────────────────────
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

  // ─── Tipi di bonus ──────────────────────────────────────────────────────────
  // Il valore MVP (open question #1) è placeholder: 3 punti.
  // Aggiornare il valore via pannello admin dopo il go-live se necessario.
  const bonusTypes = [
    { code: "GOAL",             name: "Gol",                   points:  3.0 },
    { code: "ASSIST",           name: "Assist",                points:  1.0 },
    { code: "PENALTY_GOAL",     name: "Rigore segnato",        points:  3.0 },
    { code: "PENALTY_MISSED",   name: "Rigore sbagliato",      points: -3.0 },
    { code: "OWN_GOAL",         name: "Autorete",              points: -2.0 },
    { code: "YELLOW_CARD",      name: "Cartellino giallo",     points: -0.5 },
    { code: "RED_CARD",         name: "Cartellino rosso",      points: -2.0 },
    { code: "CLEAN_SHEET_GK",   name: "Clean sheet (portiere)",points:  1.0 },
    { code: "MVP",              name: "MVP Partita",           points:  3.0 },
  ];

  for (const bt of bonusTypes) {
    await db.bonusType.upsert({
      where: { code: bt.code },
      update: {},
      create: { code: bt.code, name: bt.name, points: bt.points },
    });
  }
  console.log(`✓ Bonus type verificati: ${bonusTypes.map((b) => b.code).join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
