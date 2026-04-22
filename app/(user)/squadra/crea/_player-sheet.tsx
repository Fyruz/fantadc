"use client";

import { useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { filterGroups } from "./_types";
import type { Player, PlayerGroup } from "./_types";

const mobilePt = {
  root: { style: { borderRadius: "20px 20px 0 0", overflow: "hidden" } },
  header: { className: "!px-4 !py-0" },
  content: { className: "!px-4 !pt-2 !pb-4" },
};

export default function PlayerSheet({
  visible,
  slotLabel,
  availableGroups,
  currentPlayerId,
  onSelect,
  onHide,
  isMobile,
}: {
  visible: boolean;
  slotLabel: string;
  availableGroups: PlayerGroup[];
  currentPlayerId: number | null;
  onSelect: (player: Player) => void;
  onHide: () => void;
  isMobile: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => filterGroups(availableGroups, search),
    [availableGroups, search]
  );

  const dialogStyle = isMobile
    ? { width: "100%", margin: 0, maxHeight: "75vh" }
    : { width: "min(34rem, 96vw)" };

  function handleHide() {
    onHide();
    setSearch("");
  }

  function handleSelect(player: Player) {
    onSelect(player);
    setSearch("");
  }

  const mobileHeader = (
    <div className="flex flex-col">
      <div className="flex justify-center py-3">
        <div className="h-1 w-9 rounded-full bg-[var(--border-soft)]" />
      </div>
      <div className="pb-3 text-[13px] font-extrabold text-[var(--text-primary)]">
        {slotLabel}
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={handleHide}
      header={isMobile ? mobileHeader : slotLabel}
      closable={!isMobile}
      dismissableMask={isMobile}
      position={isMobile ? "bottom" : "center"}
      style={dialogStyle}
      pt={isMobile ? mobilePt : undefined}
      modal
      draggable={false}
      resizable={false}
    >
      <div className="flex flex-col gap-3">
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per nome o squadra..."
          className="w-full"
        />

        {filtered.length === 0 ? (
          <div className="py-6 text-center text-sm text-[var(--text-muted)]">
            {availableGroups.length === 0
              ? "Nessun giocatore disponibile per questo slot."
              : "Nessun risultato."}
          </div>
        ) : (
          <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto pr-1">
            {filtered.map((group) => (
              <section key={group.teamId}>
                <div className="mb-1 px-1 text-[9px] font-bold uppercase tracking-[2px] text-[var(--text-muted)]">
                  {group.teamName}
                </div>
                <div className="flex flex-col">
                  {group.players.map((player) => (
                    <Button
                      key={player.id}
                      type="button"
                      unstyled
                      onClick={() => handleSelect(player)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                        currentPlayerId === player.id
                          ? "bg-[var(--primary-light)] text-[var(--primary)]"
                          : "text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
                      }`}
                    >
                      <span className="text-sm font-semibold">{player.name}</span>
                      <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        {group.teamCode}
                      </span>
                    </Button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
