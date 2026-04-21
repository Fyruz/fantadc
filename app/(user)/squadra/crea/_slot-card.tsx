"use client";

import { Button } from "primereact/button";
import { getTeamCode } from "./_types";
import type { Player, SlotKey } from "./_types";

const SLOT_LABEL: Record<SlotKey, string> = {
  goalkeeper: "GK",
  topLeft: "G1",
  topRight: "G2",
  bottomLeft: "G3",
  bottomRight: "G4",
};

const baseClass =
  "relative cursor-pointer rounded-[10px] px-3 py-2 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-60";

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
      <Button
        type="button"
        unstyled
        onClick={onEmptyClick}
        disabled={pending}
        aria-label={`Seleziona ${label}`}
        className={`${baseClass} border border-dashed border-white/40 bg-white/[0.12] hover:bg-white/[0.18]`}
        style={{ minWidth: 72 }}
      >
        <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/55">{label}</div>
        <div className="text-[11px] text-white/65">Libero</div>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      unstyled
      onClick={onFilledClick}
      disabled={pending}
      aria-label={`Azioni su ${player.name}`}
      className={`${baseClass} bg-white/90 shadow-[0_3px_10px_rgba(0,0,0,0.18)] hover:bg-white`}
      style={{ minWidth: 72 }}
    >
      {isCaptain && (
        <span className="absolute -right-[7px] -top-[7px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--gold)] text-[9px] font-black text-[var(--text-primary)] shadow-[0_2px_6px_rgba(232,160,0,0.4)]">
          ★
        </span>
      )}
      <div
        className="text-[9px] font-bold uppercase tracking-[1px]"
        style={{ color: "#6466A3" }}
      >
        {getTeamCode(player)}
      </div>
      <div className="text-[13px] font-extrabold leading-tight" style={{ color: "#06073D" }}>
        {player.name}
      </div>
    </Button>
  );
}
