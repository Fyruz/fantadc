import BackButton from "@/components/back-button";
import Link from "next/link";
import { db } from "@/lib/db";
import { resolveTeamFlag } from "@/lib/flags";
export const dynamic = 'force-dynamic'


export default async function SquadrePublicPage() {
  const teams = await db.footballTeam.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true },
  });

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center">
          <BackButton />
        </div>

        <h1
          className="flex-1 text-center uppercase text-xl"
          style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
        >
          Squadre
        </h1>

        <div className="flex-1" />
      </div>

      {/* Grid */}
      {teams.length === 0 ? (
        <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>
          Nessuna squadra presente.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-x-5 gap-y-10">
          {teams.map((team) => {
            const flagSrc = resolveTeamFlag(team);
            return (
              <Link
                key={team.id}
                href={`/squadre/${team.id}`}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex items-center justify-center overflow-hidden shrink-0">
                  {flagSrc ? (
                    <img
                      src={flagSrc}
                      alt={team.name}
                      width={56}
                      height={37}
                      className=""
                    />
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
