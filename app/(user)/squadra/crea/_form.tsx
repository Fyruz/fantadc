"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { createFantasyTeam } from "@/app/actions/user/fantasy-teams";
import { getTeamCode, SLOT_ORDER } from "./_types";
import type { Player, PlayerGroup, SlotKey, SlotsState } from "./_types";
import SlotCard from "./_slot-card";
import PlayerSheet from "./_player-sheet";

const SLOT_META: Record<
  SlotKey,
  { label: string; role: Player["role"]; wrapperClassName: string }
> = {
  goalkeeper: {
    label: "Portiere",
    role: "P",
    wrapperClassName: "left-1/2 top-[72%] -translate-x-1/2 -translate-y-1/2",
  },
  topLeft: {
    label: "Giocatore 1",
    role: "A",
    wrapperClassName: "left-[24%] top-[23%] -translate-x-1/2 -translate-y-1/2",
  },
  topRight: {
    label: "Giocatore 2",
    role: "A",
    wrapperClassName: "left-[76%] top-[23%] -translate-x-1/2 -translate-y-1/2",
  },
  bottomLeft: {
    label: "Giocatore 3",
    role: "A",
    wrapperClassName: "left-[24%] top-[49%] -translate-x-1/2 -translate-y-1/2",
  },
  bottomRight: {
    label: "Giocatore 4",
    role: "A",
    wrapperClassName: "left-[76%] top-[49%] -translate-x-1/2 -translate-y-1/2",
  },
};

function createEmptySlots(): SlotsState {
  return {
    goalkeeper: null,
    topLeft: null,
    topRight: null,
    bottomLeft: null,
    bottomRight: null,
  };
}

export default function CreaSquadraForm({ players }: { players: Player[] }) {
  const [state, action, pending] = useActionState(createFantasyTeam, undefined);
  const [slots, setSlots] = useState<SlotsState>(() => createEmptySlots());
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>(null);
  const [menuSlot, setMenuSlot] = useState<SlotKey | null>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const selectedPlayers = useMemo(
    () =>
      SLOT_ORDER.map((k) => slots[k]).filter((p): p is Player => p !== null),
    [slots]
  );
  const selectedIds = useMemo(
    () => selectedPlayers.map((p) => p.id),
    [selectedPlayers]
  );

  const validation = useMemo(() => {
    const gkCount = selectedPlayers.filter((p) => p.role === "P").length;
    const playerCount = selectedPlayers.filter((p) => p.role === "A").length;
    const uniqueTeams = new Set(
      selectedPlayers.map((p) => p.footballTeam.id)
    ).size;
    const captainOk = captainId !== null && selectedIds.includes(captainId);
    return {
      count: selectedIds.length,
      gkOk: gkCount === 1,
      playerOk: playerCount === 4,
      teamsOk: uniqueTeams === selectedIds.length,
      captainOk,
      isValid:
        selectedIds.length === 5 &&
        gkCount === 1 &&
        playerCount === 4 &&
        uniqueTeams === 5 &&
        captainOk &&
        teamName.trim().length >= 1,
    };
  }, [captainId, selectedIds, selectedPlayers, teamName]);

  const activePlayer = activeSlot ? slots[activeSlot] : null;
  const availablePlayers = useMemo(() => {
    if (!activeSlot) return [];
    const currentPlayerId = activePlayer?.id ?? null;
    const usedPlayerIds = new Set(
      selectedPlayers
        .filter((p) => p.id !== currentPlayerId)
        .map((p) => p.id)
    );
    const usedTeamIds = new Set(
      selectedPlayers
        .filter((p) => p.id !== currentPlayerId)
        .map((p) => p.footballTeam.id)
    );
    return players.filter(
      (p) =>
        p.role === SLOT_META[activeSlot].role &&
        !usedPlayerIds.has(p.id) &&
        !usedTeamIds.has(p.footballTeam.id)
    );
  }, [activePlayer?.id, activeSlot, players, selectedPlayers]);

  const availableGroups = useMemo(() => {
    const groups = new Map<number, PlayerGroup>();
    availablePlayers.forEach((p) => {
      const existing = groups.get(p.footballTeam.id);
      if (existing) {
        existing.players.push(p);
        return;
      }
      groups.set(p.footballTeam.id, {
        teamId: p.footballTeam.id,
        teamName: p.footballTeam.name,
        teamCode: getTeamCode(p),
        players: [p],
      });
    });
    return [...groups.values()];
  }, [availablePlayers]);

  const menuPlayer = menuSlot ? slots[menuSlot] : null;
  const menuIsCaptain = menuPlayer ? captainId === menuPlayer.id : false;

  function openSlot(slotKey: SlotKey) {
    if (pending) return;
    setMenuSlot(null);
    setActiveSlot(slotKey);
  }

  function assignPlayerToActiveSlot(player: Player) {
    if (!activeSlot) return;
    const replaced = slots[activeSlot];
    setSlots((prev) => ({ ...prev, [activeSlot]: player }));
    if (
      replaced &&
      replaced.id !== player.id &&
      captainId === replaced.id
    ) {
      setCaptainId(null);
    }
    setActiveSlot(null);
  }

  function clearSlot(slotKey: SlotKey) {
    const player = slots[slotKey];
    if (!player) return;
    setSlots((prev) => ({ ...prev, [slotKey]: null }));
    if (captainId === player.id) setCaptainId(null);
  }

  return (
    <form
      action={action}
      className="flex min-h-[calc(100svh-11rem)] flex-col gap-3 lg:min-h-0"
    >
      {/* Mobile: nome squadra centrato in cima */}
      <div className="flex justify-center lg:hidden">
        <InputText
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full max-w-xs text-center"
          placeholder="es. I Guerrieri"
          maxLength={40}
        />
      </div>

      {/* Campo + sidebar desktop */}
      <div className="flex flex-1 flex-col lg:grid lg:flex-none lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-4">
        {/* Campo di gioco */}
        <div
          className="relative flex-1 overflow-hidden rounded-[28px] border border-white/20 px-4 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] lg:aspect-[5/6] lg:w-full lg:flex-none lg:max-w-[26rem] lg:mx-auto"
          style={{
            background:
              "linear-gradient(180deg, #179B54 0%, #138748 48%, #0D6D38 100%)",
          }}
        >
          {/* Righe del campo */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 42px, transparent 42px, transparent 84px)",
            }}
          />
          <div className="pointer-events-none absolute inset-x-[14%] top-[12%] h-[58%] rounded-[30px] border border-white/30" />
          <div className="pointer-events-none absolute left-1/2 top-[18%] h-[46%] w-[42%] -translate-x-1/2 rounded-[999px] border border-white/25" />
          <div className="pointer-events-none absolute left-1/2 top-[64%] h-[22%] w-[54%] -translate-x-1/2 rounded-t-[22px] border border-b-0 border-white/25" />
          <div className="pointer-events-none absolute left-1/2 top-[64%] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 shadow-[0_0_0_6px_rgba(255,255,255,0.08)]" />

          {/* Slot */}
          {SLOT_ORDER.map((slotKey) => {
            const player = slots[slotKey];
            return (
              <div
                key={slotKey}
                className={`absolute ${SLOT_META[slotKey].wrapperClassName}`}
              >
                <SlotCard
                  slotKey={slotKey}
                  player={player}
                  isCaptain={player !== null && captainId === player.id}
                  pending={pending}
                  onEmptyClick={() => openSlot(slotKey)}
                  onFilledClick={() => {
                    if (!pending) setMenuSlot(slotKey);
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Sidebar desktop */}
        <div className="hidden lg:flex lg:flex-col lg:gap-4">
          <div className="card flex flex-col gap-4 p-4">
            {/* Nome squadra */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Nome squadra *
              </label>
              <InputText
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full"
                placeholder="es. I Guerrieri"
                maxLength={40}
              />
              {state?.success === false && state.errors?.name && (
                <p className="mt-1 text-sm text-red-500">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            {/* Riepilogo slot */}
            <div className="flex flex-col gap-2">
              {SLOT_ORDER.map((slotKey) => (
                <SlotSummaryRow
                  key={slotKey}
                  label={SLOT_META[slotKey].label}
                  player={slots[slotKey]}
                  onSelect={() => openSlot(slotKey)}
                  onClear={() => clearSlot(slotKey)}
                  disabled={pending}
                />
              ))}
            </div>

            {/* Capitano */}
            {selectedPlayers.length > 0 && (
              <div>
                <div className="over-label mb-2">Capitano</div>
                <div className="flex flex-wrap gap-2">
                  {selectedPlayers.map((p) => (
                    <Button
                      key={p.id}
                      type="button"
                      unstyled
                      onClick={() => setCaptainId(p.id)}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                        captainId === p.id
                          ? "border-yellow-400 bg-yellow-400 text-[var(--text-primary)] shadow-[0_4px_12px_rgba(232,160,0,0.25)]"
                          : "border-[var(--border-soft)] bg-white text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
                      }`}
                    >
                      {captainId === p.id ? "★ " : ""}({getTeamCode(p)}){" "}
                      {p.name}
                    </Button>
                  ))}
                </div>
                {state?.success === false && state.errors?.captainPlayerId && (
                  <p className="mt-2 text-sm text-red-500">
                    {state.errors.captainPlayerId[0]}
                  </p>
                )}
              </div>
            )}

            {/* Badge validazione */}
            <div className="flex flex-wrap gap-2">
              <StatusBadge ok={validation.gkOk} label="1 Portiere" />
              <StatusBadge ok={validation.playerOk} label="4 Giocatori" />
              <StatusBadge ok={validation.teamsOk} label="5 squadre diverse" />
              <StatusBadge ok={validation.captainOk} label="Capitano scelto" />
            </div>

            {/* Conferma desktop */}
            <Button
              type="submit"
              label={pending ? "Salvo..." : "Conferma squadra"}
              disabled={!validation.isValid || pending}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Hint capitano mobile — visibile quando tutti gli slot sono pieni ma nessun capitano */}
      {validation.count === 5 && !validation.captainOk && (
        <p className="text-center text-xs text-white/70 lg:hidden">
          Tocca uno slot per scegliere il capitano
        </p>
      )}

      {/* Conferma mobile */}
      <div className="flex justify-center lg:hidden">
        <Button
          type="submit"
          label={pending ? "Salvo..." : "Conferma squadra"}
          disabled={!validation.isValid || pending}
          className="w-56"
        />
      </div>

      {/* Hidden inputs per il form */}
      <input type="hidden" name="name" value={teamName} />
      <input type="hidden" name="captainPlayerId" value={captainId ?? ""} />
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="playerIds" value={id} />
      ))}

      {/* Errore server */}
      {state?.success === false && state.message && (
        <p aria-live="polite" className="text-center text-sm text-red-500">
          {state.message}
        </p>
      )}

      {/* Menu contestuale slot pieno */}
      <Dialog
        visible={menuSlot !== null}
        onHide={() => setMenuSlot(null)}
        header={menuPlayer?.name ?? ""}
        style={{ width: "220px" }}
        modal
        draggable={false}
        resizable={false}
      >
        {menuSlot && menuPlayer && (
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              unstyled
              onClick={() => {
                setCaptainId(menuIsCaptain ? null : menuPlayer.id);
                setMenuSlot(null);
              }}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-amber-800 transition-colors hover:bg-yellow-50"
            >
              <span>★</span>
              <span className="font-semibold">
                {menuIsCaptain ? "Togli capitano" : "Nomina capitano"}
              </span>
            </Button>
            <Button
              type="button"
              unstyled
              onClick={() => openSlot(menuSlot)}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-1)]"
            >
              <span>↔</span>
              <span className="font-semibold">Cambia giocatore</span>
            </Button>
            <Button
              type="button"
              unstyled
              onClick={() => {
                clearSlot(menuSlot);
                setMenuSlot(null);
              }}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-red-500 transition-colors hover:bg-red-50"
            >
              <span>✕</span>
              <span className="font-semibold">Rimuovi</span>
            </Button>
          </div>
        )}
      </Dialog>

      {/* Sheet selezione giocatore */}
      <PlayerSheet
        visible={activeSlot !== null}
        slotLabel={
          activeSlot
            ? `Seleziona ${SLOT_META[activeSlot].label.toLowerCase()}`
            : ""
        }
        availableGroups={availableGroups}
        currentPlayerId={activeSlot ? (slots[activeSlot]?.id ?? null) : null}
        onSelect={assignPlayerToActiveSlot}
        onHide={() => setActiveSlot(null)}
        isMobile={isMobile ?? false}
      />
    </form>
  );
}

function SlotSummaryRow({
  label,
  player,
  onSelect,
  onClear,
  disabled,
}: {
  label: string;
  player: Player | null;
  onSelect: () => void;
  onClear: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-white px-3 py-2.5">
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          {label}
        </div>
        <div className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {player ? `(${getTeamCode(player)}) ${player.name}` : "Slot ancora libero"}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          label={player ? "Cambia" : "Scegli"}
          size="small"
          outlined
          disabled={disabled}
          onClick={onSelect}
        />
        {player && (
          <Button
            type="button"
            icon="pi pi-times"
            text
            rounded
            severity="secondary"
            aria-label={`Svuota ${label}`}
            disabled={disabled}
            onClick={onClear}
          />
        )}
      </div>
    </div>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        ok ? "" : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
      }`}
      style={ok ? { background: "rgba(50,215,75,0.12)", color: "#32D74B" } : undefined}
    >
      {ok ? "✓ " : "○ "}
      {label}
    </span>
  );
}
