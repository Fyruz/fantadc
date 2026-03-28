import PublicNav from "@/components/public-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>
      <footer className="border-t py-4 text-center text-xs text-zinc-400">
        Fantadc — Torneo di paese
      </footer>
    </div>
  );
}
