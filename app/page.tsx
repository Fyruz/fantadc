import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
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
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section
        className="text-white py-20 px-4 text-center"
        style={{
          background: "linear-gradient(135deg, #0107A3 0%, #000b8a 50%, #010460 100%)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Fantadc</h1>
          <p className="text-white/80 text-lg mb-8">
            Il fantacalcio ufficiale del torneo di paese.
            Scegli i tuoi 5 campioni, vota l&apos;MVP e scala la classifica.
          </p>
          {user ? (
            <Link href="/dashboard" className="inline-block bg-yellow-400 text-zinc-900 font-bold px-8 py-3 rounded-lg text-base hover:bg-yellow-300 transition-colors">
              Vai alla tua dashboard →
            </Link>
          ) : (
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/register" className="inline-block bg-yellow-400 text-zinc-900 font-bold px-8 py-3 rounded-lg text-base hover:bg-yellow-300 transition-colors">
                Partecipa ora
              </Link>
              <Link href="/login" className="inline-block bg-white/10 border border-white/30 text-white font-medium px-8 py-3 rounded-lg text-base hover:bg-white/20 transition-colors">
                Accedi
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats strip */}
      {(teamCount > 0 || playerCount > 0 || fantasyCount > 0) && (
        <section className="border-b bg-zinc-50 py-6 px-4">
          <div className="max-w-3xl mx-auto flex justify-center gap-12 text-center flex-wrap">
            {teamCount > 0 && (
              <div>
                <div className="text-3xl font-bold" style={{ color: "var(--primary)" }}>{teamCount}</div>
                <div className="text-xs text-zinc-500 mt-0.5">Squadre</div>
              </div>
            )}
            {playerCount > 0 && (
              <div>
                <div className="text-3xl font-bold" style={{ color: "var(--primary)" }}>{playerCount}</div>
                <div className="text-xs text-zinc-500 mt-0.5">Giocatori</div>
              </div>
            )}
            {fantasyCount > 0 && (
              <div>
                <div className="text-3xl font-bold" style={{ color: "var(--primary)" }}>{fantasyCount}</div>
                <div className="text-xs text-zinc-500 mt-0.5">Squadre fantasy</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recent matches */}
      {recentMatches.length > 0 && (
        <section className="max-w-3xl mx-auto w-full px-4 py-10">
          <h2 className="text-lg font-bold mb-4">Ultime partite</h2>
          <div className="flex flex-col gap-2">
            {recentMatches.map((m) => (
              <Link
                key={m.id}
                href={`/partite/${m.id}`}
                className="flex items-center justify-between border rounded-xl px-4 py-3 hover:bg-zinc-50 transition-colors"
              >
                <span className="font-medium text-sm">
                  {m.homeTeam.shortName ?? m.homeTeam.name} <span className="text-zinc-400 mx-1">vs</span> {m.awayTeam.shortName ?? m.awayTeam.name}
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

      {/* Quick links */}
      <section className="max-w-3xl mx-auto w-full px-4 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/classifica", label: "Classifica", icon: "🏆" },
            { href: "/partite", label: "Partite", icon: "📅" },
            { href: "/squadre", label: "Squadre", icon: "🛡️" },
            { href: "/regolamento", label: "Regolamento", icon: "📋" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 border rounded-xl p-4 hover:bg-zinc-50 transition-colors text-center"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t py-4 text-center text-xs text-zinc-400">
        Fantadc — Torneo di paese
      </footer>
    </div>
  );
}
