import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

async function main() {
  const adminEmail =
    process.env.PROD_ADMIN_EMAIL ?? "admin@nuovapolisportivachianti.it";
  const adminPassword = process.env.PROD_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error(
      "PROD_ADMIN_PASSWORD non impostata: seed admin prod interrotto."
    );
  }

  const existing = await db.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`· Admin già presente: ${adminEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await db.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      name: "Admin",
      role: UserRole.ADMIN,
    },
  });

  console.log(`✓ Admin PROD creato: ${adminEmail}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
