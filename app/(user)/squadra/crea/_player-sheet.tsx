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

const desktopPt = {
  root: { style: { borderRadius: "22px", overflow: "hidden" } },
  header: {
    className:
      "!px-6 !py-4 !border-b !border-[var(--border-soft)] !bg-[linear-gradient(180deg,#fff_0%,#f8f9ff_100%)]",
  },
  content: { className: "!px-6 !pt-4 !pb-6" },
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

  const totalAvailable = useMemo(
    () =>
      availableGroups.reduce((total, group) => total + group.players.length, 0),
    [availableGroups]
  );

  const filteredCount = useMemo(
    () => filtered.reduce((total, group) => total + group.players.length, 0),
    [filtered]
  );

  const dialogStyle = isMobile
    ? { width: "100%", margin: 0, maxHeight: "75vh" }
    : { width: "min(52rem, 96vw)" };

  function handleHide() {
    onHide();
    setSearch("");
  }

  function handleSelect(player: Player) {
    onSelect(player);
    setSearch("");
  }

  const mobileHeader = (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="text-[13px] font-extrabold text-[var(--text-primary)]">
        {slotLabel}
      </div>
      <Button
        type="button"
        icon="pi pi-times"
        text
        rounded
        severity="secondary"
        aria-label="Chiudi selezione giocatori"
        onClick={handleHide}
      />
    </div>
  );

  const desktopHeader = (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="over-label mb-1">Selezione giocatore</div>
        <div className="font-display text-2xl font-black uppercase leading-none text-[var(--text-primary)]">
          {slotLabel}
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Scegli un giocatore disponibile tra squadre non già presenti in rosa.
        </p>
      </div>
      <Button
        type="button"
        icon="pi pi-times"
        text
        rounded
        severity="secondary"
        aria-label="Chiudi selezione giocatori"
        onClick={handleHide}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={handleHide}
      header={isMobile ? mobileHeader : desktopHeader}
      closable={false}
      dismissableMask
      position={isMobile ? "bottom" : "center"}
      style={dialogStyle}
      pt={isMobile ? mobilePt : desktopPt}
      modal
      draggable={false}
      resizable={false}
      focusOnShow={false}
    >
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="relative">
          <i className="pi pi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]" />
          <InputText
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome o squadra..."
            className="w-full !pl-9"
          />
        </div>

        {!isMobile && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--surface-1)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
              {filteredCount} giocatori
            </span>
            <span className="rounded-full border border-[var(--border-medium)] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
              {filtered.length} squadre
            </span>
            {filteredCount !== totalAvailable && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                filtrati su {totalAvailable}
              </span>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-medium)] bg-[var(--surface-1)] py-8 text-center text-sm text-[var(--text-muted)]">
            {availableGroups.length === 0
              ? "Nessun giocatore disponibile per questo slot."
              : "Nessun risultato."}
          </div>
        ) : isMobile ? (
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
        ) : (
          <div className="grid max-h-[58vh] grid-cols-2 gap-3 overflow-y-auto pr-1">
            {filtered.map((group) => (
              <section
                key={group.teamId}
                className="rounded-2xl border border-[var(--border-medium)] bg-white p-3 shadow-[0_2px_10px_rgba(1,7,163,0.06)]"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[1.8px] text-[var(--text-muted)]">
                      Squadra
                    </div>
                    <div className="truncate text-sm font-extrabold text-[var(--text-primary)]">
                      {group.teamName}
                    </div>
                  </div>
                  <span className="rounded-full bg-[var(--surface-1)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--text-secondary)]">
                    {group.teamCode}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {group.players.map((player) => (
                    <Button
                      key={player.id}
                      type="button"
                      unstyled
                      onClick={() => handleSelect(player)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        currentPlayerId === player.id
                          ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
                          : "border-[var(--border-soft)] bg-white text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
                      }`}
                    >
                      <span className="truncate text-sm font-semibold">{player.name}</span>
                      <i
                        className={`pi ${
                          currentPlayerId === player.id
                            ? "pi-check-circle text-[var(--primary)]"
                            : "pi-chevron-right text-[var(--text-muted)]"
                        } text-xs`}
                      />
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
