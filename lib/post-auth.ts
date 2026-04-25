import { UserRole } from "@prisma/client";

export const AUTH_ONBOARDING_PATH = "/dashboard/start";

export function sanitizeNextPath(next: FormDataEntryValue | null | undefined) {
  if (typeof next !== "string") {
    return "";
  }

  return next.startsWith("/") && !next.startsWith("//") ? next : "";
}

export function resolvePostAuthRedirect({
  role,
  hasFantasyTeam,
  next,
}: {
  role: UserRole;
  hasFantasyTeam: boolean;
  next?: string;
}) {
  if (role === UserRole.ADMIN) {
    return next || "/admin";
  }

  if (!hasFantasyTeam) {
    return AUTH_ONBOARDING_PATH;
  }

  return next || "/dashboard";
}
