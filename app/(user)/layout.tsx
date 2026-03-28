import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { signOut } from "@/lib/auth";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-sm tracking-wide">Fantadc</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-zinc-600 hover:text-zinc-900">Dashboard</Link>
          <Link href="/squadra" className="text-zinc-600 hover:text-zinc-900">La mia squadra</Link>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button type="submit" className="text-zinc-400 hover:text-zinc-700 text-xs">
              Esci ({user.email})
            </button>
          </form>
        </nav>
      </header>
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">{children}</main>
    </div>
  );
}
