import MobileOnlyGate from "@/components/mobile-only-gate";
import PublicBottomNav from "@/components/public-bottom-nav";
import PublicNav from "@/components/public-nav";
import MvpVoteToast from "@/components/mvp-vote-toast";
import ReviewPromptModal from "@/components/review-prompt-modal";
import UserMain from "@/components/user-main";
import { getPendingOpenMvpVotes } from "@/lib/pending-mvp-votes";
import { getReviewPromptPlayers } from "@/lib/review-prompt";
import { getCurrentUser } from "@/lib/session";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const [pendingVotes, reviewPromptPlayers] = user
    ? await Promise.all([getPendingOpenMvpVotes(Number(user.id)), getReviewPromptPlayers(Number(user.id))])
    : [[], []];

  return (
    <MobileOnlyGate>
      <div className="min-h-screen flex flex-col" style={{ background: '#F5F6FF' }}>
        <MvpVoteToast pendingVotes={pendingVotes} />
        <ReviewPromptModal players={reviewPromptPlayers} />
        <PublicNav />
        <UserMain>{children}</UserMain>
        <PublicBottomNav />
      </div>
    </MobileOnlyGate>
  );
}
