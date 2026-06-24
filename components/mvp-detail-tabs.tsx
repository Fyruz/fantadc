"use client";

import { useState } from "react";
import Link from "next/link";
import type { MvpMatchDetail, MvpPlayerVote } from "@/lib/data/public/mvp";

const DIVIDER = (
  <div className="w-full" style={{ height: 1, background: "rgba(9,20,76,0.08)" }} />
);

export default function MvpDetailTabs({
  detail,
  captainPlayerId,
  rosterPlayerIds,
}: {
  detail: Pick<MvpMatchDetail, "match" | "mvpPlayer" | "mvpBonusPoints" | "homeGoals" | "awayGoals" | "playerVotes">;
  captainPlayerId: number | null;
  rosterPlayerIds: number[];
}) {
  const [tab, setTab] = useState<"info" | "punteggi">("info");
  const { match, mvpPlayer, mvpBonusPoints, homeGoals, awayGoals, playerVotes } = detail;
  const rosterSet = new Set(rosterPlayerIds);
  const hasGoals = homeGoals.length > 0 || awayGoals.length > 0;

  const homePlayers = playerVotes.filter((p) => p.teamSide === "home");
  const awayPlayers = playerVotes.filter((p) => p.teamSide === "away");

  return (
    <>
      {/* Tab bar */}
      <div className="flex" style={{ borderBottom: "1px solid rgba(9,20,76,0.08)" }}>
        {(["info", "punteggi"] as const).map((t) => {
          const label = t === "info" ? "Info Partita" : "Punteggi";
          const isActive = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="flex-1 py-3 text-sm transition-colors"
              style={{
                color: isActive ? "#09144C" : "rgba(0,0,0,0.45)",
                fontWeight: isActive ? 600 : 400,
                borderBottom: isActive ? "2px solid #09144C" : "2px solid transparent",
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
        <div className="flex flex-col gap-8 pb-6">
          {playerVotes.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "rgba(0,0,0,0.45)" }}>
              Nessun dato disponibile.
            </p>
          ) : (
            <>
              {homePlayers.length > 0 && (
                <TeamSection
                  teamName={match.homeTeamName}
                  flagSrc={match.homeTeamFlagSrc}
                  players={homePlayers}
                  captainPlayerId={captainPlayerId}
                  rosterSet={rosterSet}
                />
              )}
              {awayPlayers.length > 0 && (
                <TeamSection
                  teamName={match.awayTeamName}
                  flagSrc={match.awayTeamFlagSrc}
                  players={awayPlayers}
                  captainPlayerId={captainPlayerId}
                  rosterSet={rosterSet}
                />
              )}
            </>
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
  captainPlayerId,
  rosterSet,
}: {
  teamName: string;
  flagSrc: string | null;
  players: MvpPlayerVote[];
  captainPlayerId: number | null;
  rosterSet: Set<number>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {flagSrc ? (
          <img src={flagSrc} alt={teamName} width={24} height={16} className="object-contain shrink-0" />
        ) : null}
        <span className="text-sm font-medium text-black">{teamName}</span>
      </div>
      <div className="flex flex-col">
        {players.map((player) => (
          <PlayerRow
            key={player.playerId}
            player={player}
            isCaptain={player.playerId === captainPlayerId}
            inRoster={rosterSet.has(player.playerId)}
          />
        ))}
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  isCaptain,
  inRoster,
}: {
  player: MvpPlayerVote;
  isCaptain: boolean;
  inRoster: boolean;
}) {
  const hasBonuses = player.bonuses.length > 0 || player.isMvp;
  const pts = player.totalPoints;
  const ptsStr = Number.isInteger(pts) ? String(pts) : pts.toFixed(1);

  return (
    <div className="flex flex-col">
      <div style={{ height: 1, background: "rgba(9,20,76,0.08)" }} />
      <div className="flex items-center gap-3 py-4">
        {/* Left: name + bonus chips */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs text-black${inRoster ? " font-semibold" : ""}`}>{player.playerName}</span>
            {isCaptain && (
              <img src="/icons/star.svg" alt="Capitano" width={12} height={12} className="shrink-0" />
            )}
          </div>
          {hasBonuses && (
            <div className="flex flex-wrap gap-1">
              {player.isMvp && (
                <span
                  className="text-[8px] font-medium uppercase px-1 py-0.5 rounded-full"
                  style={{ background: "#fefce8", border: "1px solid #fefce8", color: "#a65f00" }}
                >
                  MVP
                </span>
              )}
              {player.bonuses.map((b) => {
                const sign = b.points >= 0 ? "+" : "";
                const label = b.quantity > 1 ? `${b.name} x${b.quantity}` : b.name;
                return (
                  <span
                    key={b.name}
                    className="flex items-center gap-1 text-[8px] uppercase px-1 py-0.5 rounded-full"
                    style={{ border: "1px solid rgba(9,20,76,0.06)" }}
                  >
                    <span style={{ color: "rgba(0,0,0,0.75)" }}>{label}</span>
                    <span className="font-semibold text-black">{sign}{b.points.toFixed(1)}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
        {/* Right: total points — centrato verticalmente grazie a items-center sul parent */}
        <span className={`text-xs text-black shrink-0 tabular-nums${inRoster ? " font-semibold" : ""}`}>{ptsStr}</span>
      </div>
    </div>
  );
}
