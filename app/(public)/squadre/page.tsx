import { db } from "@/lib/db";

export default async function SquadrePublicPage() {
  const teams = await db.footballTeam.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { players: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Squadre reali</h1>
      {teams.length === 0 && (
        <div className="admin-card p-8 text-center text-[#6B7280] text-sm">
          Nessuna squadra presente.
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {teams.map((t) => (
          <div
            key={t.id}
            className="admin-card p-4 flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-px transition-all duration-150"
          >
            {t.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.logoUrl} alt={t.name} className="w-12 h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#0107A3] flex items-center justify-center text-white font-bold text-sm">
                {t.shortName ?? t.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-sm text-[#111827]">{t.name}</span>
            <span className="text-xs text-[#6B7280]">{t._count.players} giocatori</span>
          </div>
        ))}
      </div>
    </div>
  );
}
