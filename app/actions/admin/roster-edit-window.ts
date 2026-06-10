"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import type { ActionResult } from "./football-teams";

const SetSchema = z
  .object({
    opensAt: z.coerce.date({ message: "Data di apertura non valida" }),
    closesAt: z.coerce.date({ message: "Data di chiusura non valida" }),
    maxChanges: z.coerce.number().int().min(0, "Deve essere >= 0").max(5, "Massimo 5"),
  })
  .refine((d) => d.closesAt > d.opensAt, {
    message: "La chiusura deve essere successiva all'apertura",
    path: ["closesAt"],
  });

/**
 * Crea o aggiorna la finestra di modifica rosa. Per evitare finestre sovrapposte,
 * se esiste già una finestra non ancora chiusa la si aggiorna anziché crearne una nuova.
 */
export async function setRosterEditWindow(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();

  const parsed = SetSchema.safeParse({
    opensAt: formData.get("opensAt"),
    closesAt: formData.get("closesAt"),
    maxChanges: formData.get("maxChanges"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { opensAt, closesAt, maxChanges } = parsed.data;
  const now = new Date();

  const existing = await db.rosterEditWindow.findFirst({
    where: { closesAt: { gt: now } },
    orderBy: { opensAt: "desc" },
  });

  if (existing) {
    await db.rosterEditWindow.update({
      where: { id: existing.id },
      data: { opensAt, closesAt, maxChanges },
    });
    await logAdminAction(Number(admin.id), "SET_ROSTER_WINDOW", "RosterEditWindow", existing.id, existing, {
      opensAt,
      closesAt,
      maxChanges,
    });
  } else {
    const created = await db.rosterEditWindow.create({
      data: { opensAt, closesAt, maxChanges, createdById: Number(admin.id) },
    });
    await logAdminAction(Number(admin.id), "SET_ROSTER_WINDOW", "RosterEditWindow", created.id, null, created);
  }

  revalidatePath("/admin/modifiche-rosa");
  revalidatePath("/squadra");
  return { message: "Finestra salvata." };
}

/** Chiude immediatamente la finestra attiva (closesAt = ora). */
export async function closeRosterEditWindow(): Promise<ActionResult> {
  const admin = await requireAdmin();
  const now = new Date();

  const active = await db.rosterEditWindow.findFirst({
    where: { opensAt: { lte: now }, closesAt: { gt: now } },
    orderBy: { opensAt: "desc" },
  });
  if (!active) return { message: "Nessuna finestra attiva." };

  await db.rosterEditWindow.update({ where: { id: active.id }, data: { closesAt: now } });
  await logAdminAction(Number(admin.id), "CLOSE_ROSTER_WINDOW", "RosterEditWindow", active.id, active, {
    closesAt: now,
  });

  revalidatePath("/admin/modifiche-rosa");
  revalidatePath("/squadra");
  return { message: "Finestra chiusa." };
}
