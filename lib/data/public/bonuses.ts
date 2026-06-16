import "server-only";

import { db } from "@/lib/db";
import { cachePublicData, PUBLIC_CACHE_TAGS, PUBLIC_CACHE_TTL_SECONDS } from "./cache";

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

export const getPublicBonusRows = cachePublicData(
  "data.public.bonuses.public.fetch",
  async (): Promise<PublicBonusRow[]> => {
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
  },
  ["data.public.bonuses.public"],
  {
    tags: [PUBLIC_CACHE_TAGS.bonuses],
    revalidate: PUBLIC_CACHE_TTL_SECONDS.stable,
  }
);

export const getSecretBonusRows = cachePublicData(
  "data.public.bonuses.secret.fetch",
  async (): Promise<SecretBonusRow[]> => {
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
  },
  ["data.public.bonuses.secret"],
  {
    tags: [PUBLIC_CACHE_TAGS.bonuses],
    revalidate: PUBLIC_CACHE_TTL_SECONDS.stable,
  }
);
