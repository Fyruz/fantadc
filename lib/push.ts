import webpush, { WebPushError, type PushSubscription as WebPushSubscription } from "web-push";
import { PushNotificationType } from "@prisma/client";
import { db } from "@/lib/db";
import { buildVoteOpenNotificationPayload } from "@/lib/push-payload";

export type SerializablePushSubscription = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

let vapidConfigured = false;

function getPushConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim();

  if (!publicKey || !privateKey || !subject) {
    return null;
  }

  return { publicKey, privateKey, subject };
}

export function isPushConfigured() {
  return getPushConfig() !== null;
}

function ensurePushConfig() {
  const config = getPushConfig();
  if (!config) {
    return null;
  }

  if (!vapidConfigured) {
    webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
    vapidConfigured = true;
  }

  return config;
}

function toStoredExpirationTime(expirationTime?: number | null) {
  if (typeof expirationTime !== "number" || !Number.isFinite(expirationTime) || expirationTime <= 0) {
    if (expirationTime !== null && expirationTime !== undefined) {
      console.warn("[Fantadc Push] Ignoring invalid push subscription expirationTime.", expirationTime);
    }
    return null;
  }

  return new Date(expirationTime);
}

function toWebPushSubscription(subscription: SerializablePushSubscription): WebPushSubscription {
  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime ?? null,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  };
}

export async function savePushSubscription(userId: number, subscription: SerializablePushSubscription) {
  return db.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      expirationTime: toStoredExpirationTime(subscription.expirationTime),
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      expirationTime: toStoredExpirationTime(subscription.expirationTime),
    },
  });
}

export async function removePushSubscription(userId: number, endpoint: string) {
  await db.pushSubscription.deleteMany({
    where: { userId, endpoint },
  });
}

export async function sendVoteOpenNotifications(matchId: number) {
  if (!ensurePushConfig()) {
    return { sent: 0, removed: 0, skipped: true as const };
  }

  const match = await db.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      homeSeed: true,
      awaySeed: true,
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
    },
  });

  if (!match) {
    return { sent: 0, removed: 0, skipped: false as const };
  }

  const title = `${match.homeTeam?.name ?? match.homeSeed ?? "TBD"} vs ${match.awayTeam?.name ?? match.awaySeed ?? "TBD"}`;
  const payload = JSON.stringify(buildVoteOpenNotificationPayload(match.id, title));

  const subscriptions = await db.pushSubscription.findMany({
    where: {
      user: { isSuspended: false },
      sentNotifications: {
        none: {
          matchId,
          type: PushNotificationType.VOTE_OPEN,
        },
      },
    },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
      expirationTime: true,
    },
  });

  if (subscriptions.length === 0) {
    return { sent: 0, removed: 0, skipped: false as const };
  }

  const deliveredSubscriptionIds: number[] = [];
  const invalidSubscriptionIds: number[] = [];

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          toWebPushSubscription({
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime?.getTime() ?? null,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          }),
          payload,
          { TTL: 60 * 60 },
        );
        deliveredSubscriptionIds.push(subscription.id);
      } catch (error) {
        if (error instanceof WebPushError && error.statusCode !== undefined && [404, 410].includes(error.statusCode)) {
          invalidSubscriptionIds.push(subscription.id);
          return;
        }

        console.error("[Fantadc Push] Failed to send vote-open notification.", error);
      }
    }),
  );

  if (invalidSubscriptionIds.length > 0) {
    await db.pushSubscription.deleteMany({
      where: { id: { in: invalidSubscriptionIds } },
    });
  }

  if (deliveredSubscriptionIds.length > 0) {
    await db.pushNotificationDelivery.createMany({
      data: deliveredSubscriptionIds.map((subscriptionId) => ({
        subscriptionId,
        matchId,
        type: PushNotificationType.VOTE_OPEN,
      })),
      skipDuplicates: true,
    });
  }

  return {
    sent: deliveredSubscriptionIds.length,
    removed: invalidSubscriptionIds.length,
    skipped: false as const,
  };
}
