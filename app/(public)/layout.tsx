import Link from "next/link";
import MobileOnlyGate from "@/components/mobile-only-gate";
import PublicBottomNav from "@/components/public-bottom-nav";
import PublicNav from "@/components/public-nav";
import PublicMain from "@/components/public-main";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileOnlyGate>
      <div className="min-h-screen flex flex-col" style={{ background: '#F5F6FF' }}>
        <PublicNav />
        <PublicMain>{children}</PublicMain>
        <footer className="hidden md:block py-4 text-center text-xs" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-soft)" }}>
          <span>Fanta</span>
          <span className="px-2">·</span>
          <Link href="/supporto" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
            Supporto app
          </Link>
          <span className="px-2">·</span>
          <Link href="/privacy" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
            Norme sulla privacy
          </Link>
        </footer>
        <PublicBottomNav />
      </div>
    </MobileOnlyGate>
  );
}
