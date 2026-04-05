import Link from "next/link";
import { db } from "@/lib/db";
import StatusBadge from "@/components/status-badge";

export default async function PartitePublicPage() {
  const matches = await db.match.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { startsAt: "asc" },
    include: {
      homeTeam: { select: { name: true, shortName: true } },
      awayTeam: { select: { name: true, shortName: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">Stagione 2025</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          PARTITE
        </h1>
      </div>

      {matches.length === 0 ? (
        <div className="card p-10 text-center over-label">Nessuna partita disponibile.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((m) => (
            <Link
              key={m.id}
              href={`/partite/${m.id}`}
              className="card px-5 py-4 flex flex-col gap-3 hover:bg-[var(--surface-1)] transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={m.status} />
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {m.startsAt.toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-black text-[14px] uppercase flex-1 text-right leading-tight" style={{ color: "var(--text-primary)" }}>
                  {m.homeTeam.shortName ?? m.homeTeam.name}
                </span>
                <span className="font-display font-black text-lg flex-shrink-0 min-w-[4rem] text-center" style={{ color: m.homeScore !== null && m.awayScore !== null ? "var(--text-primary)" : "var(--text-disabled)" }}>
                  {m.homeScore !== null && m.awayScore !== null
                    ? `${m.homeScore}—${m.awayScore}`
                    : "VS"}
                </span>
                <span className="font-display font-black text-[14px] uppercase flex-1 text-left leading-tight" style={{ color: "var(--text-primary)" }}>
                  {m.awayTeam.shortName ?? m.awayTeam.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
