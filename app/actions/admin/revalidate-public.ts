import { revalidatePath } from "next/cache";

const DCUP_PUBLIC_PATHS = [
  "/",
  "/partite",
  "/gironi",
  "/eliminazione",
  "/squadre",
  "/giocatori",
  "/classifica-torneo",
  "/classifica-marcatori",
  "/classifica-fanta",
  "/giocatori-fanta",
  "/squadre-fanta",
];

const VOLLEY_PUBLIC_PATHS = [
  "/greenvolley",
  "/greenvolley/partite",
  "/greenvolley/classifica",
  "/greenvolley/gironi",
  "/greenvolley/eliminazione",
  "/greenvolley/squadre",
];

export function revalidateDcupPublicPaths(matchId?: number) {
  for (const path of DCUP_PUBLIC_PATHS) revalidatePath(path);
  if (matchId) revalidatePath(`/partite/${matchId}`);
}

export function revalidateBonusPublicPaths() {
  revalidatePath("/bonus-pubblici");
  revalidatePath("/bonus-segreti");
}

export function revalidateVolleyPublicPaths(matchId?: number) {
  for (const path of VOLLEY_PUBLIC_PATHS) revalidatePath(path);
  if (matchId) revalidatePath(`/greenvolley/partite/${matchId}`);
}
