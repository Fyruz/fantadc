import { RateLimiterMemory } from "rate-limiter-flexible";

// Voto MVP: max 5 tentativi per utente all'ora (la unicità reale è sul DB)
export const voteLimiter = new RateLimiterMemory({
  points: 5,
  duration: 3600,
  blockDuration: 3600,
});

// Cambio password: max 5 tentativi per utente all'ora
export const passwordChangeLimiter = new RateLimiterMemory({
  points: 5,
  duration: 3600,
  blockDuration: 3600,
});

// Cancellazione account: max 5 tentativi per utente all'ora
export const deleteAccountLimiter = new RateLimiterMemory({
  points: 5,
  duration: 3600,
  blockDuration: 3600,
});

export async function checkRateLimit(
  limiter: RateLimiterMemory,
  key: string
): Promise<{ limited: boolean; retryAfter?: number }> {
  try {
    await limiter.consume(key);
    return { limited: false };
  } catch (e: unknown) {
    const msBeforeNext =
      e && typeof e === "object" && "msBeforeNextReset" in e
        ? (e as { msBeforeNextReset: number }).msBeforeNextReset
        : 0;
    return {
      limited: true,
      retryAfter: Math.ceil(msBeforeNext / 1000),
    };
  }
}
