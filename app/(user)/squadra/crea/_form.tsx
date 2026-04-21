"use client";

import { useActionState, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { createFantasyTeam } from "@/app/actions/user/fantasy-teams";

type Player = {
  id: number;
  name: string;
  role: "P" | "A";
  footballTeam: { id: number; name: string; shortName: string | null };
};

type SlotKey = "goalkeeper" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
type SlotsState = Record<SlotKey, Player | null>;

type PlayerGroup = {
  teamId: number;
  teamName: string;
  teamCode: string;
  players: Player[];
};

const SLOT_ORDER: SlotKey[] = ["goalkeeper", "topLeft", "topRight", "bottomLeft", "bottomRight"];
const OUTFIELD_SLOTS: SlotKey[] = ["topLeft", "topRight", "bottomLeft", "bottomRight"];

const SLOT_META: Record<
  SlotKey,
  {
    label: string;
    hint: string;
    role: Player["role"];
    wrapperClassName: string;
  }
> = {
  goalkeeper: {
    label: "Portiere",
    hint: "Solo portieri",
    role: "P",
    wrapperClassName: "left-1/2 top-[72%] -translate-x-1/2 -translate-y-1/2",
  },
  topLeft: {
    label: "Giocatore 1",
    hint: "Slot libero",
    role: "A",
    wrapperClassName: "left-[24%] top-[23%] -translate-x-1/2 -translate-y-1/2",
  },
  topRight: {
    label: "Giocatore 2",
    hint: "Slot libero",
    role: "A",
    wrapperClassName: "left-[76%] top-[23%] -translate-x-1/2 -translate-y-1/2",
  },
  bottomLeft: {
    label: "Giocatore 3",
    hint: "Slot libero",
    role: "A",
    wrapperClassName: "left-[24%] top-[49%] -translate-x-1/2 -translate-y-1/2",
  },
  bottomRight: {
    label: "Giocatore 4",
    hint: "Slot libero",
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

function getTeamCode(player: Player) {
  return (player.footballTeam.shortName ?? player.footballTeam.name.slice(0, 3)).toUpperCase();
}

export default function CreaSquadraForm({ players }: { players: Player[] }) {
  const [state, action, pending] = useActionState(createFantasyTeam, undefined);
  const [slots, setSlots] = useState<SlotsState>(() => createEmptySlots());
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>(null);

  const selectedPlayers = useMemo(
    () => SLOT_ORDER.map((slotKey) => slots[slotKey]).filter((player): player is Player => player !== null),
    [slots]
  );
  const selectedIds = useMemo(() => selectedPlayers.map((player) => player.id), [selectedPlayers]);

  const validation = useMemo(() => {
    const gkCount = selectedPlayers.filter((player) => player.role === "P").length;
    const playerCount = selectedPlayers.filter((player) => player.role === "A").length;
    const uniqueTeams = new Set(selectedPlayers.map((player) => player.footballTeam.id)).size;
    const captainOk = captainId !== null && selectedIds.includes(captainId);

    return {
      count: selectedIds.length,
      gkOk: gkCount === 1,
      playerOk: playerCount === 4,
      teamsOk: uniqueTeams === selectedIds.length,
      captainOk,
      nameOk: teamName.trim().length >= 1,
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
      selectedPlayers.filter((player) => player.id !== currentPlayerId).map((player) => player.id)
    );
    const usedTeamIds = new Set(
      selectedPlayers
        .filter((player) => player.id !== currentPlayerId)
        .map((player) => player.footballTeam.id)
    );

    return players.filter(
      (player) =>
        player.role === SLOT_META[activeSlot].role &&
        !usedPlayerIds.has(player.id) &&
        !usedTeamIds.has(player.footballTeam.id)
    );
  }, [activePlayer?.id, activeSlot, players, selectedPlayers]);

  const availableGroups = useMemo(() => {
    const groups = new Map<number, PlayerGroup>();

    availablePlayers.forEach((player) => {
      const existingGroup = groups.get(player.footballTeam.id);
      if (existingGroup) {
        existingGroup.players.push(player);
        return;
      }

      groups.set(player.footballTeam.id, {
        teamId: player.footballTeam.id,
        teamName: player.footballTeam.name,
        teamCode: getTeamCode(player),
        players: [player],
      });
    });

    return [...groups.values()];
  }, [availablePlayers]);

  function openSlot(slotKey: SlotKey) {
    if (pending) return;
    setActiveSlot(slotKey);
  }

  function assignPlayerToActiveSlot(player: Player) {
    if (!activeSlot) return;

    const replacedPlayer = slots[activeSlot];
    setSlots((prev) => ({ ...prev, [activeSlot]: player }));
    if (replacedPlayer && replacedPlayer.id !== player.id && captainId === replacedPlayer.id) {
      setCaptainId(null);
    }
    setActiveSlot(null);
  }

  function clearSlot(slotKey: SlotKey) {
    const player = slots[slotKey];
    if (!player) return;

    setSlots((prev) => ({ ...prev, [slotKey]: null }));
    if (captainId === player.id) {
      setCaptainId(null);
    }
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Nome squadra *
            </label>
            <InputText
              name="name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full max-w-sm"
              placeholder="es. I Guerrieri"
              maxLength={40}
              required
            />
            {state?.success === false && state.errors?.name && (
              <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <StatusBadge ok={validation.gkOk} label="1 Portiere" />
            <StatusBadge ok={validation.playerOk} label="4 Giocatori" />
            <StatusBadge ok={validation.teamsOk} label="5 squadre diverse" />
            <StatusBadge ok={validation.captainOk} label="Capitano scelto" />
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border-soft)] px-4 py-3 sm:px-5">
              <div>
                <div className="over-label mb-1">Campo di gioco</div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Tocca uno slot per scegliere un giocatore compatibile.
                </p>
              </div>
              <div className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-[var(--text-primary)] shadow-sm">
                {validation.count}/5 slot pieni
              </div>
            </div>

            <div className="p-3 sm:p-5">
              <div
                className="relative mx-auto aspect-[5/6] w-full max-w-[26rem] overflow-hidden rounded-[28px] border border-white/20 px-4 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                style={{
                  background:
                    "linear-gradient(180deg, #179B54 0%, #138748 48%, #0D6D38 100%)",
                }}
              >
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

                {SLOT_ORDER.map((slotKey) => {
                  const player = slots[slotKey];
                  const meta = SLOT_META[slotKey];

                  return (
                    <div
                      key={slotKey}
                      className={`absolute flex w-[7.15rem] flex-col items-center gap-1.5 sm:w-32 ${meta.wrapperClassName}`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">
                        {slotKey === "goalkeeper" ? "GK" : "PLAYER"}
                      </span>
                      <Button
                        type="button"
                        unstyled
                        onClick={() => openSlot(slotKey)}
                        disabled={pending}
                        aria-label={player ? `Modifica ${player.name}` : `Seleziona ${meta.label}`}
                        className={`group relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 sm:h-24 sm:w-24 ${
                          player
                            ? "border-white/50 bg-white/20 text-white shadow-[0_10px_28px_rgba(6,7,61,0.28)] hover:bg-white/24"
                            : "border-white/40 bg-white/10 text-white/90 shadow-[0_10px_28px_rgba(6,7,61,0.18)] hover:bg-white/16"
                        } ${pending ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        <span className="absolute inset-[8px] rounded-full border border-white/20" />
                        <i className={`pi ${player ? "pi-user" : "pi-user-plus"} text-[1.6rem] sm:text-[1.8rem]`} />
                        {!player && (
                          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--gold)] text-[var(--text-primary)] shadow-[0_4px_10px_rgba(232,160,0,0.35)]">
                            <i className="pi pi-question text-[10px]" />
                          </span>
                        )}
                        {player && captainId === player.id && (
                          <span className="absolute -top-1 right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--gold)] px-1 text-[10px] font-black text-[var(--text-primary)] shadow-[0_4px_10px_rgba(232,160,0,0.35)]">
                            ★
                          </span>
                        )}
                      </Button>

                      <div className="flex min-h-10 flex-col items-center text-center">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/75">
                          {meta.label}
                        </span>
                        {player ? (
                          <span className="max-w-full text-[11px] font-semibold leading-tight text-white sm:text-xs">
                            ({getTeamCode(player)}) {player.name}
                          </span>
                        ) : (
                          <span className="text-[10px] leading-tight text-white/70">{meta.hint}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="card flex flex-col gap-4 p-4 sm:p-5">
          <div>
            <div className="over-label mb-1">Riepilogo rosa</div>
            <p className="text-sm text-[var(--text-secondary)]">
              1 portiere + 4 giocatori di movimento, tutti da squadre diverse.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <SlotSummaryRow
              label="Portiere"
              player={slots.goalkeeper}
              onSelect={() => openSlot("goalkeeper")}
              onClear={() => clearSlot("goalkeeper")}
              disabled={pending}
            />
            {OUTFIELD_SLOTS.map((slotKey, index) => (
              <SlotSummaryRow
                key={slotKey}
                label={`Giocatore ${index + 1}`}
                player={slots[slotKey]}
                onSelect={() => openSlot(slotKey)}
                onClear={() => clearSlot(slotKey)}
                disabled={pending}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="playerIds" value={id} />
      ))}

      {selectedPlayers.length > 0 && (
        <div className="card p-4 sm:p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="over-label mb-1">Capitano</div>
              <label className="text-sm text-[var(--text-secondary)]">
                Scegli chi raddoppia il punteggio tra i 5 giocatori selezionati.
              </label>
            </div>
            <span className="rounded-full bg-[rgba(232,160,0,0.14)] px-3 py-1 text-[11px] font-semibold text-[var(--warning)]">
              1 scelta obbligatoria
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedPlayers.map((player) => (
              <Button
                key={player.id}
                unstyled
                type="button"
                onClick={() => setCaptainId(player.id)}
                className={`cursor-pointer rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                  captainId === player.id
                    ? "border-yellow-400 bg-yellow-400 text-[var(--text-primary)] shadow-[0_4px_12px_rgba(232,160,0,0.25)]"
                    : "border-[var(--border-soft)] bg-white text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
                }`}
              >
                {captainId === player.id ? "★ " : ""}
                ({getTeamCode(player)}) {player.name}
              </Button>
            ))}
          </div>

          {state?.success === false && state.errors?.captainPlayerId && (
            <p className="mt-2 text-sm text-red-500">{state.errors.captainPlayerId[0]}</p>
          )}
        </div>
      )}

      <input type="hidden" name="captainPlayerId" value={captainId ?? ""} />

      {state?.success === false && state.message && (
        <p aria-live="polite" className="text-sm text-red-500">
          {state.message}
        </p>
      )}

      <div>
        <Button
          type="submit"
          label={pending ? "Salvo..." : "Conferma squadra"}
          disabled={!validation.isValid || pending}
          className="w-full md:w-auto"
        />
        {!validation.isValid && (
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Completa gli slot, scegli il capitano e verifica i vincoli prima di confermare.
          </p>
        )}
      </div>

      <Dialog
        visible={activeSlot !== null}
        onHide={() => setActiveSlot(null)}
        header={activeSlot ? `Seleziona ${SLOT_META[activeSlot].label.toLowerCase()}` : "Seleziona giocatore"}
        style={{ width: "min(34rem, 96vw)" }}
        modal
        draggable={false}
        resizable={false}
      >
        {activeSlot && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-2xl bg-[var(--surface-1)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  Slot attivo
                </div>
                <p className="mt-1 text-sm text-[var(--text-primary)]">
                  {activePlayer
                    ? `Stai modificando (${getTeamCode(activePlayer)}) ${activePlayer.name}`
                    : `Nessun giocatore assegnato a ${SLOT_META[activeSlot].label.toLowerCase()}.`}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Disponibili ora: {availablePlayers.length} giocatori compatibili divisi per squadra.
                </p>
              </div>
              {activePlayer && (
                <Button
                  type="button"
                  label="Svuota slot"
                  severity="secondary"
                  outlined
                  size="small"
                  onClick={() => {
                    clearSlot(activeSlot);
                    setActiveSlot(null);
                  }}
                />
              )}
            </div>

            {availableGroups.length === 0 ? (
              <div className="card p-6 text-center text-sm text-[var(--text-muted)]">
                Nessun giocatore disponibile per questo slot con la rosa attuale.
              </div>
            ) : (
              <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
                {availableGroups.map((group) => (
                  <section key={group.teamId} className="card overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-2.5">
                      <div className="font-display text-sm font-black uppercase text-[var(--text-primary)]">
                        {group.teamName}
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                        {group.teamCode}
                      </span>
                    </div>
                    <div className="flex flex-col p-2">
                      {group.players.map((player) => {
                        const isActiveSelection = activePlayer?.id === player.id;

                        return (
                          <Button
                            key={player.id}
                            type="button"
                            unstyled
                            onClick={() => assignPlayerToActiveSlot(player)}
                            className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-left transition-colors ${
                              isActiveSelection
                                ? "bg-[var(--primary-light)] text-[var(--primary)]"
                                : "text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
                            }`}
                          >
                            <span className="flex flex-col">
                              <span className="text-sm font-semibold">{player.name}</span>
                              <span className="text-xs text-[var(--text-muted)]">
                                {player.role === "P" ? "Portiere" : "Giocatore di movimento"}
                              </span>
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                              {group.teamCode}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}
      </Dialog>
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
