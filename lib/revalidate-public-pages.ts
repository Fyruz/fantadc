import { revalidatePath } from "next/cache";

export function revalidateFantasyPages() {
  revalidatePath("/classifica");
  revalidatePath("/squadre-fantasy");
  revalidatePath("/squadre-fantasy/[id]", "page");
}
