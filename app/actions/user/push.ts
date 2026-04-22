"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/session";
import {
  type SerializablePushSubscription,
  removePushSubscription,
  savePushSubscription,
} from "@/lib/push";

export type PushSubscriptionResult =
  | { success: true; message: string }
  | { success: false; message: string };

const SubscriptionSchema: z.ZodType<SerializablePushSubscription> = z.object({
  endpoint: z.string().url().max(2048),
  expirationTime: z.number().int().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1).max(512),
    auth: z.string().min(1).max(512),
  }),
});

export async function subscribeToPush(
  subscription: SerializablePushSubscription,
): Promise<PushSubscriptionResult> {
  const user = await requireAuth();
  const parsed = SubscriptionSchema.safeParse(subscription);
  if (!parsed.success) {
    return { success: false, message: "Subscription push non valida." };
  }

  await savePushSubscription(Number(user.id), parsed.data);
  revalidatePath("/dashboard");
  return { success: true, message: "Notifiche push attivate." };
}

export async function unsubscribeFromPush(endpoint: string): Promise<PushSubscriptionResult> {
  const user = await requireAuth();
  const parsed = z.string().url().max(2048).safeParse(endpoint);
  if (!parsed.success) {
    return { success: false, message: "Endpoint push non valido." };
  }

  await removePushSubscription(Number(user.id), parsed.data);
  revalidatePath("/dashboard");
  return { success: true, message: "Notifiche push disattivate." };
}
