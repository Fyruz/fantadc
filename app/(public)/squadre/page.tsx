import { db } from "@/lib/db";

export default async function SquadrePublicPage() {
  const teams = await db.footballTeam.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { players: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Squadre reali</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {teams.map((t) => (
          <div
            key={t.id}
            className="border rounded-xl p-4 flex flex-col items-center text-center gap-2 hover:bg-zinc-50 transition-colors"
          >
            {t.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.logoUrl} alt={t.name} className="w-12 h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: "var(--primary)" }}>
                {t.shortName ?? t.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-sm">{t.name}</span>
            <span className="text-xs text-zinc-400">{t._count.players} giocatori</span>
          </div>
        ))}
        {teams.length === 0 && <p className="col-span-4 text-zinc-400">Nessuna squadra presente.</p>}
      </div>
    </div>
  );
}
