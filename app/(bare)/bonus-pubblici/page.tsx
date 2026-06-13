import PageHeader from "@/components/page-header";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const CARD: React.CSSProperties = {
  border: "1px solid rgba(9,20,76,0.05)",
  boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)",
};

const BONUS_ICONS: Record<string, string> = {
  // Codici prod
  "1-3 GOAL":                    "/icons/bonus/goal-1-3.svg",
  "4+ GOAL":                     "/icons/bonus/goal-4.svg",
  "ACCESSORIO":                  "/icons/bonus/accesories.svg",
  "AMMONIZIONE":                 "/icons/bonus/yellow-card.svg",
  "AUTOGOAL":                    "/icons/bonus/autogol.svg",
  "CLEAN SHEET":                 "/icons/bonus/clean-sheet.svg",
  "ESPULSIONE":                  "/icons/bonus/red-card.svg",
  "ESULTANZA IMPEGNATA":         "/icons/bonus/celebration.svg",
  "FAN FAVOURITE":               "/icons/bonus/most-voted.svg",
  "GOAL PORTIERE":               "/icons/bonus/goalkeeper-goal.svg",
  "INTERVISTATO":                "/icons/bonus/interviewed.svg",
  "INTERVISTATORE":              "/icons/bonus/who-interviews.svg",
  "LEAST FAVOURITE":             "/icons/bonus/least-voted.svg",
  "MAN OF THE MATCH":            "/icons/bonus/momt.svg",
  "PALLONE AL BAR":              "/icons/bonus/ball-in-the-bar.svg",
  "PALLONE IN GREVE":            "/icons/bonus/ball-in-the-river.svg",
  "PORTIERE 1-5 GOAL SUBITI":    "/icons/bonus/1-5-ball-in-the-net.svg",
  "PORTIERE 6+ GOAL SUBITI":     "/icons/bonus/6-balls-in-the-net.svg",
  "PRIMO GOAL DELLA PARTITA":    "/icons/bonus/first-goal.svg",
  "RIGORE SBAGLIATO":            "/icons/bonus/missed-penalty.svg",
  // Codici locali (dev)
  ACCESSORY_MATCH:               "/icons/bonus/accesories.svg",
  GOAL_1_3:                      "/icons/bonus/goal-1-3.svg",
  GOAL_4_PLUS:                   "/icons/bonus/goal-4.svg",
  GOALKEEPER_GOAL:               "/icons/bonus/goalkeeper-goal.svg",
  SEXY_CELEBRATION:              "/icons/bonus/celebration.svg",
  INTERVIEWED:                   "/icons/bonus/interviewed.svg",
  INTERVIEWER:                   "/icons/bonus/who-interviews.svg",
  MOTM:                          "/icons/bonus/momt.svg",
  FAN_FAVORITE:                  "/icons/bonus/most-voted.svg",
  GOALKEEPER_CONCEDED:           "/icons/bonus/1-5-ball-in-the-net.svg",
  GOALKEEPER_CONCEDED_6P:        "/icons/bonus/6-balls-in-the-net.svg",
  OWN_GOAL:                      "/icons/bonus/autogol.svg",
  FIRST_GOAL:                    "/icons/bonus/first-goal.svg",
  YELLOW_CARD:                   "/icons/bonus/yellow-card.svg",
  RED_CARD:                      "/icons/bonus/red-card.svg",
  LEAST_FAN_FAVORITE:            "/icons/bonus/least-voted.svg",
  BALL_TO_BAR:                   "/icons/bonus/ball-in-the-bar.svg",
  BALL_IN_GREVE:                 "/icons/bonus/ball-in-the-river.svg",
  CLEAN_SHEET:                   "/icons/bonus/clean-sheet.svg",
  PENALTY_MISSED:                "/icons/bonus/missed-penalty.svg",
};

function formatPoints(points: number): string {
  return points > 0 ? `+${points}` : String(points);
}

function BonusCard({ code, name, points }: { code: string; name: string; points: number }) {
  const positive = points >= 0;
  const icon = BONUS_ICONS[code] ?? "/icons/bonus/lock.svg";
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden flex flex-col items-center justify-start gap-4 py-5 px-4"
      style={CARD}
    >
      <img src={icon} alt="" width={64} style={{ height: "auto" }} />
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-medium text-xs" style={{ color: "var(--color-text-primary)" }}>
          {name}
        </p>
        <p className="font-semibold text-sm leading-normal" style={{ color: positive ? "#065F46" : "#991B1B" }}>
          {formatPoints(points)} pt
        </p>
      </div>
    </div>
  );
}

export default async function BonusPubblici() {
  const publicBonuses = await db.bonusType.findMany({
    where: { isSecret: false },
    orderBy: [{ points: "desc" }, { name: "asc" }],
    select: { id: true, code: true, name: true, points: true },
  });

  const rows = publicBonuses.map((b) => ({ id: b.id, code: b.code, name: b.name, points: Number(b.points) }));

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title="Bonus Pubblici" />

      <p className="text-sm text-black text-center leading-5">
        I bonus e i malus sempre visibili che influenzano il punteggio fantasy.
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-center" style={{ color: "rgba(0,0,0,0.55)" }}>
          Nessun bonus pubblico al momento.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {rows.map((b) => (
            <BonusCard key={b.id} code={b.code} name={b.name} points={b.points} />
          ))}
        </div>
      )}
    </div>
  );
}
