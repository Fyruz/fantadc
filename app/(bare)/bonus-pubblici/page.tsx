import PageHeader from "@/components/page-header";
import { getPublicBonusRows } from "@/lib/data/public/bonuses";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const CARD: React.CSSProperties = {
  border: "1px solid rgba(9,20,76,0.05)",
  boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)",
};

const BONUS_ICONS: Record<string, string> = {
  // Codici prod
  "1-3 GOAL": "/icons/bonus/goal-1-3.webp",
  "4+ GOAL": "/icons/bonus/goal-4.webp",
  "ACCESSORIO": "/icons/bonus/accesories.webp",
  "AMMONIZIONE": "/icons/bonus/yellow-card.webp",
  "AUTOGOAL": "/icons/bonus/autogol.webp",
  "CLEAN SHEET": "/icons/bonus/clean-sheet.webp",
  "ESPULSIONE": "/icons/bonus/red-card.webp",
  "ESULTANZA IMPEGNATA": "/icons/bonus/celebration.webp",
  "FAN FAVOURITE": "/icons/bonus/most-voted.webp",
  "MVP": "/icons/bonus/most-voted.webp",
  "GOAL PORTIERE": "/icons/bonus/goalkeeper-goal.webp",
  "INTERVISTATO": "/icons/bonus/interviewed.webp",
  "INTERVISTATORE": "/icons/bonus/who-interviews.webp",
  "LEAST FAVOURITE": "/icons/bonus/least-voted.webp",
  "MAN OF THE MATCH": "/icons/bonus/momt.webp",
  "PALLONE AL BAR": "/icons/bonus/ball-in-the-bar.webp",
  "PALLONE IN GREVE": "/icons/bonus/ball-in-the-river.webp",
  "PORTIERE 1-5 GOAL SUBITI": "/icons/bonus/1-5-ball-in-the-net.webp",
  "PORTIERE 6+ GOAL SUBITI": "/icons/bonus/6-balls-in-the-net.webp",
  "PRIMO GOAL DELLA PARTITA": "/icons/bonus/first-goal.webp",
  "RIGORE SBAGLIATO": "/icons/bonus/missed-penalty.webp",
  // Codici locali (dev)
  ACCESSORY_MATCH: "/icons/bonus/accesories.webp",
  GOAL_1_3: "/icons/bonus/goal-1-3.webp",
  GOAL_4_PLUS: "/icons/bonus/goal-4.webp",
  GOALKEEPER_GOAL: "/icons/bonus/goalkeeper-goal.webp",
  SEXY_CELEBRATION: "/icons/bonus/celebration.webp",
  INTERVIEWED: "/icons/bonus/interviewed.webp",
  INTERVIEWER: "/icons/bonus/who-interviews.webp",
  MOTM: "/icons/bonus/momt.webp",
  FAN_FAVORITE: "/icons/bonus/most-voted.webp",
  GOALKEEPER_CONCEDED: "/icons/bonus/1-5-ball-in-the-net.webp",
  GOALKEEPER_CONCEDED_6P: "/icons/bonus/6-balls-in-the-net.webp",
  OWN_GOAL: "/icons/bonus/autogol.webp",
  FIRST_GOAL: "/icons/bonus/first-goal.webp",
  YELLOW_CARD: "/icons/bonus/yellow-card.webp",
  RED_CARD: "/icons/bonus/red-card.webp",
  LEAST_FAN_FAVORITE: "/icons/bonus/least-voted.webp",
  BALL_TO_BAR: "/icons/bonus/ball-in-the-bar.webp",
  BALL_IN_GREVE: "/icons/bonus/ball-in-the-river.webp",
  CLEAN_SHEET: "/icons/bonus/clean-sheet.webp",
  PENALTY_MISSED: "/icons/bonus/missed-penalty.webp",
};

function formatPoints(points: number): string {
  return points > 0 ? `+${points}` : String(points);
}

function BonusCard({ code, name, points }: { code: string; name: string; points: number }) {
  const positive = points >= 0;
  const icon = BONUS_ICONS[code] ?? "/icons/bonus/secret-bonus-unlocked.webp";
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden flex flex-col items-center justify-start gap-4 py-5 px-4"
      style={CARD}
    >
      <img src={icon} alt="" width={64} height={64} loading="lazy" decoding="async" style={{ height: "auto" }} />
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
  const rows = await getPublicBonusRows();

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
