import PublicBottomNav from "@/components/public-bottom-nav";
import PublicNav from "@/components/public-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      <PublicNav />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24 md:pb-8">{children}</main>
      <footer className="hidden md:block py-4 text-center text-xs" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-soft)' }}>
        Fantadc
      </footer>
      <PublicBottomNav />
    </div>
  );
}
