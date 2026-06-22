import Link from "next/link";
import BackButton from "@/components/back-button";
import { getPublicMvpData } from "@/lib/data/public/mvp";
import { resolveTeamFlag } from "@/lib/flags";

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
    <div className="flex flex-col gap-6 min-h-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center">
          <BackButton />
        </div>
        <span
          className="flex-1 text-center uppercase whitespace-pre"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          {`Player of the  Match`}
        </span>
        <div className="flex-1" />
      </div>

      {/* Phase filter tabs */}
      {data.phases.length > 1 && (
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
                className="shrink-0 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                style={
                  isActive
                    ? { background: "var(--text-primary)", color: "#fff" }
                    : { background: "transparent", color: "rgba(0,0,0,0.45)", border: "1px solid rgba(9,20,76,0.15)" }
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
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((m) => (
            <Link
              key={m.matchId}
              href={`/mvp/${m.matchId}`}
              className="flex flex-col gap-4 items-center justify-center p-6 rounded-3xl"
              style={{
                background: "#0F195A",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 4px 10px 0 rgba(0,0,0,0.4)",
              }}
            >
              {/* Flag with star */}
              <div className="relative">
                <img
                  src="/icons/star.svg"
                  alt="MVP"
                  width={14}
                  height={14}
                  className="absolute z-10"
                  style={{ top: -7, right: -7 }}
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
                    style={{ background: "rgba(255,255,255,0.10)" }}
                  >
                    <span className="text-[9px] font-bold text-white">
                      {m.mvpPlayer.footballTeamName.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + team */}
              <div className="flex flex-col items-center gap-1 w-full">
                <span className="text-xs text-white text-center truncate w-full" style={{ fontWeight: 400 }}>
                  {m.mvpPlayer.name}
                </span>
                <span className="text-center" style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>
                  {m.mvpPlayer.footballTeamName}
                </span>
              </div>

              {/* Score row */}
              <div
                className="flex gap-2 items-center justify-center w-full pt-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="font-semibold text-white" style={{ fontSize: 10 }}>
                  {m.homeShortName}
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>
                  <span className="font-semibold text-white">{m.homeScore ?? "–"}</span>
                  {" - "}
                  {m.awayScore ?? "–"}
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>
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
