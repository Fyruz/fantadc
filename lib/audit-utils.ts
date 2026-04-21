const REDACTED_KEYS = new Set([
  "password",
  "passwordHash",
  "secret",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
]);
const MAX_AUDIT_DEPTH = 5;
const MAX_AUDIT_KEYS = 50;
const MAX_AUDIT_STRING_LENGTH = 500;

/**
 * JSON-safe shape accepted by the audit logger after sanitization/redaction.
 * We use this instead of `unknown` so recursive payload transforms stay typed
 * before handing values to Prisma's JSON columns.
 */
export type AuditLogValue =
  | null
  | boolean
  | number
  | string
  | AuditLogValue[]
  | { [key: string]: AuditLogValue };

export function sanitizeAuditPayload(
  payload: unknown,
  depth = 0
): AuditLogValue | undefined {
  if (payload === undefined) return undefined;
  if (payload === null) return null;
  if (typeof payload === "boolean" || typeof payload === "number") {
    return payload;
  }
  if (typeof payload === "string") {
    return payload.length > MAX_AUDIT_STRING_LENGTH
      ? `${payload.slice(0, MAX_AUDIT_STRING_LENGTH)}…`
      : payload;
  }
  if (payload instanceof Date) {
    return payload.toISOString();
  }
  if (depth >= MAX_AUDIT_DEPTH) {
    return "[Truncated]";
  }
  if (Array.isArray(payload)) {
    return payload
      .slice(0, MAX_AUDIT_KEYS)
      .map((entry) => sanitizeAuditPayload(entry, depth + 1))
      .filter((entry): entry is AuditLogValue => entry !== undefined);
  }
  if (typeof payload === "object") {
    const entries = Object.entries(payload as Record<string, unknown>).slice(
      0,
      MAX_AUDIT_KEYS
    );
    const sanitizedEntries = entries.flatMap(([key, value]) => {
      if (REDACTED_KEYS.has(key)) {
        return [[key, "[REDACTED]"] satisfies [string, AuditLogValue]];
      }

      const sanitizedValue = sanitizeAuditPayload(value, depth + 1);
      if (sanitizedValue === undefined) {
        return [];
      }

      return [[key, sanitizedValue] satisfies [string, AuditLogValue]];
    });

    return Object.fromEntries(sanitizedEntries);
  }

  return String(payload);
}
