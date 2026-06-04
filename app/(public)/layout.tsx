import Link from "next/link";
import PublicBottomNav from "@/components/public-bottom-nav";
import PublicNav from "@/components/public-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F6FF' }}>
      <PublicNav />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24 md:pb-8">{children}</main>
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
  );
}
