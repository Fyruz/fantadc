"use client";

import { useState } from "react";
import Link from "next/link";
import type { MvpMatchDetail, MvpPlayerVote } from "@/lib/data/public/mvp";

const DIVIDER = (
  <div className="w-full" style={{ height: 1, background: "rgba(9,20,76,0.08)" }} />
);

export default function MvpDetailTabs({
  detail,
}: {
  detail: Pick<MvpMatchDetail, "match" | "mvpPlayer" | "mvpBonusPoints" | "homeGoals" | "awayGoals" | "playerVotes">;
}) {
  const [tab, setTab] = useState<"info" | "voti">("info");
  const { match, mvpPlayer, mvpBonusPoints, homeGoals, awayGoals, playerVotes } = detail;
  const hasGoals = homeGoals.length > 0 || awayGoals.length > 0;

  const homePlayers = playerVotes.filter((p) => p.teamSide === "home");
  const awayPlayers = playerVotes.filter((p) => p.teamSide === "away");

  return (
    <>
      {/* Tab bar */}
      <div
        className="flex"
        style={{ borderBottom: "1px solid rgba(9,20,76,0.08)" }}
      >
        {(["info", "voti"] as const).map((t) => {
          const label = t === "info" ? "Info partita" : "Voti";
          const isActive = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="flex-1 py-3 text-sm transition-colors"
              style={{
                color: isActive ? "var(--primary)" : "rgba(0,0,0,0.45)",
                fontWeight: isActive ? 600 : 400,
                borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {tab === "info" ? (
        <div className="flex flex-col gap-10">
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
              <span className="font-medium text-sm text-black">{mvpPlayer.name}</span>
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
                <div className="flex items-center justify-center w-full">
                  <span className="font-normal text-sm text-black">Gol</span>
                </div>
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
      ) : (
        <div className="pb-6">
          {playerVotes.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "rgba(0,0,0,0.45)" }}>
              Nessun voto registrato.
            </p>
          ) : (
            <div className="flex gap-4 items-start">
              <div className="flex-1 min-w-0">
                <TeamSection
                  teamName={match.homeTeamName}
                  flagSrc={match.homeTeamFlagSrc}
                  players={homePlayers}
                />
              </div>
              <div style={{ width: 1, alignSelf: "stretch", background: "rgba(9,20,76,0.08)", flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <TeamSection
                  teamName={match.awayTeamName}
                  flagSrc={match.awayTeamFlagSrc}
                  players={awayPlayers}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function TeamSection({
  teamName,
  flagSrc,
  players,
}: {
  teamName: string;
  flagSrc: string | null;
  players: MvpPlayerVote[];
}) {
  return (
    <div className="flex flex-col">
      {/* Team header */}
      <div className="flex items-center gap-2 mb-1">
        {flagSrc ? (
          <img src={flagSrc} alt={teamName} width={20} height={14} className="object-contain shrink-0" />
        ) : null}
        <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{teamName}</span>
      </div>
      <div
        className="flex flex-col"
        style={{ borderTop: "1px solid rgba(9,20,76,0.08)" }}
      >
        {players.map((player, idx) => (
          <PlayerVoteRow
            key={player.playerId}
            player={player}
            isLast={idx === players.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function PlayerVoteRow({ player, isLast }: { player: MvpPlayerVote; isLast: boolean }) {
  const hasExtras = player.bonuses.length > 0 || player.goals > 0 || player.ownGoals > 0;
  return (
    <div
      className="flex flex-col gap-2 py-3"
      style={!isLast ? { borderBottom: "1px solid rgba(9,20,76,0.06)" } : undefined}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-black truncate flex-1 min-w-0">{player.playerName}</span>
        {player.voteCount > 0 && (
          <div className="flex items-center gap-0.5 shrink-0">
            <img src="/icons/star.svg" alt="" width={10} height={10} />
            <span className="text-[11px] font-medium tabular-nums" style={{ color: "var(--primary)" }}>
              {player.voteCount}
            </span>
          </div>
        )}
      </div>
      {hasExtras && (
        <div className="flex flex-wrap gap-1">
          {player.goals > 0 && (
            <BonusChip label={player.goals === 1 ? "Gol" : `Gol ×${player.goals}`} />
          )}
          {player.ownGoals > 0 && (
            <BonusChip label={player.ownGoals === 1 ? "Autogol" : `Autogol ×${player.ownGoals}`} muted />
          )}
          {player.bonuses.map((b) => (
            <BonusChip
              key={b.name}
              label={b.quantity > 1 ? `${b.name} ×${b.quantity}` : b.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BonusChip({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <span
      className="text-[11px] px-2 py-0.5 rounded-full"
      style={{
        background: muted ? "rgba(0,0,0,0.06)" : "rgba(9,20,76,0.08)",
        color: muted ? "rgba(0,0,0,0.45)" : "var(--primary)",
      }}
    >
      {label}
    </span>
  );
}
