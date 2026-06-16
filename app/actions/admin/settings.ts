"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { setRegistrationOpen } from "@/lib/app-settings";

export async function setRegistrationOpenAction(value: boolean): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  await setRegistrationOpen(value, Number(admin.id));
  revalidatePath("/admin/impostazioni");
  return {};
}
