import { notFound } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/back-button";
import { getMvpMatchDetail } from "@/lib/data/public/mvp";

export const revalidate = 60;

const DIVIDER = (
  <div className="w-full" style={{ height: 1, background: "rgba(9,20,76,0.08)" }} />
);

export default async function MvpDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const detail = await getMvpMatchDetail(Number(matchId));
  if (!detail) notFound();

  const { match, mvpPlayer, mvpBonusPoints, homeGoals, awayGoals } = detail;
  const hasGoals = homeGoals.length > 0 || awayGoals.length > 0;

  return (
    <div className="flex flex-col gap-10">

      {/* Header */}
      <div className="flex items-center">
        <BackButton />
      </div>

      {/* Score card */}
      <div
        className="rounded-3xl p-6 w-full"
        style={{
          background: "#fff",
          border: "1px solid rgba(9,20,76,0.05)",
          boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)",
        }}
      >
        <div className="flex gap-3 items-center w-full">

          {/* Home team */}
          <div className="flex flex-1 flex-col gap-4 items-center justify-center min-w-0">
            {match.homeTeamFlagSrc ? (
              <img src={match.homeTeamFlagSrc} alt={match.homeTeamName} width={56} height={38} className="object-contain" />
            ) : (
              <div className="w-14 h-10 rounded flex items-center justify-center" style={{ background: "rgba(9,20,76,0.06)" }}>
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
          <div className="flex flex-col items-center justify-center leading-normal shrink-0">
            <span className="font-bold uppercase" style={{ fontSize: 24, color: "#000" }}>
              {match.homeScore ?? "–"} - {match.awayScore ?? "–"}
            </span>
            <span className="font-light" style={{ fontSize: 12, color: "rgba(0,0,0,0.65)" }}>
              Fischio finale
            </span>
          </div>

          {/* Away team */}
          <div className="flex flex-1 flex-col gap-4 items-center justify-center min-w-0">
            {match.awayTeamFlagSrc ? (
              <img src={match.awayTeamFlagSrc} alt={match.awayTeamName} width={56} height={38} className="object-contain" />
            ) : (
              <div className="w-14 h-10 rounded flex items-center justify-center" style={{ background: "rgba(9,20,76,0.06)" }}>
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
      <div className="flex flex-col gap-4 items-center">
        <div className="relative">
          <img src="/icons/star.svg" alt="MVP" width={12} height={12} className="absolute z-10" style={{ top: -6, right: -6 }} />
          {mvpPlayer.flagSrc ? (
            <img src={mvpPlayer.flagSrc} alt={mvpPlayer.name} width={40} height={27} className="object-contain" />
          ) : (
            <div className="w-10 h-7 rounded flex items-center justify-center" style={{ background: "rgba(9,20,76,0.08)" }}>
              <span className="text-[9px] font-bold" style={{ color: "var(--text-primary)" }}>
                {mvpPlayer.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-medium text-sm text-black">
            {mvpPlayer.name}
          </span>
          <span className="font-normal text-xs text-black/75">
            Player of the Match (+{mvpBonusPoints.toFixed(0)}pti)
          </span>
        </div>
      </div>

      {DIVIDER}

      {/* Gol section */}
      {hasGoals && (
        <>
          <div className="flex flex-col gap-6 w-full">
            {/* Title */}
            <div className="flex items-center justify-center w-full">
              <span className="font-normal text-sm text-black">Gol</span>
            </div>

            {/* 3-column: home (right-aligned) | ⚽ | away (left-aligned) */}
            <div className="flex gap-6 items-start justify-center w-full">
              <div className="flex flex-1 flex-col gap-2 items-end min-w-0">
                {homeGoals.map((name, i) => (
                  <span key={i} className="font-normal text-xs text-black">{name}</span>
                ))}
              </div>
              <div className="shrink-0 flex items-start justify-center" style={{ paddingTop: 1 }}>
                <img src="/icons/ball.svg" alt="gol" width={16} height={16} />
              </div>
              <div className="flex flex-1 flex-col gap-2 items-start min-w-0">
                {awayGoals.map((name, i) => (
                  <span key={i} className="font-normal text-xs text-black">{name}</span>
                ))}
              </div>
            </div>
          </div>

          {DIVIDER}
        </>
      )}

      {/* Come fare punti */}
      <div className="flex flex-col gap-6 pb-6 w-full">
        <div className="flex items-center justify-center w-full">
          <span className="font-normal text-sm text-black">Come fare punti</span>
        </div>
        <div className="flex items-center justify-center w-full">
          <div className="flex flex-col gap-3 items-start">
            <Link href="/bonus-pubblici" className="flex gap-3 items-center">
              <img src="/icons/basic-lock.svg" alt="" width={14} height={14} />
              <span className="font-normal text-xs text-black">Bonus pubblici</span>
            </Link>
            <Link href="/bonus-segreti" className="flex gap-3 items-center">
              <img src="/icons/lock.svg" alt="" width={14} height={14} />
              <span className="font-normal text-xs text-black">Bonus segreti</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
