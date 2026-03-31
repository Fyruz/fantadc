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
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Calendario partite</h1>
      {matches.length === 0 ? (
        <div className="admin-card p-8 text-center text-[#6B7280] text-sm">
          Nessuna partita disponibile.
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          {matches.map((m, index) => (
            <Link
              key={m.id}
              href={`/partite/${m.id}`}
              className={`flex items-center justify-between px-4 py-3 hover:bg-[#F0F1FC] transition-colors ${
                index < matches.length - 1 ? "border-b border-[#F3F4F6]" : ""
              }`}
            >
              <div>
                <p className="font-medium text-sm text-[#111827]">
                  {m.homeTeam.name} <span className="text-[#9CA3AF] font-normal">vs</span> {m.awayTeam.name}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {m.startsAt.toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <StatusBadge status={m.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
