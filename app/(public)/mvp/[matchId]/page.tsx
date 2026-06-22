import { notFound } from "next/navigation";
import BackButton from "@/components/back-button";
import { getMvpMatchDetail } from "@/lib/data/public/mvp";

export const revalidate = 60;

export default async function MvpDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const detail = await getMvpMatchDetail(Number(matchId));
  if (!detail) notFound();

  const { match, mvpPlayer, mvpBonusPoints, goals } = detail;

  const CARD: React.CSSProperties = {
    background: "#fff",
    border: "1px solid rgba(9,20,76,0.05)",
    boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)",
  };

  const DIVIDER: React.CSSProperties = {
    borderBottom: "1px solid rgba(9,20,76,0.08)",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back button header */}
      <div className="flex items-center h-10">
        <BackButton />
      </div>

      {/* Match card */}
      <div className="rounded-3xl p-6" style={CARD}>
        <div className="flex items-center justify-between gap-4">
          {/* Home team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            {match.homeTeamFlagSrc ? (
              <img src={match.homeTeamFlagSrc} alt={match.homeTeamName} width={52} height={35} className="object-contain" />
            ) : (
              <div
                className="w-13 h-9 rounded flex items-center justify-center"
                style={{ background: "rgba(9,20,76,0.06)" }}
              >
                <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                  {match.homeTeamName.slice(0, 3).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs text-center" style={{ color: "var(--text-primary)" }}>
              {match.homeTeamName}
            </span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {match.homeScore ?? "–"} - {match.awayScore ?? "–"}
            </span>
            <span className="text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>
              Fischio finale
            </span>
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            {match.awayTeamFlagSrc ? (
              <img src={match.awayTeamFlagSrc} alt={match.awayTeamName} width={52} height={35} className="object-contain" />
            ) : (
              <div
                className="w-13 h-9 rounded flex items-center justify-center"
                style={{ background: "rgba(9,20,76,0.06)" }}
              >
                <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                  {match.awayTeamName.slice(0, 3).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs text-center" style={{ color: "var(--text-primary)" }}>
              {match.awayTeamName}
            </span>
          </div>
        </div>
      </div>

      {/* MVP player */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="relative">
          <img
            src="/icons/star.svg"
            alt="MVP"
            width={16}
            height={16}
            className="absolute -top-1 -right-1 z-10"
          />
          <div
            className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center"
            style={{ border: "2px solid rgba(9,20,76,0.12)", background: "rgba(9,20,76,0.04)" }}
          >
            {mvpPlayer.flagSrc ? (
              <img src={mvpPlayer.flagSrc} alt={mvpPlayer.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                {mvpPlayer.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {mvpPlayer.name}
          </span>
          <span className="text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>
            Player of the Match (+{mvpBonusPoints.toFixed(0)}pti)
          </span>
        </div>
      </div>

      {/* Goals section */}
      {goals.length > 0 && (
        <div className="flex flex-col" style={DIVIDER}>
          <div className="pb-4" style={{ borderBottom: "1px solid rgba(9,20,76,0.08)" }}>
            <p className="text-sm font-medium text-center" style={{ color: "var(--text-primary)" }}>
              Gol
            </p>
          </div>
          <div className="flex flex-col py-4 gap-3">
            {goals.map((g, i) => (
              <div key={i} className="flex items-center justify-center gap-2">
                <span className="text-sm" style={{ color: g.isOwnGoal ? "rgba(0,0,0,0.45)" : "var(--text-primary)" }}>
                  {g.scorerName}
                  {g.isOwnGoal && " (aut.)"}
                </span>
                <span className="text-sm">⚽</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Come fare punti */}
      <div className="flex flex-col gap-4 pb-6">
        <p className="text-sm font-medium text-center" style={{ color: "var(--text-primary)" }}>
          Come fare punti
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <i className="pi pi-lock text-sm" style={{ color: "rgba(0,0,0,0.45)" }} />
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>
              Bonus pubblici
            </span>
          </div>
          <div className="flex items-center gap-3">
            <i className="pi pi-lock text-sm" style={{ color: "rgba(0,0,0,0.45)" }} />
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>
              Bonus segreti
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
