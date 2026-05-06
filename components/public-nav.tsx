import { getCurrentUser } from "@/lib/session";
import PublicNavClient from "./public-nav-client";

export default async function PublicNav() {
  const user = await getCurrentUser();
  return <PublicNavClient user={user} />;
}
