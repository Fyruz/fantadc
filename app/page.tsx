import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import PublicBottomNav from "@/components/public-bottom-nav";
import PublicNav from "@/components/public-nav";
import StatusBadge from "@/components/status-badge";

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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      <PublicNav />

      <main className="flex-1 pb-24 md:pb-8">
        {/* ── Hero ── */}
        <section
          className="px-4 py-16 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #0107A3 0%, #000560 55%, #000338 100%)" }}
        >
          {/* Decorative circles */}
          <div className="absolute right-[-40px] top-[-40px] w-48 h-48 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute right-[-10px] top-[-10px] w-28 h-28 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute left-[-20px] bottom-[-20px] w-36 h-36 rounded-full border border-white/[0.03] pointer-events-none" />

          <div className="relative max-w-2xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: "rgba(232,160,0,0.15)", border: "1px solid rgba(232,160,0,0.30)", color: "#E8A000" }}
            >
              TORNEO DI PAESE · 2025
            </div>

            <h1 className="font-display font-black text-5xl md:text-6xl uppercase leading-none tracking-tight mb-4">
              FANTA<span style={{ color: "#E8A000" }}>DC</span>
            </h1>

            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "#E8A000" }} />

            <p className="text-base text-white/70 mb-8 leading-relaxed">
              Scegli i tuoi 5 campioni, vota l&apos;MVP e scala la classifica.
            </p>

            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full font-black text-sm uppercase tracking-wide px-8 py-3.5 transition-opacity hover:opacity-90"
                style={{ background: "#E8A000", color: "#06073D", boxShadow: "0 4px 16px rgba(232,160,0,0.45)" }}
              >
                VAI ALLA DASHBOARD →
              </Link>
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-full font-black text-sm uppercase tracking-wide px-8 py-3.5 transition-opacity hover:opacity-90"
                  style={{ background: "#E8A000", color: "#06073D", boxShadow: "0 4px 16px rgba(232,160,0,0.45)" }}
                >
                  PARTECIPA ORA →
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-full font-bold text-sm uppercase tracking-wide px-8 py-3.5 transition-colors"
                  style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  ACCEDI
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── Stats strip ── */}
        {(teamCount > 0 || playerCount > 0 || fantasyCount > 0) && (
          <section
            className="px-4 py-4"
            style={{ background: "#fff", borderBottom: "1px solid var(--border-soft)" }}
          >
            <div className="max-w-3xl mx-auto flex justify-around divide-x divide-[var(--border-soft)]">
              {teamCount > 0 && (
                <div className="flex-1 text-center py-1">
                  <div className="font-display font-black text-2xl" style={{ color: "var(--primary)" }}>{teamCount}</div>
                  <div className="over-label mt-0.5">Squadre</div>
                </div>
              )}
              {playerCount > 0 && (
                <div className="flex-1 text-center py-1">
                  <div className="font-display font-black text-2xl" style={{ color: "var(--primary)" }}>{playerCount}</div>
                  <div className="over-label mt-0.5">Giocatori</div>
                </div>
              )}
              {fantasyCount > 0 && (
                <div className="flex-1 text-center py-1">
                  <div className="font-display font-black text-2xl" style={{ color: "var(--primary)" }}>{fantasyCount}</div>
                  <div className="over-label mt-0.5">Fantasy</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Ultime partite ── */}
        {recentMatches.length > 0 && (
          <section className="max-w-3xl mx-auto w-full px-4 py-8">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="over-label mb-0.5">Calendario</div>
                <h2 className="font-display font-black text-xl uppercase" style={{ color: "var(--text-primary)" }}>
                  ULTIME PARTITE
                </h2>
              </div>
              <Link href="/partite" className="text-xs font-bold uppercase tracking-wide transition-colors hover:opacity-80" style={{ color: "var(--primary)" }}>
                VEDI TUTTO →
              </Link>
            </div>

            <div className="card overflow-hidden">
              {recentMatches.map((m, index) => (
                <Link
                  key={m.id}
                  href={`/partite/${m.id}`}
                  className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-[var(--surface-1)]"
                  style={index < recentMatches.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
                >
                  <div>
                    <span className="font-display font-black text-[13px] uppercase" style={{ color: "var(--text-primary)" }}>
                      {m.homeTeam.shortName ?? m.homeTeam.name}
                      <span className="mx-1.5 font-normal text-[11px]" style={{ color: "var(--text-disabled)" }}>vs</span>
                      {m.awayTeam.shortName ?? m.awayTeam.name}
                    </span>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {m.startsAt.toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <StatusBadge status={m.status} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Quick links ── */}
        <section className="max-w-3xl mx-auto w-full px-4 pb-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { href: "/classifica",  label: "CLASSIFICA", icon: "🏆" },
              { href: "/partite",     label: "PARTITE",    icon: "📅" },
              { href: "/squadre",     label: "SQUADRE",    icon: "🛡️" },
              { href: "/regolamento", label: "REGOLAMENTO",icon: "📋" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-2.5 rounded-2xl p-5 text-center transition-colors hover:bg-[var(--surface-2)]"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border-medium)" }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-display font-black text-[11px] uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer
        className="hidden md:block py-4 text-center text-[11px]"
        style={{ borderTop: "1px solid var(--border-soft)", color: "var(--text-disabled)" }}
      >
        Fantadc — Torneo di paese
      </footer>
      <PublicBottomNav />
    </div>
  );
}
