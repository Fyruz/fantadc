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
              <img
                src={match.homeTeamFlagSrc}
                alt={match.homeTeamName}
                width={56}
                height={38}
                className="object-contain"
              />
            ) : (
              <div
                className="w-14 h-10 rounded flex items-center justify-center"
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
          <div className="flex flex-col items-center justify-center leading-normal shrink-0">
            <span className="font-bold uppercase" style={{ fontSize: 24, color: "#000" }}>
              {match.homeScore ?? "–"} - {match.awayScore ?? "–"}
            </span>
            <span className="font-light" style={{ fontSize: 12, color: "rgba(0,0,0,0.65)" }}>
              Fischio finale
            </span>
          </div>

          {/* Away team */}
          <div className="flex flex-1 flex-col gap-3 items-center justify-center min-w-0">
            {match.awayTeamFlagSrc ? (
              <div
                className="flex items-center justify-center rounded-full p-1 bg-white"
                style={{ width: 64, height: 64, border: "1px solid rgba(9,20,76,0.06)" }}
              >
                <img
                  src={match.awayTeamFlagSrc}
                  alt={match.awayTeamName}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            ) : (
              <div
                className="rounded-full flex items-center justify-center"
                style={{ background: "rgba(9,20,76,0.06)", width: 64, height: 64 }}
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
      <div className="flex flex-col gap-4 items-center">
        <div className="relative">
          <img
            src="/icons/star.svg"
            alt="MVP"
            width={14}
            height={14}
            className="absolute z-10"
            style={{ top: -7, right: -7 }}
          />
          {mvpPlayer.flagSrc ? (
            <img
              src={mvpPlayer.flagSrc}
              alt={mvpPlayer.name}
              width={40}
              height={27}
              className="object-contain"
            />
          ) : (
            <div
              className="w-10 h-7 rounded flex items-center justify-center"
              style={{ background: "rgba(9,20,76,0.08)" }}
            >
              <span className="text-[9px] font-bold" style={{ color: "var(--text-primary)" }}>
                {mvpPlayer.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-medium" style={{ fontSize: 14, color: "#000" }}>
            {mvpPlayer.name}
          </span>
          <span className="font-normal" style={{ fontSize: 12, color: "rgba(0,0,0,0.75)" }}>
            Player of the Match (+{mvpBonusPoints.toFixed(0)}pti)
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px" style={{ background: "rgba(9,20,76,0.08)" }} />

      {/* Gol section */}
      {hasGoals && (
        <div className="flex flex-col gap-6 w-full">
          {/* Title */}
          <div className="flex items-center justify-center w-full">
            <span className="font-normal" style={{ fontSize: 14, color: "#000" }}>
              Gol
            </span>
          </div>

          {/* 3-column layout: home scorers | ⚽ | away scorers */}
          <div className="flex gap-6 items-start justify-center w-full">
            {/* Home scorers — right-aligned */}
            <div className="flex flex-1 flex-col gap-2 items-end min-w-0">
              {homeGoals.map((name, i) => (
                <span key={i} className="font-normal" style={{ fontSize: 12, color: "#000" }}>
                  {name}
                </span>
              ))}
            </div>

            {/* Ball icon */}
            <div className="flex flex-col items-center justify-start shrink-0">
              <span style={{ fontSize: 16 }}>⚽</span>
            </div>

            {/* Away scorers — left-aligned */}
            <div className="flex flex-1 flex-col gap-2 items-start min-w-0">
              {awayGoals.map((name, i) => (
                <span key={i} className="font-normal" style={{ fontSize: 12, color: "#000" }}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="w-full h-px" style={{ background: "rgba(9,20,76,0.08)" }} />

      {/* Come fare punti */}
      <div className="flex flex-col gap-6 pb-6 w-full">
        {/* Title */}
        <div className="flex items-center justify-center w-full">
          <span className="font-normal" style={{ fontSize: 14, color: "#000" }}>
            Come fare punti
          </span>
        </div>

        {/* Items — centered */}
        <div className="flex items-center justify-center w-full">
          <div className="flex flex-col gap-3 items-start">
            <div className="flex gap-3 items-center">
              <i className="pi pi-lock shrink-0" style={{ fontSize: 14, color: "rgba(0,0,0,0.45)" }} />
              <span className="font-normal" style={{ fontSize: 12, color: "#000" }}>
                Bonus pubblici
              </span>
            </div>
            <div className="flex gap-3 items-center">
              <i className="pi pi-lock shrink-0" style={{ fontSize: 14, color: "rgba(0,0,0,0.45)" }} />
              <span className="font-normal" style={{ fontSize: 12, color: "#000" }}>
                Bonus segreti
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
