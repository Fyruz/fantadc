"use server";

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
  await db.adminAuditLog.create({
    data: {
      adminUserId,
      action,
      entityType,
      entityId: entityId != null ? String(entityId) : null,
      before: sanitizeAuditPayload(before),
      after: sanitizeAuditPayload(after),
    },
  });
}
