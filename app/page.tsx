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
      take: 3,
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

        {/* ── HERO ─────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(150deg, #0107A3 0%, #000560 50%, #000228 100%)" }}
        >
          {/* Background texture */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle at 80% 20%, rgba(232,160,0,0.08) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.04) 0%, transparent 50%)"
          }} />
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
          {/* Glow orb top-right */}
          <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full pointer-events-none" style={{
            background: "radial-gradient(circle, rgba(232,160,0,0.12) 0%, transparent 70%)"
          }} />

          <div className="relative max-w-2xl mx-auto px-5 pt-14 pb-12 text-center">
            {/* Eyebrow pill */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-[10px] font-black uppercase tracking-[0.18em]"
              style={{ background: "rgba(232,160,0,0.12)", border: "1px solid rgba(232,160,0,0.28)", color: "#E8A000" }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#E8A000" }} />
              Torneo di Paese · 2025
            </div>

            {/* Title */}
            <h1 className="font-display font-black uppercase leading-[0.92] tracking-tight text-white mb-5"
                style={{ fontSize: "clamp(3.5rem, 14vw, 6rem)" }}>
              FANTA<span style={{ color: "#E8A000" }}>DC</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg leading-relaxed mb-10 max-w-md mx-auto"
               style={{ color: "rgba(255,255,255,0.60)" }}>
              Scegli i tuoi 5 campioni, vota l&apos;MVP di ogni partita e scala la classifica del torneo.
            </p>

            {/* CTA */}
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2.5 rounded-full font-display font-black text-base uppercase tracking-wide px-10 py-4 transition-all hover:scale-105"
                style={{ background: "#E8A000", color: "#06073D", boxShadow: "0 6px 28px rgba(232,160,0,0.45)" }}
              >
                <i className="pi pi-th-large text-sm" />
                Vai alla Dashboard
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full font-display font-black text-base uppercase tracking-wide px-10 py-4 transition-all hover:scale-105"
                  style={{ background: "#E8A000", color: "#06073D", boxShadow: "0 6px 28px rgba(232,160,0,0.45)" }}
                >
                  <i className="pi pi-star text-sm" />
                  Partecipa Ora
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full font-display font-black text-base uppercase tracking-wide px-10 py-4 transition-all hover:bg-white/15"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.18)" }}
                >
                  Accedi
                </Link>
              </div>
            )}
          </div>

          {/* Stats bar — fused into hero bottom */}
          {(teamCount > 0 || playerCount > 0 || fantasyCount > 0) && (
            <div
              className="relative mx-4 md:mx-auto md:max-w-2xl mb-0 rounded-t-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderBottom: "none" }}
            >
              <div className="flex divide-x" style={{ "--tw-divide-opacity": 1, borderColor: "rgba(255,255,255,0.08)" } as React.CSSProperties}>
                {[
                  { v: teamCount,   label: "Squadre",  show: teamCount > 0 },
                  { v: playerCount, label: "Giocatori", show: playerCount > 0 },
                  { v: fantasyCount, label: "Fantasy",  show: fantasyCount > 0 },
                ].filter(s => s.show).map((s) => (
                  <div key={s.label} className="flex-1 text-center py-5 px-2" style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="font-display font-black text-3xl text-white leading-none">{s.v}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── COME FUNZIONA ─────────────────────────────────── */}
        <section className="max-w-2xl mx-auto w-full px-4 pt-10 pb-4">
          <div className="text-center mb-7">
            <div className="over-label mb-1">Il gioco</div>
            <h2 className="font-display font-black text-2xl uppercase" style={{ color: "var(--text-primary)" }}>
              Come funziona
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { step: "01", icon: "pi-users", title: "Crea la squadra", desc: "Scegli 5 giocatori del torneo e dai loro un nome." },
              { step: "02", icon: "pi-star", title: "Vota l'MVP",       desc: "Dopo ogni partita scegli il migliore in campo." },
              { step: "03", icon: "pi-trophy", title: "Scala la classifica", desc: "I punti si accumulano: vince chi gestisce meglio." },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl p-4 flex flex-col gap-3"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border-medium)" }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <i className={`pi ${item.icon} text-sm`} style={{ color: "var(--primary)" }} />
                  </div>
                  <span className="font-display font-black text-[11px]" style={{ color: "var(--border-medium)" }}>{item.step}</span>
                </div>
                <div>
                  <div className="font-display font-black text-[13px] uppercase leading-tight mb-1" style={{ color: "var(--text-primary)" }}>
                    {item.title}
                  </div>
                  <div className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── QUICK LINKS ───────────────────────────────────── */}
        <section className="max-w-2xl mx-auto w-full px-4 py-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { href: "/classifica",  label: "Classifica", icon: "pi-trophy",      accent: "#E8A000" },
              { href: "/partite",     label: "Partite",    icon: "pi-calendar",    accent: "#0107A3" },
              { href: "/squadre",     label: "Squadre",    icon: "pi-shield",      accent: "#0107A3" },
              { href: "/regolamento", label: "Regolamento",icon: "pi-book",        accent: "#0107A3" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl px-4 py-4 transition-all hover:scale-[1.02]"
                style={{ background: "#fff", border: "1.5px solid var(--border-medium)", boxShadow: "0 2px 8px rgba(1,7,163,0.05)" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.accent === "#E8A000" ? "rgba(232,160,0,0.12)" : "var(--primary-light)" }}
                >
                  <i className={`pi ${item.icon} text-sm`} style={{ color: item.accent }} />
                </div>
                <span className="font-display font-black text-[13px] uppercase leading-tight" style={{ color: "var(--text-primary)" }}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── ULTIME PARTITE ────────────────────────────────── */}
        {recentMatches.length > 0 && (
          <section className="max-w-2xl mx-auto w-full px-4 py-4">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <div className="over-label mb-0.5">Calendario</div>
                <h2 className="font-display font-black text-xl uppercase" style={{ color: "var(--text-primary)" }}>
                  Partite recenti
                </h2>
              </div>
              <Link
                href="/partite"
                className="text-[11px] font-black uppercase tracking-wide transition-opacity hover:opacity-70"
                style={{ color: "var(--primary)" }}
              >
                Vedi tutto →
              </Link>
            </div>

            <div className="card overflow-hidden">
              {recentMatches.map((m, index) => (
                <Link
                  key={m.id}
                  href={`/partite/${m.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--surface-1)]"
                  style={index < recentMatches.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
                >
                  {/* Score or date indicator */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                    style={{ background: "var(--surface-1)", color: "var(--text-muted)" }}
                  >
                    {m.homeScore !== null && m.awayScore !== null
                      ? <span style={{ color: "var(--primary)", fontSize: "11px" }}>{m.homeScore}–{m.awayScore}</span>
                      : <i className="pi pi-calendar" style={{ fontSize: "11px" }} />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-display font-black text-[13px] uppercase truncate" style={{ color: "var(--text-primary)" }}>
                      {m.homeTeam.shortName ?? m.homeTeam.name}
                      <span className="mx-1.5 font-normal text-[10px]" style={{ color: "var(--text-disabled)" }}>vs</span>
                      {m.awayTeam.shortName ?? m.awayTeam.name}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {m.startsAt.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })}
                    </div>
                  </div>

                  <StatusBadge status={m.status} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA BOTTOM (guest only) ───────────────────────── */}
        {!user && (
          <section className="max-w-2xl mx-auto w-full px-4 py-6 pb-8">
            <div
              className="relative overflow-hidden rounded-2xl px-6 py-8 text-center"
              style={{ background: "linear-gradient(135deg, #0107A3 0%, #000560 100%)", boxShadow: "0 8px 32px rgba(1,7,163,0.30)" }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "radial-gradient(circle at 90% 10%, rgba(232,160,0,0.15) 0%, transparent 50%)"
              }} />
              <div className="relative">
                <div className="font-display font-black text-3xl uppercase text-white mb-2 tracking-tight">
                  Pronto a giocare?
                </div>
                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.60)" }}>
                  Registrati gratuitamente e crea la tua squadra fantasy.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full font-display font-black text-base uppercase tracking-wide px-9 py-3.5 transition-all hover:scale-105"
                  style={{ background: "#E8A000", color: "#06073D", boxShadow: "0 4px 20px rgba(232,160,0,0.45)" }}
                >
                  <i className="pi pi-user-plus text-sm" />
                  Inizia ora
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer
        className="hidden md:block py-4 text-center text-[11px]"
        style={{ borderTop: "1px solid var(--border-soft)", color: "var(--text-disabled)" }}
      >
        Fantadc · Torneo di paese
      </footer>
      <PublicBottomNav />
    </div>
  );
}
