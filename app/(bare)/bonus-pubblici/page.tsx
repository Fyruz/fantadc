import PageHeader from "@/components/page-header";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const CARD: React.CSSProperties = {
  background: "#fff",
  border: "1px solid rgba(9,20,76,0.05)",
  boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)",
};

const ROW_BORDER: React.CSSProperties = { borderTop: "1px solid rgba(9,20,76,0.05)" };

function formatPoints(points: number): string {
  return points > 0 ? `+${points}` : String(points);
}

function BonusList({ title, rows }: { title: string; rows: { id: number; name: string; points: number }[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="rounded-3xl overflow-hidden" style={CARD}>
      <div className="px-6 pt-6 pb-3">
        <h2
          className="text-base font-medium uppercase"
          style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
        >
          {title}
        </h2>
      </div>
      {rows.map((b) => {
        const positive = b.points >= 0;
        return (
          <div key={b.id} className="flex items-center gap-3 px-6 py-3" style={ROW_BORDER}>
            <span className="flex-1 min-w-0 text-sm text-black truncate">{b.name}</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{
                background: positive ? "#ECFDF5" : "#FEF2F2",
                color: positive ? "#065F46" : "#991B1B",
              }}
            >
              {formatPoints(b.points)} pt
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default async function BonusPubblici() {
  const publicBonuses = await db.bonusType.findMany({
    where: { isSecret: false },
    orderBy: [{ points: "desc" }, { name: "asc" }],
    select: { id: true, name: true, points: true },
  });

  const rows = publicBonuses.map((b) => ({ id: b.id, name: b.name, points: Number(b.points) }));
  const bonus = rows.filter((b) => b.points >= 0);
  const malus = rows.filter((b) => b.points < 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Bonus Pubblici" />

      <p className="text-sm text-black text-center leading-5">
        I bonus e i malus sempre visibili che influenzano il punteggio fantasy.
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-center" style={{ color: "rgba(0,0,0,0.55)" }}>
          Nessun bonus pubblico al momento.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <BonusList title="Bonus" rows={bonus} />
          <BonusList title="Malus" rows={malus} />
        </div>
      )}
    </div>
  );
}
