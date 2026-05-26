import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import PublicBottomNav from "@/components/public-bottom-nav";
import PublicNav from "@/components/public-nav";

function MatchTeamLogo({
  name, shortName, countryCode, logoUrl,
}: {
  name: string;
  shortName: string | null;
  countryCode: string | null;
  logoUrl: string | null;
}) {
  const label = (shortName ?? name).slice(0, 2).toUpperCase();
  const wrapClass = "w-12 h-12 p-1 flex justify-center items-center aspect-square shrink-0";
  if (logoUrl) {
    return <img src={logoUrl} alt={name} className={`${wrapClass} object-contain`} />;
  }
  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
        alt={name}
        className={`${wrapClass} object-contain rounded`}
      />
    );
  }
  return (
    <div className={`${wrapClass} rounded-full font-black text-sm text-white bg-primary`}>
      {label}
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const params = await searchParams;
  const accountDeleted = params.deleted === "1";

  const [user, teamCount, playerCount, fantasyCount, upcomingMatches, groups, topScorers] = await Promise.all([
    getCurrentUser(),
    db.footballTeam.count(),
    db.player.count(),
    db.fantasyTeam.count(),
    // Prossime partite programmate
    db.match.findMany({
      where: { status: "SCHEDULED" },
      orderBy: { startsAt: "asc" },
      take: 4,
      include: {
        homeTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
        awayTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
        group: { select: { name: true } },
      },
    }),
    // Gironi — solo se esistono
    db.group.findMany({
      orderBy: { order: "asc" },
      include: {
        teams: {
          include: { footballTeam: { select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true } } },
        },
        matches: {
          where: { status: "CONCLUDED", homeScore: { not: null }, awayScore: { not: null } },
          select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true },
        },
      },
    }),
    // Top marcatori
    db.player.findMany({
      where: { goals: { some: { isOwnGoal: false } } },
      orderBy: { goals: { _count: "desc" } },
      take: 5,
      include: {
        footballTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
        _count: { select: { goals: { where: { isOwnGoal: false } } } },
      },
    }),
  ]);

  // Compute inline standings per group (no DB round-trip needed — data already fetched)
  type GroupRow = { teamId: number; name: string; shortName: string | null; countryCode: string | null; logoUrl: string | null; played: number; goalDiff: number; points: number; qualified: boolean };
  const groupStandings = groups.map((g) => {
    const map = new Map<number, GroupRow>();
    for (const gt of g.teams) {
      map.set(gt.footballTeamId, {
        teamId: gt.footballTeamId,
        name: gt.footballTeam.name,
        shortName: gt.footballTeam.shortName,
        countryCode: gt.footballTeam.countryCode,
        logoUrl: gt.footballTeam.logoUrl,
        played: 0,
        goalDiff: 0,
        points: 0,
        qualified: gt.qualified,
      });
    }
    for (const m of g.matches) {
      if (!m.homeTeamId || !m.awayTeamId) continue;
      const hs = m.homeScore!; const as_ = m.awayScore!;
      const home = map.get(m.homeTeamId); const away = map.get(m.awayTeamId);
      if (home) { home.played++; home.goalDiff += hs - as_; if (hs > as_) home.points += 3; else if (hs === as_) home.points += 1; }
      if (away) { away.played++; away.goalDiff += as_ - hs; if (as_ > hs) away.points += 3; else if (hs === as_) away.points += 1; }
    }
    const rows = [...map.values()].sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || a.name.localeCompare(b.name, "it"));
    return { id: g.id, slug: g.slug, name: g.name, rows };
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F6FF" }}>
      <PublicNav />

      <main className="flex-1 pb-24 md:pb-0">

        {/* ══ TOAST ACCOUNT ELIMINATO ═══════════════════════════════ */}
        {accountDeleted && (
          <div
            className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 w-max max-w-[calc(100vw-2rem)] px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{
              background: "#ECFDF5",
              border: "1.5px solid #A7F3D0",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              zIndex: 9999,
            }}
          >
            <i className="pi pi-check-circle flex-shrink-0" style={{ color: "#059669" }} />
            <p className="text-sm font-semibold whitespace-nowrap" style={{ color: "#065F46" }}>
              Account eliminato con successo.
            </p>
          </div>
        )}

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
            <g stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" fill="none">
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
              DCUP <span style={{ color: "#E8A000" }}>26</span>
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

          {/* Scroll hint — mobile only */}
          <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-1.5 md:hidden pointer-events-none">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.40)" }}>
              Scorri in basso
            </span>
            <i className="pi pi-chevron-down animate-bounce" style={{ color: "rgba(255,255,255,0.40)", fontSize: 13 }} />
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }}>
            <svg viewBox="0 0 1440 56" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 56 }}>
              <path d="M0,56 L0,28 Q360,0 720,28 Q1080,56 1440,28 L1440,56 Z" fill="#F5F6FF" />
            </svg>
          </div>
        </section>

        {/* ══ PROSSIME PARTITE ══════════════════════════════════════ */}
        {upcomingMatches.length > 0 && (
          <section className="max-w-lg mx-auto w-full px-4 my-10">
            <div className="flex items-center justify-between mb-6">
              <div
                className="uppercase text-(--text-primary) text-base leading-[34px] font-medium flex items-center gap-1"
                style={{ fontFamily: "var(--font-tallica)" }}
              >
                <span>Prossime</span>
                <span>partite</span>
              </div>
              <Link
                href="/partite"
                className="inline-flex items-center gap-2 text-xs font-semibold text-(--text-primary)"
              >
                Vedi tutto
                <i className="pi pi-chevron-right" style={{ fontSize: 10 }} />
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {upcomingMatches.filter((m) => m.homeTeam && m.awayTeam).map((m) => (
                <Link key={m.id} href={`/partite/${m.id}`} className="block group">
                  <div
                    className="flex items-center gap-3 p-6 bg-white rounded-3xl transition-shadow group-hover:shadow-md"
                    style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
                  >
                    {/* Home team */}
                    <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
                      <MatchTeamLogo name={m.homeTeam!.name} shortName={m.homeTeam!.shortName} countryCode={m.homeTeam!.countryCode} logoUrl={m.homeTeam!.logoUrl} />
                      <span className="text-xs font-normal leading-normal text-center w-full text-black">
                        {m.homeTeam!.shortName ?? m.homeTeam!.name}
                      </span>
                    </div>

                    {/* Center — girone + orario + data */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      {m.group && (
                        <span className="text-xs font-light text-black/65">
                          {m.group.name}
                        </span>
                      )}
                      <span className="text-base font-semibold leading-6 tabular-nums text-black">
                        {m.startsAt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-xs font-light text-black/65">
                        {m.startsAt.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </span>
                    </div>

                    {/* Away team */}
                    <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
                      <MatchTeamLogo name={m.awayTeam!.name} shortName={m.awayTeam!.shortName} countryCode={m.awayTeam!.countryCode} logoUrl={m.awayTeam!.logoUrl} />
                      <span className="text-xs font-normal leading-normal text-center w-full text-black">
                        {m.awayTeam!.shortName ?? m.awayTeam!.name}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ══ STATS ═════════════════════════════════════════════════ */}
        {/* {(teamCount > 0 || playerCount > 0 || fantasyCount > 0) && (
          <section className="max-w-lg mx-auto w-full px-4 my-10">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#fff", border: "1.5px solid var(--border-medium)", boxShadow: "0 2px 12px rgba(1,7,163,0.06)" }}
            >
              <div className="flex">
                {[
                  { v: teamCount,    label: "Squadre",   show: teamCount > 0 },
                  { v: playerCount,  label: "Giocatori", show: playerCount > 0 },
                  { v: fantasyCount, label: "Fanta Allenatori", show: fantasyCount > 0 },
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
                    <div className="over-label mt-1 px-1 leading-tight whitespace-normal break-words text-center" title={s.label}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )} */}

        {/* ══ GIOCA ═════════════════════════════════════════════════ */}
        <section className="max-w-lg mx-auto w-full px-4">
          <h2
            className="uppercase text-(--text-primary) text-base leading-[34px] font-medium mb-6"
            style={{ fontFamily: "var(--font-tallica)" }}
          >
            Gioca
          </h2>
          <Link
            href="/squadra"
            className="flex flex-col gap-3 bg-white rounded-3xl overflow-hidden p-6"
            style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
          >
            <div className="flex justify-center overflow-hidden" style={{ height: 144 }}>
              <img
                src="/images/fantasy-football-shirt.png"
                alt="Fantasy Football"
                className="h-full object-contain"
              />
            </div>
            <div className="flex flex-col gap-3">
              <p
                className="uppercase text-(--text-primary) text-sm leading-[34px] font-medium"
                style={{ fontFamily: "var(--font-tallica)" }}
              >
                Fantasy Football
              </p>
              <p className="text-sm text-black font-normal max-w-48">
                Gestisci il tuo dream team in Danimarca&apos;s Cup!
              </p>
              <p className="text-sm font-semibold text-black">Gioca al FantaDC</p>
            </div>
          </Link>
        </section>

        {/* ══ GIRONI ════════════════════════════════════════════════ */}
        {groupStandings.length > 0 && (
          <section className="max-w-lg mx-auto px-4 my-10">
            <div className="mx-auto flex items-center justify-between mb-6">
              <h2
                className="uppercase text-base font-medium leading-8.5 text-(--text-primary)"
                style={{ fontFamily: "var(--font-tallica)" }}
              >
                CLASSIFICA
              </h2>
              <Link href="/gironi" className="inline-flex items-center gap-2 text-xs font-semibold text-(--text-primary)">
                Vedi tutto
                <i className="pi pi-chevron-right" style={{ fontSize: 10 }} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {groupStandings.map((g) => (
                <Link
                  key={g.id}
                  href="/gironi"
                  className="block rounded-3xl bg-white overflow-hidden pb-3"
                  style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
                >
                  {/* Card header */}
                  <div className="px-6 pt-6 pb-3">
                    <h3
                      className="uppercase text-sm font-medium text-(--text-primary)"
                      style={{ fontFamily: "var(--font-tallica)" }}
                    >
                      {g.name}
                    </h3>
                  </div>

                  {/* Table header */}
                  <div className="flex items-center gap-4 px-6 pb-3">
                    <span className="text-[10px] font-semibold uppercase text-black/65 w-5 shrink-0">POS</span>
                    <span className="text-[10px] font-semibold uppercase text-black/65 flex-1">SQUADRA</span>
                    <span className="text-[10px] font-semibold uppercase text-black/65 w-6 text-center shrink-0">PG</span>
                    <span className="text-[10px] font-semibold uppercase text-black/65 w-7 text-center shrink-0">DR</span>
                    <span className="text-[10px] font-semibold uppercase text-black/65 w-5 text-right shrink-0">PT</span>
                  </div>

                  {/* Rows */}
                  {g.rows.map((row, idx) => (
                    <div
                      key={row.teamId}
                      className="flex items-center gap-4 px-6"
                      style={{ borderTop: "1px solid rgba(9,20,76,0.05)", paddingTop: 12, paddingBottom: 12 }}
                    >
                      <span className="text-xs text-black w-5 shrink-0 tabular-nums">{idx + 1}</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {row.logoUrl ? (
                          <img src={row.logoUrl} alt={row.name} className="w-6 h-6 object-contain shrink-0" />
                        ) : row.countryCode ? (
                          <img src={`https://flagcdn.com/w40/${row.countryCode.toLowerCase()}.png`} alt={row.name} className="w-6 h-4 object-contain rounded-sm shrink-0" />
                        ) : null}
                        <span className="text-xs font-normal text-(--text-primary) truncate">
                          {row.shortName ?? row.name}
                        </span>
                      </div>
                      <span className="text-xs text-black w-6 text-center shrink-0 tabular-nums">{row.played}</span>
                      <span className="text-xs text-black w-7 text-center shrink-0 tabular-nums">
                        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                      </span>
                      <span className="text-xs font-bold text-(--text-primary) w-5 text-right shrink-0 tabular-nums">{row.points}</span>
                    </div>
                  ))}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ══ MARCATORI ════════════════════════════════════════════ */}
        {topScorers.length > 0 && (
          <section className="max-w-lg mx-auto px-4 pb-10">
            <div
              className="bg-white rounded-3xl overflow-hidden"
              style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
            >
              {/* Card header */}
              <div className="px-6 pt-6 pb-3">
                <h2
                  className="uppercase text-base font-medium leading-8.5 text-(--text-primary)"
                  style={{ fontFamily: "var(--font-tallica)" }}
                >
                  MARCATORI
                </h2>
              </div>

              {/* Table header */}
              <div className="flex items-center px-6 pb-3 gap-4">
                <span className="text-[10px] font-semibold uppercase text-black/65 flex-1">GIOCATORE</span>
                <span className="text-[10px] font-semibold uppercase text-black/65 shrink-0">GOL</span>
              </div>

              {/* Rows */}
              {topScorers.map((player, idx) => (
                <div
                  key={player.id}
                  className="flex items-center gap-4 px-6 py-3"
                  style={{ borderTop: "1px solid rgba(9,20,76,0.05)" }}
                >
                  <span className="text-xs text-black w-4 shrink-0 tabular-nums">{idx + 1}</span>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="shrink-0 flex items-center justify-center p-1" style={{ width: 36, height: 36 }}>
                      {player.footballTeam.logoUrl ? (
                        <img src={player.footballTeam.logoUrl} alt={player.footballTeam.name} className="w-full h-full object-contain" />
                      ) : player.footballTeam.countryCode ? (
                        <img src={`https://flagcdn.com/w40/${player.footballTeam.countryCode.toLowerCase()}.png`} alt={player.footballTeam.name} className="w-full h-auto object-contain rounded-sm" />
                      ) : null}
                    </div>
                    <span className="text-xs font-normal text-black truncate">{player.name}</span>
                  </div>
                  <span className="text-xs font-bold text-black shrink-0 tabular-nums">
                    {player._count.goals}
                  </span>
                </div>
              ))}
              <div className="px-6 py-4" style={{ borderTop: "1px solid rgba(9,20,76,0.05)" }}>
                <Link href="/marcatori" className="inline-flex items-center gap-2 text-xs font-semibold text-(--text-primary)">
                  Vedi classifica completa
                  <i className="pi pi-chevron-right" style={{ fontSize: 10 }} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ══ QUICK ACTIONS ═════════════════════════════════════════ */}
        {/* <section className="max-w-lg mx-auto w-full px-4 py-4">
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
                className="flex items-center gap-2.5 sm:gap-3.5 rounded-2xl px-3 sm:px-4 py-3.5 sm:py-4 transition-colors hover:bg-[var(--surface-2)]"
                style={{
                  background: "#fff",
                  border: "1.5px solid var(--border-medium)",
                  boxShadow: "0 2px 8px rgba(1,7,163,0.04)",
                }}
              >
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.bg }}
                >
                  <i className={`pi ${item.icon}`} style={{ color: item.color, fontSize: 15 }} />
                </div>
                <span
                  className="font-display font-black text-xs sm:text-sm uppercase tracking-wide min-w-0 leading-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </section> */}

      </main>

      <footer
        className="hidden md:block py-5 text-center text-[11px]"
        style={{ borderTop: "1px solid var(--border-soft)", color: "var(--text-disabled)" }}
      >
        <span>Fantadc</span>
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
