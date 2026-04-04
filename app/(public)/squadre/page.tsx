import { db } from "@/lib/db";

export default async function SquadrePublicPage() {
  const teams = await db.footballTeam.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { players: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="over-label mb-1">Stagione 2025</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          SQUADRE REALI
        </h1>
      </div>
      {teams.length === 0 && (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessuna squadra presente.
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {teams.map((t) => (
          <div
            key={t.id}
            className="card p-4 flex flex-col items-center text-center gap-2 hover:bg-[var(--surface-1)] transition-colors"
          >
            {t.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.logoUrl} alt={t.name} className="w-12 h-12 object-contain" />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "var(--primary)" }}
              >
                {t.shortName ?? t.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-display font-black text-[13px] uppercase" style={{ color: "var(--text-primary)" }}>{t.name}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t._count.players} giocatori</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
