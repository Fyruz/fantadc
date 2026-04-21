"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { sanitizeAuditPayload } from "@/lib/audit-utils";

export async function logAdminAction(
  adminUserId: number,
  action: string,
  entityType: string,
  entityId?: string | number | null,
  before?: object | null,
  after?: object | null
) {
  const sanitizedBefore = sanitizeAuditPayload(before);
  const sanitizedAfter = sanitizeAuditPayload(after);

  await db.adminAuditLog.create({
    data: {
      adminUserId,
      action,
      entityType,
      entityId: entityId != null ? String(entityId) : null,
      before:
        sanitizedBefore === null ? Prisma.JsonNull : sanitizedBefore,
      after: sanitizedAfter === null ? Prisma.JsonNull : sanitizedAfter,
    },
  });
}
