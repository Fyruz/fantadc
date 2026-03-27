import { RateLimiterMemory } from "rate-limiter-flexible";

// Registrazione: max 5 tentativi per IP all'ora
export const registerLimiter = new RateLimiterMemory({
  points: 5,
  duration: 3600,
  blockDuration: 3600,
});

// Login: max 10 tentativi per IP ogni 15 minuti
export const loginLimiter = new RateLimiterMemory({
  points: 10,
  duration: 900,
  blockDuration: 900,
});

// Voto MVP: max 5 tentativi per utente all'ora (la unicità reale è sul DB)
export const voteLimiter = new RateLimiterMemory({
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
