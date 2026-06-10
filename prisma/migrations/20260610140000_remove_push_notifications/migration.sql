-- DropForeignKey
ALTER TABLE "PushNotificationDelivery" DROP CONSTRAINT "PushNotificationDelivery_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "PushNotificationDelivery" DROP CONSTRAINT "PushNotificationDelivery_matchId_fkey";

-- DropForeignKey
ALTER TABLE "PushSubscription" DROP CONSTRAINT "PushSubscription_userId_fkey";

-- DropTable
DROP TABLE "PushNotificationDelivery";

-- DropTable
DROP TABLE "PushSubscription";

-- DropEnum
DROP TYPE "PushNotificationType";
