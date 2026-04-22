import { requireAdmin } from "@/lib/session";
import TopBar from "./_top-bar";
import BottomNav from "./_bottom-nav";

export default async function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const displayName = user.name ?? user.email ?? "Admin";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <TopBar initials={initials} userName={displayName} />
      <main className="max-w-screen-xl mx-auto w-full px-4 md:px-6 py-4 md:py-6 pb-24 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
