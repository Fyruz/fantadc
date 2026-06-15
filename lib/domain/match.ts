export const LIVE_MATCH_WINDOW_MS = 120 * 60 * 1000;

export function isScheduledMatchInProgress({
  status,
  startsAt,
  now = new Date(),
  windowMs = LIVE_MATCH_WINDOW_MS,
}: {
  status: string;
  startsAt: Date;
  now?: Date;
  windowMs?: number;
}) {
  const elapsedMs = now.getTime() - startsAt.getTime();
  return status === "SCHEDULED" && elapsedMs >= 0 && elapsedMs <= windowMs;
}
