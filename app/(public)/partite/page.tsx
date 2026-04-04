import Link from "next/link";
import { db } from "@/lib/db";
import StatusBadge from "@/components/status-badge";

export default async function PartitePublicPage() {
  const matches = await db.match.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { startsAt: "asc" },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
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
              <div className="flex items-center justify-between gap-4 text-center">
                <span
                  className="font-display font-black text-[15px] uppercase flex-1 text-right"
                  style={{ color: "var(--text-primary)" }}
                >
                  {m.homeTeam.name}
                </span>
                <span className="text-[11px] font-bold flex-shrink-0" style={{ color: "var(--text-disabled)" }}>
                  VS
                </span>
                <span
                  className="font-display font-black text-[15px] uppercase flex-1 text-left"
                  style={{ color: "var(--text-primary)" }}
                >
                  {m.awayTeam.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
