import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import PublicBottomNav from "@/components/public-bottom-nav";
import PublicNav from "@/components/public-nav";

export default async function HomePage() {
  const [user, teamCount, playerCount, fantasyCount, recentMatches] = await Promise.all([
    getCurrentUser(),
    db.footballTeam.count(),
    db.player.count(),
    db.fantasyTeam.count(),
    db.match.findMany({
      where: { status: { in: ["SCHEDULED", "CONCLUDED", "PUBLISHED"] } },
      orderBy: { startsAt: "desc" },
      take: 4,
      include: {
        homeTeam: { select: { name: true, shortName: true } },
        awayTeam: { select: { name: true, shortName: true } },
      },
    }),
  ]);

  const statusLabel: Record<string, string> = {
    SCHEDULED: "Programmata",
    CONCLUDED: "Conclusa",
    PUBLISHED: "Pubblicata",
  };

  const statusClass: Record<string, string> = {
    SCHEDULED: "badge-scheduled",
    CONCLUDED: "badge-concluded",
    PUBLISHED: "badge-published",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC]">
      <PublicNav />

      <main className="flex-1 pb-24 md:pb-8">
        <section
          className="px-4 py-20 text-center text-white"
          style={{
            background: "linear-gradient(135deg, #0107A3 0%, #000b8a 50%, #010460 100%)",
          }}
        >
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 text-6xl">⚽</div>
            <h1 className="mb-3 text-4xl font-extrabold tracking-tight">Fantadc</h1>
            <p className="mb-8 text-lg text-white/80">
              Il fantacalcio ufficiale del torneo di paese.
              Scegli i tuoi 5 campioni, vota l&apos;MVP e scala la classifica.
            </p>
            {user ? (
              <Link
                href="/dashboard"
                className="inline-block rounded-lg bg-yellow-400 px-8 py-3 text-base font-bold text-zinc-900 transition-colors hover:bg-yellow-300"
              >
                Vai alla tua dashboard →
              </Link>
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-block rounded-lg bg-yellow-400 px-8 py-3 text-base font-bold text-zinc-900 transition-colors hover:bg-yellow-300"
                >
                  Partecipa ora
                </Link>
                <Link
                  href="/login"
                  className="inline-block rounded-lg border border-white/30 bg-white/10 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-white/20"
                >
                  Accedi
                </Link>
              </div>
            )}
          </div>
        </section>

        {(teamCount > 0 || playerCount > 0 || fantasyCount > 0) && (
          <section className="border-b bg-zinc-50 px-4 py-6">
            <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-12 text-center">
              {teamCount > 0 && (
                <div>
                  <div className="text-3xl font-bold" style={{ color: "var(--primary)" }}>{teamCount}</div>
                  <div className="mt-0.5 text-xs text-zinc-500">Squadre</div>
                </div>
              )}
              {playerCount > 0 && (
                <div>
                  <div className="text-3xl font-bold" style={{ color: "var(--primary)" }}>{playerCount}</div>
                  <div className="mt-0.5 text-xs text-zinc-500">Giocatori</div>
                </div>
              )}
              {fantasyCount > 0 && (
                <div>
                  <div className="text-3xl font-bold" style={{ color: "var(--primary)" }}>{fantasyCount}</div>
                  <div className="mt-0.5 text-xs text-zinc-500">Squadre fantasy</div>
                </div>
              )}
            </div>
          </section>
        )}

        {recentMatches.length > 0 && (
          <section className="mx-auto w-full max-w-3xl px-4 py-10">
            <h2 className="mb-4 text-lg font-bold">Ultime partite</h2>
            <div className="flex flex-col gap-2">
              {recentMatches.map((m) => (
                <Link
                  key={m.id}
                  href={`/partite/${m.id}`}
                  className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 transition-colors hover:bg-zinc-50"
                >
                  <span className="text-sm font-medium">
                    {m.homeTeam.shortName ?? m.homeTeam.name} <span className="mx-1 text-zinc-400">vs</span> {m.awayTeam.shortName ?? m.awayTeam.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400">{m.startsAt.toLocaleDateString("it-IT")}</span>
                    <span className={statusClass[m.status] ?? "badge-draft"}>{statusLabel[m.status] ?? m.status}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/partite" className="text-sm font-medium hover:underline" style={{ color: "var(--primary)" }}>
                Vedi tutto il calendario →
              </Link>
            </div>
          </section>
        )}

        <section className="mx-auto w-full max-w-3xl px-4 pb-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { href: "/classifica", label: "Classifica", icon: "🏆" },
              { href: "/partite", label: "Partite", icon: "📅" },
              { href: "/squadre", label: "Squadre", icon: "🛡️" },
              { href: "/regolamento", label: "Regolamento", icon: "📋" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center transition-colors hover:bg-zinc-50"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="hidden border-t py-4 text-center text-xs text-zinc-400 md:block">
        Fantadc — Torneo di paese
      </footer>
      <PublicBottomNav />
    </div>
  );
}
