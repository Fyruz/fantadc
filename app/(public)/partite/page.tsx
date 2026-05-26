import Link from "next/link";
import { db } from "@/lib/db";

export default async function PartitePublicPage() {
  const matches = await db.match.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { startsAt: "asc" },
    select: {
      id: true, status: true, startsAt: true, homeScore: true, awayScore: true,
      homeSeed: true, awaySeed: true,
      homeTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
      awayTeam: { select: { name: true, shortName: true, countryCode: true, logoUrl: true } },
      group: { select: { name: true, slug: true } },
      knockoutRound: { select: { name: true } },
    },
  });

  // Group by calendar day
  const byDay = new Map<string, typeof matches>();
  for (const m of matches) {
    const key = m.startsAt.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(m);
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <p className="text-sm text-black/40 text-center">Nessuna partita disponibile.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {[...byDay.entries()].map(([day, dayMatches]) => (
        <div key={day} className="flex flex-col gap-6">
          <h2
            className="capitalize text-base font-regular text-(--text-primary)"
          >
            {day}
          </h2>

          <div className="flex flex-col gap-4">
            {dayMatches.map((m) => {
              const scored = m.homeScore !== null && m.awayScore !== null;
              const time = m.startsAt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
              const label = m.group ? m.group.name : (m.knockoutRound?.name ?? null);

              const teamLogo = (team: { name: string; shortName: string | null; countryCode: string | null; logoUrl: string | null } | null) => {
                if (!team) return null;
                if (team.logoUrl) return <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />;
                if (team.countryCode) return <img src={`https://flagcdn.com/w40/${team.countryCode.toLowerCase()}.png`} alt={team.name} className="w-full h-auto object-contain rounded-sm" />;
                return null;
              };

              return (
                <Link
                  key={m.id}
                  href={`/partite/${m.id}`}
                  className="bg-white rounded-3xl overflow-hidden"
                  style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
                >
                  {/* Header */}
                  {label && (
                    <div className="px-6 pt-6 pb-3" style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}>
                      <span className="text-sm text-black font-normal">{label}</span>
                    </div>
                  )}

                  {/* Body */}
                  <div className="flex gap-6 px-6 pt-4 pb-6">
                    {/* Teams + scores */}
                    <div className="flex flex-col gap-3 flex-1 min-w-0" style={{ borderRight: "1px solid rgba(9,20,76,0.05)", paddingRight: 24 }}>
                      {/* Home */}
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 flex items-center justify-center p-1 rounded-full" style={{ width: 32, height: 32 }}>
                          {teamLogo(m.homeTeam)}
                        </div>
                        <span className="text-sm text-black flex-1 truncate">{m.homeTeam?.shortName ?? m.homeTeam?.name ?? m.homeSeed ?? "TBD"}</span>
                        {scored && <span className="text-sm font-semibold text-black shrink-0">{m.homeScore}</span>}
                      </div>
                      {/* Away */}
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 flex items-center justify-center p-1 rounded-full" style={{ width: 32, height: 32 }}>
                          {teamLogo(m.awayTeam)}
                        </div>
                        <span className="text-sm text-black flex-1 truncate">{m.awayTeam?.shortName ?? m.awayTeam?.name ?? m.awaySeed ?? "TBD"}</span>
                        {scored && <span className="text-sm font-semibold text-black shrink-0">{m.awayScore}</span>}
                      </div>
                    </div>

                    {/* Time + link */}
                    <div className="flex flex-col items-center justify-center gap-3 shrink-0">
                      <span className="text-sm text-black">{time}</span>
                      <span className="text-xs font-medium text-black">Vedi i dettagli</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
