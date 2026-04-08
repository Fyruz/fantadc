import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import PublicBottomNav from "@/components/public-bottom-nav";
import PublicNav from "@/components/public-nav";
import StatusBadge from "@/components/status-badge";

export default async function HomePage() {
  const [user, teamCount, playerCount, fantasyCount, spotlight, upcoming] = await Promise.all([
    getCurrentUser(),
    db.footballTeam.count(),
    db.player.count(),
    db.fantasyTeam.count(),
    // Ultima partita conclusa (con risultato)
    db.match.findFirst({
      where: { status: "CONCLUDED" },
      orderBy: { startsAt: "desc" },
      include: {
        homeTeam: { select: { name: true, shortName: true } },
        awayTeam: { select: { name: true, shortName: true } },
      },
    }),
    // Prossima partita programmata
    db.match.findFirst({
      where: { status: "SCHEDULED" },
      orderBy: { startsAt: "asc" },
      include: {
        homeTeam: { select: { name: true, shortName: true } },
        awayTeam: { select: { name: true, shortName: true } },
      },
    }),
  ]);

  const featured = upcoming ?? spotlight;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F6FF" }}>
      <PublicNav />

      <main className="flex-1 pb-24 md:pb-0">

        {/* ══ HERO ══════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden flex flex-col items-center justify-center text-center"
          style={{
            minHeight: "86svh",
            background: "linear-gradient(170deg, #000228 0%, #0107A3 45%, #0A0FC4 100%)",
          }}
        >
          {/* Campo da calcio — linee SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 600"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g stroke="rgba(255,255,255,0.055)" strokeWidth="1.2" fill="none">
              {/* Bordo campo */}
              <rect x="40" y="60" width="320" height="480" />
              {/* Centrocampo */}
              <line x1="40" y1="300" x2="360" y2="300" />
              {/* Cerchio centrocampo */}
              <circle cx="200" cy="300" r="55" />
              <circle cx="200" cy="300" r="3" fill="rgba(255,255,255,0.07)" stroke="none" />
              {/* Area grande alto */}
              <rect x="110" y="60" width="180" height="80" />
              {/* Area piccola alto */}
              <rect x="155" y="60" width="90" height="35" />
              {/* Area grande basso */}
              <rect x="110" y="460" width="180" height="80" />
              {/* Area piccola basso */}
              <rect x="155" y="505" width="90" height="35" />
              {/* Archi area alto */}
              <path d="M 130,140 Q 200,175 270,140" />
              {/* Archi area basso */}
              <path d="M 130,460 Q 200,425 270,460" />
              {/* Angoli */}
              <path d="M 40,60 Q 50,60 50,70" />
              <path d="M 360,60 Q 350,60 350,70" />
              <path d="M 40,540 Q 50,540 50,530" />
              <path d="M 360,540 Q 350,540 350,530" />
            </g>
          </svg>

          {/* Glow gold */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "10%", right: "-10%",
              width: "50vw", height: "50vw",
              background: "radial-gradient(circle, rgba(232,160,0,0.13) 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: "5%", left: "-5%",
              width: "35vw", height: "35vw",
              background: "radial-gradient(circle, rgba(1,7,163,0.6) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 px-5 py-20 max-w-lg mx-auto flex flex-col items-center gap-6">

            {/* Wordmark */}
            <h1
              className="font-display font-black text-white uppercase leading-[0.88] tracking-tight"
              style={{ fontSize: "clamp(4rem, 20vw, 7.5rem)" }}
            >
              FANTA<span style={{ color: "#E8A000" }}>DC</span>
            </h1>

            {/* Tagline */}
            <p
              className="text-sm md:text-base leading-relaxed max-w-xs"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Scegli i tuoi 5 campioni, vota l&apos;MVP e scala la classifica.
            </p>

            {/* CTA */}
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2.5 rounded-full font-display font-black text-base uppercase tracking-wide px-10 py-4"
                style={{
                  background: "#E8A000",
                  color: "#06073D",
                  boxShadow: "0 0 0 1px rgba(232,160,0,0.3), 0 8px 32px rgba(232,160,0,0.5)",
                }}
              >
                <i className="pi pi-th-large" style={{ fontSize: 14 }} />
                Dashboard
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  href="/register"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 rounded-full font-display font-black text-base uppercase tracking-wide px-10 py-4"
                  style={{
                    background: "#E8A000",
                    color: "#06073D",
                    boxShadow: "0 0 0 1px rgba(232,160,0,0.3), 0 8px 32px rgba(232,160,0,0.5)",
                  }}
                >
                  Partecipa ora
                </Link>
                <Link
                  href="/login"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-full font-display font-black text-base uppercase tracking-wide px-10 py-4"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.85)",
                    border: "1.5px solid rgba(255,255,255,0.16)",
                  }}
                >
                  Accedi
                </Link>
              </div>
            )}
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }}>
            <svg viewBox="0 0 1440 56" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 56 }}>
              <path d="M0,56 L0,28 Q360,0 720,28 Q1080,56 1440,28 L1440,56 Z" fill="#F5F6FF" />
            </svg>
          </div>
        </section>

        {/* ══ SPOTLIGHT PARTITA ═════════════════════════════════════ */}
        {featured && (
          <section className="max-w-lg mx-auto w-full px-4 -mt-1 pb-4">
            <Link href={`/partite/${featured.id}`} className="block group">
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: "#fff",
                  border: "1.5px solid var(--border-medium)",
                  boxShadow: "0 4px 24px rgba(1,7,163,0.10)",
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 pt-4 pb-3"
                  style={{ borderBottom: "1px solid var(--border-soft)" }}
                >
                  <span className="over-label">{upcoming ? "Prossima partita" : "Ultimo risultato"}</span>
                  <StatusBadge status={featured.status} />
                </div>

                {/* Match */}
                <div className="px-5 py-5 flex items-center gap-3">
                  {/* Home */}
                  <div className="flex-1 text-right">
                    <div
                      className="font-display font-black uppercase leading-tight"
                      style={{ fontSize: "clamp(1rem, 4vw, 1.4rem)", color: "var(--text-primary)" }}
                    >
                      {featured.homeTeam.shortName ?? featured.homeTeam.name}
                    </div>
                  </div>

                  {/* Score or VS */}
                  <div className="flex-shrink-0 text-center w-24">
                    {featured.homeScore !== null && featured.awayScore !== null ? (
                      <div
                        className="font-display font-black tabular-nums"
                        style={{ fontSize: "clamp(2rem, 8vw, 3rem)", color: "var(--primary)", lineHeight: 1 }}
                      >
                        {featured.homeScore}
                        <span style={{ color: "var(--border-medium)", fontSize: "0.6em", margin: "0 2px" }}>–</span>
                        {featured.awayScore}
                      </div>
                    ) : (
                      <div>
                        <div
                          className="font-display font-black uppercase tracking-widest"
                          style={{ fontSize: "1.5rem", color: "var(--border-medium)" }}
                        >
                          VS
                        </div>
                        <div className="text-[11px] font-bold mt-1" style={{ color: "var(--text-muted)" }}>
                          {featured.startsAt.toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Away */}
                  <div className="flex-1 text-left">
                    <div
                      className="font-display font-black uppercase leading-tight"
                      style={{ fontSize: "clamp(1rem, 4vw, 1.4rem)", color: "var(--text-primary)" }}
                    >
                      {featured.awayTeam.shortName ?? featured.awayTeam.name}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{ background: "var(--surface-1)", borderTop: "1px solid var(--border-soft)" }}
                >
                  <span className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
                    {featured.startsAt.toLocaleDateString("it-IT", {
                      weekday: "long", day: "numeric", month: "long",
                    })}
                  </span>
                  <span
                    className="text-[11px] font-black uppercase tracking-wide group-hover:underline"
                    style={{ color: "var(--primary)" }}
                  >
                    Dettagli →
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ══ STATS ═════════════════════════════════════════════════ */}
        {(teamCount > 0 || playerCount > 0 || fantasyCount > 0) && (
          <section className="max-w-lg mx-auto w-full px-4 py-4">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#fff", border: "1.5px solid var(--border-medium)", boxShadow: "0 2px 12px rgba(1,7,163,0.06)" }}
            >
              <div className="flex">
                {[
                  { v: teamCount,    label: "Squadre",   show: teamCount > 0 },
                  { v: playerCount,  label: "Giocatori", show: playerCount > 0 },
                  { v: fantasyCount, label: "Fanta",     show: fantasyCount > 0 },
                ].filter(s => s.show).map((s, i, arr) => (
                  <div
                    key={s.label}
                    className="flex-1 text-center py-5"
                    style={i < arr.length - 1 ? { borderRight: "1px solid var(--border-soft)" } : {}}
                  >
                    <div
                      className="font-display font-black leading-none"
                      style={{ fontSize: "clamp(1.8rem, 6vw, 2.5rem)", color: "var(--primary)" }}
                    >
                      {s.v}
                    </div>
                    <div className="over-label mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ QUICK ACTIONS ═════════════════════════════════════════ */}
        <section className="max-w-lg mx-auto w-full px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/classifica",  label: "Classifica",  icon: "pi-trophy",   bg: "rgba(232,160,0,0.10)", color: "#C48A00" },
              { href: "/partite",     label: "Partite",     icon: "pi-calendar", bg: "var(--primary-light)", color: "var(--primary)" },
              { href: "/squadre",     label: "Squadre",     icon: "pi-users",    bg: "var(--primary-light)", color: "var(--primary)" },
              { href: "/regolamento", label: "Regolamento", icon: "pi-book",     bg: "var(--primary-light)", color: "var(--primary)" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3.5 rounded-2xl px-4 py-4 transition-colors hover:bg-[var(--surface-2)]"
                style={{
                  background: "#fff",
                  border: "1.5px solid var(--border-medium)",
                  boxShadow: "0 2px 8px rgba(1,7,163,0.04)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.bg }}
                >
                  <i className={`pi ${item.icon}`} style={{ color: item.color, fontSize: 16 }} />
                </div>
                <span
                  className="font-display font-black text-sm uppercase tracking-wide"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ CTA BOTTOM — solo guest ═══════════════════════════════ */}
        {!user && (
          <section className="max-w-lg mx-auto w-full px-4 py-4 pb-8">
            <div
              className="relative overflow-hidden rounded-3xl px-7 py-9 text-center"
              style={{
                background: "linear-gradient(140deg, #000228 0%, #0107A3 100%)",
                boxShadow: "0 8px 40px rgba(1,7,163,0.28)",
              }}
            >
              {/* Glow */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: "-30%", right: "-10%",
                  width: "60%", height: "160%",
                  background: "radial-gradient(circle, rgba(232,160,0,0.18) 0%, transparent 65%)",
                }}
              />
              <div className="relative">
                <div
                  className="font-display font-black uppercase text-white leading-tight mb-2"
                  style={{ fontSize: "clamp(1.6rem, 6vw, 2.2rem)" }}
                >
                  Pronto a giocare?
                </div>
                <p className="text-sm mb-7 max-w-xs mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Registrati, scegli i tuoi campioni e parti alla conquista della classifica.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full font-display font-black text-base uppercase tracking-wide px-10 py-4"
                  style={{
                    background: "#E8A000",
                    color: "#06073D",
                    boxShadow: "0 6px 24px rgba(232,160,0,0.5)",
                  }}
                >
                  <i className="pi pi-user-plus" style={{ fontSize: 14 }} />
                  Inizia ora
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer
        className="hidden md:block py-5 text-center text-[11px]"
        style={{ borderTop: "1px solid var(--border-soft)", color: "var(--text-disabled)" }}
      >
        Fantadc
      </footer>

      <PublicBottomNav />
    </div>
  );
}
