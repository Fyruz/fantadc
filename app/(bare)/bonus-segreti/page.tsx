import PageHeader from "@/components/page-header";
import { siteConfig } from "@/lib/site";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const CARD: React.CSSProperties = {
  border: "1px solid rgba(9,20,76,0.05)",
  boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)",
};

function formatPoints(points: number): string {
  return points > 0 ? `+${points}` : String(points);
}

function LockedCard() {
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden flex flex-col items-center justify-center gap-4 p-5"
      style={CARD}
    >
      <img src="/icons/bonus/secret-bonus.svg" alt="" width={64} style={{ height: "auto" }} />
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>???</p>
        <p className="font-semibold text-sm leading-normal" style={{ color: "rgba(0,0,0,0.4)" }}>? pt</p>
      </div>
    </div>
  );
}

function RevealedCard({ name, points }: { name: string; points: number }) {
  const positive = points >= 0;
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden flex flex-col items-center justify-start gap-4 py-5 px-4"
      style={CARD}
    >
      <img src="/icons/bonus/secret-bonus-unlocked.svg" alt="" width={64} style={{ height: "auto" }} />
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-medium text-xs" style={{ color: "var(--color-text-primary)" }}>{name}</p>
        <p className="font-semibold text-sm leading-normal" style={{ color: positive ? "#065F46" : "#991B1B" }}>
          {formatPoints(points)} pt
        </p>
      </div>
    </div>
  );
}

export default async function BonusSegreti() {
  const secretBonuses = await db.bonusType.findMany({
    where: { isSecret: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      points: true,
      _count: { select: { assignments: true } },
    },
  });

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title="Bonus Segreti" />

      <p className="text-sm text-black text-center leading-5">
        Alcuni bonus sono ancora nascosti.
        <br />
        Quando verranno assegnati durante la{" "}
        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
          {siteConfig.name}
        </span>
        , diventeranno visibili a tutti i partecipanti.
      </p>

      {secretBonuses.length === 0 ? (
        <p className="text-sm text-center" style={{ color: "rgba(0,0,0,0.55)" }}>
          Nessun bonus segreto al momento.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {secretBonuses.map((b) =>
            b._count.assignments > 0 ? (
              <RevealedCard key={b.id} name={b.name} points={Number(b.points)} />
            ) : (
              <LockedCard key={b.id} />
            )
          )}
        </div>
      )}
    </div>
  );
}
