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
      <img src="/icons/bonus/lock.svg" alt="Bonus segreto" width={54} height={64} />
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="uppercase text-sm" style={{ fontFamily: "var(--font-tallica)", color: "#5e6070" }}>
          ???
        </p>
        <p className="text-xs text-black leading-normal">Bonus segreto da scoprire</p>
      </div>
    </div>
  );
}

function RevealedCard({ name, points }: { name: string; points: number }) {
  const positive = points >= 0;
  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col items-center justify-center gap-3 p-5 text-center"
      style={{ ...CARD, background: "#fff", borderColor: "rgba(232,160,0,0.35)" }}
    >
      <span
        className="text-sm font-black px-3 py-1 rounded-full"
        style={{
          background: positive ? "#ECFDF5" : "#FEF2F2",
          color: positive ? "#065F46" : "#991B1B",
        }}
      >
        {formatPoints(points)} pt
      </span>
      <p
        className="uppercase text-sm leading-tight"
        style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
      >
        {name}
      </p>
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
