"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import type { getPublicVolleyEliminationRounds } from "@/lib/data/public/volley";

type VolleyKnockoutRound = Awaited<ReturnType<typeof getPublicVolleyEliminationRounds>>[number];
type MatchRow = VolleyKnockoutRound["matches"][number];

const CARD_WIDTH = 176;
const FALLBACK_CARD_HEIGHT = 97;
const COL_GAP = 40;
const LINE_COLOR = "rgba(9,20,76,0.12)";

function MatchCard({ m, cardRef }: { m: MatchRow; cardRef?: React.Ref<HTMLDivElement> }) {
  const homeSets = m.sets.filter((s) => s.homePoints > s.awayPoints).length;
  const awaySets = m.sets.filter((s) => s.awayPoints > s.homePoints).length;
  const scored = m.status === "CONCLUDED" && m.sets.length > 0;
  const homeWon = scored && homeSets > awaySets;
  const awayWon = scored && awaySets > homeSets;

  const row = (name: string, sets: number, won: boolean, isLast: boolean) => (
    <div
      className="flex items-center gap-2 p-4"
      style={!isLast ? { borderBottom: "1px solid rgba(9,20,76,0.05)" } : undefined}
    >
      <span
        className="text-xs truncate flex-1"
        style={{ color: "var(--text-primary)", fontWeight: won ? 600 : 400 }}
      >
        {name}
      </span>
      {scored && (
        <span className="text-xs tabular-nums shrink-0" style={{ color: "var(--primary)", fontWeight: won ? 600 : 400 }}>
          {sets}
        </span>
      )}
    </div>
  );

  const card = (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl overflow-hidden h-full"
      style={{ border: "1px solid rgba(9,20,76,0.06)", boxShadow: "0 2px 8px 0 rgba(9,20,76,0.06)" }}
    >
      {row(m.homeTeam.name, homeSets, homeWon, false)}
      {row(m.awayTeam.name, awaySets, awayWon, true)}
    </div>
  );

  return (
    <Link href={`/greenvolley/partite/${m.id}`} className="block h-full transition-opacity hover:opacity-80">
      {card}
    </Link>
  );
}

export default function VolleyKnockoutBracket({ rounds }: { rounds: VolleyKnockoutRound[] }) {
  const probeRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  const populatedRounds: VolleyKnockoutRound[] = [];
  for (const r of rounds) {
    if (r.matches.length === 0) break;
    populatedRounds.push(r);
  }

  useLayoutEffect(() => {
    if (probeRef.current) setMeasuredHeight(probeRef.current.offsetHeight);
  }, [populatedRounds[0]?.matches[0]?.id]);

  if (populatedRounds.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
        Fase ad eliminazione non ancora iniziata.
      </p>
    );
  }

  const CARD_HEIGHT = measuredHeight ?? FALLBACK_CARD_HEIGHT;
  const round0Count = populatedRounds[0].matches.length;
  const height = round0Count * CARD_HEIGHT + Math.max(0, round0Count - 1) * (CARD_HEIGHT / 2);
  const width = populatedRounds.length * CARD_WIDTH + Math.max(0, populatedRounds.length - 1) * COL_GAP;

  const centerY = (matchIdx: number, matchCount: number) => (matchIdx + 0.5) * (height / matchCount);
  const leftX = (roundIdx: number) => roundIdx * (CARD_WIDTH + COL_GAP);

  return (
    <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
      <div style={{ position: "fixed", top: -9999, left: -9999, width: CARD_WIDTH, visibility: "hidden" }} aria-hidden="true">
        <MatchCard m={populatedRounds[0].matches[0]} cardRef={probeRef} />
      </div>
      <div style={{ minWidth: width }}>
        {/* Round headers */}
        <div className="relative mb-3" style={{ width, height: 16 }}>
          {populatedRounds.map((round, r) => (
            <div
              key={round.id}
              className="absolute text-xs text-center truncate"
              style={{ left: leftX(r), width: CARD_WIDTH, color: "rgba(0,0,0,0.4)" }}
            >
              {round.name}
            </div>
          ))}
        </div>

        {/* Bracket tree */}
        <div className="relative" style={{ width, height }}>
          <svg className="absolute inset-0 pointer-events-none" width={width} height={height} style={{ overflow: "visible" }}>
            {populatedRounds.slice(0, -1).map((round, r) => {
              const matchCount = round.matches.length;
              const nextMatchCount = populatedRounds[r + 1].matches.length;
              const rightX = leftX(r) + CARD_WIDTH;
              const midX = rightX + COL_GAP / 2;
              const nextLeftX = leftX(r + 1);

              return (
                <g key={round.id}>
                  {round.matches.map((m, i) => {
                    const y = centerY(i, matchCount);
                    return <line key={m.id} x1={rightX} y1={y} x2={midX} y2={y} stroke={LINE_COLOR} strokeWidth={1.5} />;
                  })}
                  {Array.from({ length: nextMatchCount }).map((_, j) => {
                    const yTop = centerY(2 * j, matchCount);
                    const yBottom = centerY(2 * j + 1, matchCount);
                    const yMid = centerY(j, nextMatchCount);
                    return (
                      <g key={j}>
                        <line x1={midX} y1={yTop} x2={midX} y2={yBottom} stroke={LINE_COLOR} strokeWidth={1.5} />
                        <line x1={midX} y1={yMid} x2={nextLeftX} y2={yMid} stroke={LINE_COLOR} strokeWidth={1.5} />
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {populatedRounds.map((round, r) => {
            const matchCount = round.matches.length;
            return round.matches.map((m, i) => (
              <div
                key={m.id}
                className="absolute"
                style={{ left: leftX(r), top: centerY(i, matchCount) - CARD_HEIGHT / 2, width: CARD_WIDTH, height: CARD_HEIGHT }}
              >
                <MatchCard m={m} />
              </div>
            ));
          })}
        </div>
      </div>
    </div>
  );
}
