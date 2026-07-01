import Link from "next/link";
import BackButton from "@/components/back-button";
import { getPublicMvpData } from "@/lib/data/public/mvp";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function MvpPage({
  searchParams,
}: {
  searchParams: Promise<{ fase?: string }>;
}) {
  const { fase } = await searchParams;
  const data = await getPublicMvpData();

  // Determine active phase: string "null" = fase in corso, number string = phase id, undefined = first phase
  const activePhaseId: number | null | undefined =
    fase === "current" ? null :
    fase ? Number(fase) :
    data.phases[0]?.id; // default: first phase

  const filtered = data.byMatch.filter((m) => {
    if (activePhaseId === undefined) return true;
    return m.phaseId === activePhaseId;
  });

  return (
    <div className="flex flex-col gap-10 min-h-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center">
          <BackButton />
        </div>
        <span
          className="flex-1 text-center uppercase whitespace-nowrap"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)", wordSpacing: "0.3em" }}
        >
          Player of the Match
        </span>
        <div className="flex-1" />
      </div>

      {/* Phase filter tabs */}
      {data.phases.length > 0 && (
        <div
          className="flex gap-3 overflow-x-auto -mx-4 px-4"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
        >
          {data.phases.map((phase) => {
            const phaseKey = phase.id === null ? "current" : String(phase.id);
            const isActive = phase.id === activePhaseId;
            return (
              <Link
                key={phaseKey}
                href={`/mvp?fase=${phaseKey}`}
                replace
                className="shrink-0 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors"
                style={
                  isActive
                    ? { background: "#09144C", color: "#fff", fontWeight: 500 }
                    : { background: "rgba(9,20,76,0.25)", color: "#fff", fontWeight: 400 }
                }
              >
                {phase.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-center py-10" style={{ color: "rgba(0,0,0,0.45)" }}>
          Nessun MVP per questa fase.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((m) => (
            <Link
              key={m.matchId}
              href={`/mvp/${m.matchId}`}
              className="flex flex-col gap-4 items-center justify-center p-6 rounded-3xl"
              style={{
                background: "#fff",
                border: "1px solid rgba(9,20,76,0.05)",
                boxShadow: "0 4px 5px 0 rgba(9,20,76,0.10)",
              }}
            >
              {/* Flag with star */}
              <div className="relative">
                <img
                  src="/icons/star.svg"
                  alt="MVP"
                  width={12}
                  height={12}
                  className="absolute z-10"
                  style={{ top: -6, right: -6 }}
                />
                {m.mvpPlayer.flagSrc ? (
                  <img
                    src={m.mvpPlayer.flagSrc}
                    alt={m.mvpPlayer.footballTeamName}
                    width={48}
                    height={32}
                    className="object-contain"
                  />
                ) : (
                  <div
                    className="w-12 h-8 rounded flex items-center justify-center"
                    style={{ background: "rgba(9,20,76,0.08)" }}
                  >
                    <span className="text-[9px] font-bold" style={{ color: "var(--text-primary)" }}>
                      {m.mvpPlayer.footballTeamName.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + team */}
              <div className="flex flex-col items-center gap-1 w-full">
                <span className="text-sm text-black text-center truncate w-full font-medium">
                  {m.mvpPlayer.name}
                </span>
                <span className="text-center text-xs" style={{ color: "rgba(0,0,0,0.75)" }}>
                  {m.mvpPlayer.footballTeamName}
                </span>
              </div>

              {/* Score row */}
              <div
                className="flex gap-3 items-center justify-center w-full pt-4"
                style={{ borderTop: "1px solid rgba(9,20,76,0.05)" }}
              >
                <span className={`text-xs${m.mvpTeamSide === "home" ? " font-semibold text-black" : ""}`} style={m.mvpTeamSide !== "home" ? { color: "rgba(0,0,0,0.75)" } : undefined}>
                  {m.homeShortName}
                </span>
                <span className="text-xs" style={{ color: "rgba(0,0,0,0.75)" }}>
                  <span className={m.mvpTeamSide === "home" ? "font-semibold text-black" : ""}>{m.homeScore ?? "–"}</span>
                  {" - "}
                  <span className={m.mvpTeamSide === "away" ? "font-semibold text-black" : ""}>{m.awayScore ?? "–"}</span>
                </span>
                <span className={`text-xs${m.mvpTeamSide === "away" ? " font-semibold text-black" : ""}`} style={m.mvpTeamSide !== "away" ? { color: "rgba(0,0,0,0.75)" } : undefined}>
                  {m.awayShortName}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
