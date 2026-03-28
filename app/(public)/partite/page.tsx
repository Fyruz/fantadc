import Link from "next/link";
import { db } from "@/lib/db";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  SCHEDULED: "Programmata",
  CONCLUDED: "Conclusa",
  PUBLISHED: "Pubblicata",
};

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "badge-draft",
  SCHEDULED: "badge-scheduled",
  CONCLUDED: "badge-concluded",
  PUBLISHED: "badge-published",
};

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
    <div>
      <h1 className="text-2xl font-bold mb-6">Calendario partite</h1>
      {matches.length === 0 && (
        <p className="text-zinc-400">Nessuna partita programmata.</p>
      )}
      <div className="flex flex-col gap-2">
        {matches.map((m) => (
          <Link
            key={m.id}
            href={`/partite/${m.id}`}
            className="flex items-center justify-between border rounded-xl px-4 py-3 hover:bg-zinc-50 transition-colors"
          >
            <div>
              <span className="font-semibold">
                {m.homeTeam.name} <span className="text-zinc-400 font-normal mx-1">vs</span> {m.awayTeam.name}
              </span>
              <p className="text-xs text-zinc-400 mt-0.5">
                {m.startsAt.toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <span className={STATUS_CLASS[m.status] ?? "badge-draft"}>
              {STATUS_LABEL[m.status] ?? m.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
