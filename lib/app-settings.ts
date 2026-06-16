import "server-only";

import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";

export async function getRegistrationOpen(): Promise<boolean> {
  const setting = await db.appSetting.findUnique({ where: { id: 1 }, select: { registrationOpen: true } });
  return setting?.registrationOpen ?? true;
}

export async function setRegistrationOpen(value: boolean, adminUserId: number): Promise<void> {
  const before = await getRegistrationOpen();
  await db.appSetting.upsert({
    where: { id: 1 },
    update: { registrationOpen: value },
    create: { id: 1, registrationOpen: value },
  });
  await logAdminAction(
    adminUserId,
    value ? "ENABLE_REGISTRATION" : "DISABLE_REGISTRATION",
    "AppSetting",
    1,
    { registrationOpen: before },
    { registrationOpen: value }
  );
}
