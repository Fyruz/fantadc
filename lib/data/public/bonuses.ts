import "server-only";

import { db } from "@/lib/db";
import { measureServerTiming } from "@/lib/perf";

export type PublicBonusRow = {
  id: number;
  code: string;
  name: string;
  points: number;
};

export type SecretBonusRow = {
  id: number;
  name: string;
  points: number;
  revealed: boolean;
};

export async function getPublicBonusRows(): Promise<PublicBonusRow[]> {
  return measureServerTiming("data.public.bonuses.public.fetch", async () => {
    const bonuses = await db.bonusType.findMany({
      where: { isSecret: false },
      orderBy: [{ points: "desc" }, { name: "asc" }],
      select: { id: true, code: true, name: true, points: true },
    });

    return bonuses.map((bonus) => ({
      id: bonus.id,
      code: bonus.code,
      name: bonus.name,
      points: Number(bonus.points),
    }));
  });
}

export async function getSecretBonusRows(): Promise<SecretBonusRow[]> {
  return measureServerTiming("data.public.bonuses.secret.fetch", async () => {
    const bonuses = await db.bonusType.findMany({
      where: { isSecret: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        points: true,
        _count: { select: { assignments: true } },
      },
    });

    return bonuses.map((bonus) => ({
      id: bonus.id,
      name: bonus.name,
      points: Number(bonus.points),
      revealed: bonus._count.assignments > 0,
    }));
  });
}
