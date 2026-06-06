import MobileOnlyGate from "@/components/mobile-only-gate";
import PublicBottomNav from "@/components/public-bottom-nav";
import PublicNav from "@/components/public-nav";
import MvpVoteToast from "@/components/mvp-vote-toast";
import { getPendingOpenMvpVotes } from "@/lib/pending-mvp-votes";
import { getCurrentUser } from "@/lib/session";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const pendingVotes = user ? await getPendingOpenMvpVotes(Number(user.id)) : [];

  return (
    <MobileOnlyGate>
      <div className="min-h-screen flex flex-col" style={{ background: '#F5F6FF' }}>
        <MvpVoteToast pendingVotes={pendingVotes} />
        <PublicNav />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-34 md:pb-8">{children}</main>
        <PublicBottomNav />
      </div>
    </MobileOnlyGate>
  );
}
