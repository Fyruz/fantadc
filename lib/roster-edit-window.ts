import { db } from "@/lib/db";
import type { RosterEditWindow } from "@prisma/client";

/** Restituisce la finestra di modifica rosa attualmente aperta, o null. */
export async function getActiveEditWindow(now: Date = new Date()): Promise<RosterEditWindow | null> {
  return db.rosterEditWindow.findFirst({
    where: { opensAt: { lte: now }, closesAt: { gt: now } },
    orderBy: { opensAt: "desc" },
  });
}
