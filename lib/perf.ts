type MeasureServerTimingOptions = {
  thresholdMs?: number;
};

const DEFAULT_THRESHOLD_MS = 150;

function isServerTimingEnabled(): boolean {
  return process.env.PERF_LOG === "1" || process.env.NODE_ENV === "development";
}

function getThresholdMs(options?: MeasureServerTimingOptions): number {
  if (typeof options?.thresholdMs === "number") return options.thresholdMs;

  const configured = Number(process.env.PERF_LOG_THRESHOLD_MS);
  return Number.isFinite(configured) && configured >= 0
    ? configured
    : DEFAULT_THRESHOLD_MS;
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

function logServerTiming(
  label: string,
  startedAt: number,
  options?: MeasureServerTimingOptions
): void {
  if (!isServerTimingEnabled()) return;

  const durationMs = Date.now() - startedAt;
  if (durationMs < getThresholdMs(options)) return;

  console.info(`[perf] ${label} ${durationMs}ms`);
}

export function measureServerTiming<T>(
  label: string,
  fn: () => T,
  options?: MeasureServerTimingOptions
): T {
  const startedAt = Date.now();

  try {
    const result = fn();

    if (isPromiseLike(result)) {
      return Promise.resolve(result).finally(() => {
        logServerTiming(label, startedAt, options);
      }) as T;
    }

    logServerTiming(label, startedAt, options);
    return result;
  } catch (error) {
    logServerTiming(label, startedAt, options);
    throw error;
  }
}
