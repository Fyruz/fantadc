import BackButton from "@/components/back-button";
import Link from "next/link";
import { db } from "@/lib/db";
export const dynamic = 'force-dynamic'


export default async function GironiPublicPage() {
  const groups = await db.group.findMany({
    orderBy: { order: "asc" },
    include: {
      teams: {
        include: {
          footballTeam: {
            select: { id: true, name: true, shortName: true, countryCode: true, logoUrl: true },
          },
        },
      },
      matches: {
        where: { status: "CONCLUDED", homeScore: { not: null }, awayScore: { not: null } },
        select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true },
      },
    },
  });

  type Row = {
    teamId: number;
    name: string;
    shortName: string | null;
    countryCode: string | null;
    logoUrl: string | null;
    qualified: boolean;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDiff: number;
    points: number;
  };

  const groupStandings = groups.map((g) => {
    const map = new Map<number, Row>();
    for (const gt of g.teams) {
      map.set(gt.footballTeamId, {
        teamId: gt.footballTeamId,
        name: gt.footballTeam.name,
        shortName: gt.footballTeam.shortName,
        countryCode: gt.footballTeam.countryCode,
        logoUrl: gt.footballTeam.logoUrl,
        qualified: gt.qualified,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
      });
    }
    for (const m of g.matches) {
      if (!m.homeTeamId || !m.awayTeamId) continue;
      const hs = m.homeScore!;
      const as_ = m.awayScore!;
      const home = map.get(m.homeTeamId);
      const away = map.get(m.awayTeamId);
      if (home) {
        home.played++; home.goalsFor += hs; home.goalsAgainst += as_; home.goalDiff += hs - as_;
        if (hs > as_) { home.won++; home.points += 3; }
        else if (hs === as_) { home.drawn++; home.points += 1; }
        else home.lost++;
      }
      if (away) {
        away.played++; away.goalsFor += as_; away.goalsAgainst += hs; away.goalDiff += as_ - hs;
        if (as_ > hs) { away.won++; away.points += 3; }
        else if (hs === as_) { away.drawn++; away.points += 1; }
        else away.lost++;
      }
    }
    const rows = [...map.values()].sort(
      (a, b) => b.points - a.points || b.goalDiff - a.goalDiff || a.name.localeCompare(b.name, "it")
    );
    return { id: g.id, name: g.name, slug: g.slug, rows };
  });

  if (groups.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <p className="text-sm text-black/40 text-center">Fase a gironi non ancora iniziata.</p>
      </div>
    );
  }

  const cols: { key: keyof Row; label: string }[] = [
    { key: "played",   label: "PG" },
    { key: "won",      label: "V"  },
    { key: "drawn",    label: "N"  },
    { key: "lost",     label: "S"  },
    { key: "goalDiff", label: "DR" },
    { key: "points",   label: "PT" },
  ];

  return (
    <div className="flex flex-col">
      {/* Header mobile */}
      <div className="md:hidden flex items-center justify-between h-12">
        <div className="flex-1 flex items-center">
          <BackButton />
        </div>
        <span
          className="flex-1 text-center uppercase"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          Gironi
        </span>
        <div className="flex-1" />
      </div>

      <div className="flex flex-col gap-6 mt-10 md:mt-0">
      {groupStandings.map((g) => (
        <div
          key={g.id}
          className="bg-white rounded-3xl overflow-hidden pb-3"
          style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
        >
          {/* Card header */}
          <div className="px-6 pt-6 pb-3">
            <h2
              className="uppercase text-base font-medium text-(--text-primary)"
              style={{ fontFamily: "var(--font-tallica)", wordSpacing: "0.3em" }}
            >
              {g.name}
            </h2>
          </div>

          {/* Table header */}
          <div className="flex items-center gap-2 px-6 pb-3">
            <span className="text-xs font-semibold uppercase text-black/40 w-5 shrink-0" />
            <span className="text-xs font-semibold uppercase text-black/40 flex-1">SQUADRA</span>
            {cols.map((c) => (
              <span
                key={c.key}
                className="text-xs font-semibold uppercase text-black/40 w-7 text-center shrink-0"
              >
                {c.label}
              </span>
            ))}
          </div>

          {/* Rows */}
          {g.rows.map((row, idx) => (
            <div
              key={row.teamId}
              className="flex items-center gap-2 px-6 py-3"
              style={{ borderTop: "1px solid rgba(9,20,76,0.05)" }}
            >
              <span className="text-xs text-black/40 w-5 shrink-0 tabular-nums">{idx + 1}</span>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {row.logoUrl ? (
                  <img src={row.logoUrl} alt={row.name} className="w-6 h-6 object-contain shrink-0" />
                ) : row.countryCode ? (
                  <img
                    src={`https://flagcdn.com/w40/${row.countryCode.toLowerCase()}.png`}
                    alt={row.name}
                    className="w-6 h-4 object-contain rounded-sm shrink-0"
                  />
                ) : null}
                <span className="text-sm font-normal text-(--text-primary) truncate">
                  {row.shortName ?? row.name}
                </span>
                {row.qualified && (
                  <span className="text-[9px] font-bold shrink-0" style={{ color: "#10B981" }}>Q</span>
                )}
              </div>
              {cols.map((c, i) => {
                const val = row[c.key] as number;
                const display = c.key === "goalDiff" && val > 0 ? `+${val}` : val;
                const isPoints = c.key === "points";
                return (
                  <span
                    key={c.key}
                    className="text-sm w-7 text-center shrink-0 tabular-nums"
                    style={{
                      color: "var(--text-primary)",
                      fontWeight: isPoints ? 700 : 400,
                    }}
                  >
                    {display}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      ))}
      </div>
    </div>
  );
}
