"use client";

import { resolveTeamFlag, resolveTeamKit } from "@/lib/flags";
import type { Player, SlotKey } from "./_types";

const SLOT_LABEL: Record<SlotKey, string> = {
  goalkeeper: "Portiere",
  topLeft: "Giocatore 1",
  topRight: "Giocatore 2",
  bottomLeft: "Giocatore 3",
  bottomRight: "Giocatore 4",
};

export default function SlotCard({
  slotKey,
  player,
  isCaptain,
  pending,
  onEmptyClick,
  onFilledClick,
}: {
  slotKey: SlotKey;
  player: Player | null;
  isCaptain: boolean;
  pending: boolean;
  onEmptyClick: () => void;
  onFilledClick: () => void;
}) {
  const label = SLOT_LABEL[slotKey];

  if (!player) {
    return (
      <button
        type="button"
        onClick={onEmptyClick}
        disabled={pending}
        aria-label={`Seleziona ${label}`}
        className="flex flex-col items-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.12)", border: "2px dashed rgba(255,255,255,0.45)" }}
        >
          <i className="pi pi-plus text-white/60 text-base" />
        </div>
        <div
          className="flex items-center justify-center px-2 mt-0.5"
          style={{ background: "rgba(9,20,76,0.55)", width: 90, minHeight: 22 }}
        >
          <span className="text-white/75 text-[11px] font-medium truncate">{label}</span>
        </div>
      </button>
    );
  }

  const flagSrc = resolveTeamFlag(player.footballTeam);
  const kitSrc = resolveTeamKit(player.footballTeam);
  const parts = player.name.trim().split(/\s+/);
  const shortName = parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(" ")}` : player.name;

  return (
    <button
      type="button"
      onClick={onFilledClick}
      disabled={pending}
      aria-label={`Azioni su ${player.name}`}
      className="flex flex-col items-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="relative">
        {isCaptain && (
          <img
            src="/icons/star.svg"
            alt="Capitano"
            width={12}
            height={12}
            className="absolute -top-1 -right-1 z-10"
          />
        )}
        {kitSrc ? (
          <img src={kitSrc} alt={player.footballTeam.name} width={56} height={56} className="object-contain" />
        ) : (
          <div
            className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.35)" }}
          >
            {flagSrc ? (
              <img src={flagSrc} alt={player.footballTeam.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">
                {(player.footballTeam.shortName ?? player.footballTeam.name).slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>
      <div
        className="flex items-center justify-center px-2"
        style={{ background: "#09144C", width: 90, minHeight: 22 }}
      >
        <span className="text-white text-[11px] font-medium truncate">{shortName}</span>
      </div>
    </button>
  );
}
