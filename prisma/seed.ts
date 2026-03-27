import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

async function main() {
  // Admin di default
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
    console.log(`Admin creato: ${adminEmail}`);
  } else {
    console.log(`Admin già presente: ${adminEmail}`);
  }

  // Bonus type iniziali
  // Il valore MVP (open question #1) è placeholder: 3 punti.
  // Da aggiornare quando il valore sarà definito (ai_context/open_questions.md).
  const bonusTypes = [
    { code: "GOAL", name: "Gol", points: 3 },
    { code: "ASSIST", name: "Assist", points: 1 },
    { code: "YELLOW_CARD", name: "Cartellino Giallo", points: -0.5 },
    { code: "RED_CARD", name: "Cartellino Rosso", points: -2 },
    { code: "MVP", name: "MVP Partita", points: 3 }, // valore provvisorio
  ];

  for (const bt of bonusTypes) {
    await db.bonusType.upsert({
      where: { code: bt.code },
      update: {},
      create: {
        code: bt.code,
        name: bt.name,
        points: bt.points,
      },
    });
  }
  console.log(`Bonus type iniziali: ${bonusTypes.map((b) => b.code).join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
