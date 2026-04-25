import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { AUTH_ONBOARDING_PATH } from "@/lib/post-auth";
import { Button } from "primereact/button";

export default async function DashboardStartPage() {
  const user = await requireAuth();
  const userId = Number(user.id);

  const [fantasyTeam, tournamentStats] = await Promise.all([
    db.fantasyTeam.findUnique({
      where: { userId },
      select: { id: true },
    }),
    db.$transaction([
      db.match.count(),
      db.player.count(),
      db.fantasyTeam.count(),
    ]),
  ]);

  if (fantasyTeam) {
    redirect("/dashboard");
  }

  const [matchesCount, playersCount, fantasyTeamsCount] = tournamentStats;
  const displayName = user.name ?? user.email.split("@")[0];

  return (
    <div className="flex flex-col gap-5">
      <section
        className="relative overflow-hidden rounded-[24px] px-5 py-6 sm:px-6"
        style={{
          background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)",
          boxShadow: "0 10px 30px rgba(1,7,163,0.22)",
        }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-12 left-[-2rem] h-36 w-36 rounded-full border border-white/10" />

        <div className="relative flex flex-col gap-5">
          <div className="space-y-2">
            <div className="over-label !text-white/60">Benvenuto</div>
            <h1 className="font-display text-3xl font-black uppercase text-white">
              {displayName.toUpperCase()}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-white/80">
              Sei dentro. Adesso puoi creare la tua squadra fanta oppure dare
              subito un&apos;occhiata all&apos;andamento del torneo.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Partite", value: matchesCount },
              { label: "Giocatori", value: playersCount },
              { label: "Squadre fanta", value: fantasyTeamsCount },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[18px] border px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderColor: "rgba(255,255,255,0.14)",
                }}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                  {item.label}
                </div>
                <div className="mt-1 font-display text-2xl font-black text-white">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="card flex flex-col gap-4 p-5 sm:p-6">
          <div className="space-y-2">
            <div className="over-label">Passo 1</div>
            <h2
              className="font-display text-2xl font-black uppercase"
              style={{ color: "var(--text-primary)" }}
            >
              Crea la tua squadra
            </h2>
            <p className="text-sm leading-6" style={{ color: "var(--text-muted)" }}>
              Scegli 1 portiere, 4 giocatori di movimento e il tuo capitano.
              La rosa resterà bloccata dopo la conferma.
            </p>
          </div>

          <div
            className="rounded-[20px] border px-4 py-4"
            style={{
              background: "linear-gradient(180deg, #179B54 0%, #0D6D38 100%)",
              borderColor: "rgba(1,7,163,0.10)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            <div className="grid grid-cols-5 gap-2">
              {["A", "A", "A", "A", "P"].map((role, index) => (
                <div
                  key={`${role}-${index}`}
                  className="rounded-2xl border px-2 py-3 text-center"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    borderColor: "rgba(255,255,255,0.18)",
                  }}
                >
                  <div className="text-[9px] font-black uppercase tracking-wide text-white/60">
                    Slot
                  </div>
                  <div className="mt-1 font-display text-lg font-black text-white">
                    {role}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link href="/squadra/crea" className="w-full sm:w-auto">
            <Button
              label="Crea la squadra"
              icon="pi pi-arrow-right"
              iconPos="right"
              className="w-full sm:w-auto"
            />
          </Link>
        </div>

        <div className="card flex flex-col gap-4 p-5 sm:p-6">
          <div className="space-y-2">
            <div className="over-label">Nel frattempo</div>
            <h2
              className="font-display text-2xl font-black uppercase"
              style={{ color: "var(--text-primary)" }}
            >
              Guarda il torneo
            </h2>
            <p className="text-sm leading-6" style={{ color: "var(--text-muted)" }}>
              Segui classifica, calendario e stato della competizione prima di
              completare la tua rosa.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              {
                href: "/classifica-torneo",
                icon: "pi pi-chart-line",
                title: "Classifica torneo",
                description: "Controlla subito ranking e andamento della competizione.",
              },
              {
                href: "/partite",
                icon: "pi pi-calendar",
                title: "Calendario partite",
                description: "Rivedi calendario, risultati e prossimi match.",
              },
              {
                href: "/gironi",
                icon: "pi pi-sitemap",
                title: "Gironi e tabellone",
                description: "Esplora gironi, eliminazione diretta e avanzamento.",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-[18px] border px-4 py-4 transition-colors hover:bg-[var(--surface-1)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                style={{ borderColor: "var(--border-soft)" }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(1,7,163,0.08)",
                      color: "var(--primary)",
                    }}
                  >
                    <i className={`pi ${item.icon}`} aria-hidden />
                  </span>
                  <div className="space-y-1">
                    <div
                      className="font-display text-[15px] font-black uppercase"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.title}
                    </div>
                    <p
                      className="text-sm leading-5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <p className="text-xs" style={{ color: "var(--text-disabled)" }}>
            Se cambi idea, puoi sempre tornare qui dalla{" "}
            <Link href={AUTH_ONBOARDING_PATH} className="font-semibold" style={{ color: "var(--primary)" }}>
              tua area personale
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
