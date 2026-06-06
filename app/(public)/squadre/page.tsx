import BackButton from "@/components/back-button";
import Link from "next/link";
import { db } from "@/lib/db";
import { getFlagUrlFromCountryCode } from "@/lib/flags";
export const dynamic = 'force-dynamic'


export default async function SquadrePublicPage() {
  const teams = await db.footballTeam.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true },
  });

  return (
    <div className="flex flex-col gap-10">
      {/* Header mobile — hidden on desktop (global nav handles it) */}
      <div className="md:hidden flex items-center justify-between h-12">
        <div className="flex-1 flex items-center">
          <BackButton />
        </div>
        <span
          className="flex-1 text-center uppercase"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          Squadre
        </span>
        <div className="flex-1" />
      </div>

      {/* Grid */}
      {teams.length === 0 ? (
        <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>
          Nessuna squadra presente.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-x-6 gap-y-10">
          {teams.map((team) => {
            const flagSrc = team.logoUrl ?? getFlagUrlFromCountryCode(team.countryCode);
            return (
              <Link
                key={team.id}
                href={`/squadre/${team.id}`}
                className="flex flex-col items-center gap-3 transition-colors hover:bg-[var(--surface-1)]"
              >
                <div className="w-16 h-16 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {flagSrc ? (
                    <img src={flagSrc} alt={team.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs font-black uppercase" style={{ color: "var(--primary)" }}>
                      {(team.shortName ?? team.name).slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm text-center text-black w-full line-clamp-2">
                  {team.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
