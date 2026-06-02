"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { createFantasyTeam } from "@/app/actions/user/fantasy-teams";
import { getTeamCode, SLOT_ORDER } from "./_types";
import type { Player, PlayerGroup, SlotKey, SlotsState } from "./_types";
import SlotCard from "./_slot-card";
import PlayerSheet from "./_player-sheet";
import ShareStoryButton from "../_share-story-button";

type Validation = {
  count: number;
  gkOk: boolean;
  playerOk: boolean;
  teamsOk: boolean;
  captainOk: boolean;
  isValid: boolean;
};

function getMobileHint(v: Validation, teamName: string): string | null {
  if (v.isValid || v.count === 0) return null;
  if (v.count < 5) {
    const rem = 5 - v.count;
    return `Seleziona ancora ${rem} ${rem === 1 ? "giocatore" : "giocatori"}`;
  }
  if (!v.teamsOk) return "I giocatori devono essere di 5 squadre diverse";
  if (!teamName.trim()) return "Inserisci il nome della squadra";
  if (!v.captainOk) return "Tocca uno slot per scegliere il capitano";
  return null;
}

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
  const router = useRouter();
  const [state, action, pending] = useActionState(createFantasyTeam, undefined);
  const [slots, setSlots] = useState<SlotsState>(() => createEmptySlots());
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>(null);
  const [menuSlot, setMenuSlot] = useState<SlotKey | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(max-width: 1023px)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (state?.success === true) {
      setShareVisible(true);
    }
  }, [state]);

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
      teamsOk: uniqueTeams === 5 && selectedIds.length === 5,
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

  function handleConfermaClick() {
    if (!validation.isValid || pending) return;
    setConfirmVisible(true);
  }

  function handleConfirm() {
    setConfirmVisible(false);
    formRef.current?.requestSubmit();
  }

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
      ref={formRef}
      action={action}
      className="flex min-h-[calc(100svh-11rem)] flex-col gap-3 lg:min-h-0"
    >
      {/* Mobile: nome squadra + link regole */}
      <div className="flex flex-col items-center gap-1.5 lg:hidden">
        <InputText
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full max-w-xs text-center"
          placeholder="Inserisci il nome della tua squadra"
          maxLength={40}
        />
        <button
          type="button"
          onClick={() => setRulesVisible(true)}
          className="flex items-center gap-1 text-center text-[10px] font-semibold transition-colors hover:text-[var(--primary)]"
          style={{ color: "var(--text-muted)", textDecoration: "underline dotted", textUnderlineOffset: "3px" }}
        >
          <i className="pi pi-info-circle text-[10px]" />
          Come funziona il Fanta
        </button>
      </div>

      {/* Campo + sidebar desktop */}
      <div className="flex flex-1 flex-col lg:grid lg:flex-none lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-4">
        {/* Campo di gioco */}
        <div
          className="relative flex-1 overflow-hidden rounded-[32px] lg:aspect-[5/6] lg:w-full lg:flex-none lg:max-w-[26rem] lg:mx-auto"
          style={{
            background: "linear-gradient(175deg, #21c05a 0%, #17964a 35%, #116e35 70%, #0c5529 100%)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          {/* Strisce erba alternate */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(180deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 46px, rgba(0,0,0,0.05) 46px, rgba(0,0,0,0.05) 92px)",
            }}
          />

          {/* Segni del campo SVG */}
          <svg
            className="pointer-events-none absolute inset-0 w-full h-full"
            viewBox="0 0 100 120"
            preserveAspectRatio="none"
            fill="none"
          >
            {/* Bordo campo */}
            <rect x="4" y="3" width="92" height="114" stroke="rgba(255,255,255,0.45)" strokeWidth="0.65" />
            {/* Linea di metà campo (in alto = lato avversario) */}
            <line x1="4" y1="3" x2="96" y2="3" stroke="rgba(255,255,255,0.45)" strokeWidth="0.65" />
            {/* Semicerchio centrocampo (arco visibile nella nostra metà) */}
            <path d="M 36 3 A 14 14 0 0 0 64 3" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" fill="none" />
            {/* Pallino centrocampo */}
            <circle cx="50" cy="3" r="1.1" fill="rgba(255,255,255,0.5)" />

            {/* Area di rigore (grande) */}
            <rect x="20" y="67" width="60" height="34" stroke="rgba(255,255,255,0.5)" strokeWidth="0.65" />
            {/* Arco dell'area */}
            <path d="M 26 67 A 13.5 13.5 0 0 1 74 67" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" fill="none" />
            {/* Dischetto del rigore */}
            <circle cx="50" cy="78" r="1.1" fill="rgba(255,255,255,0.6)" />

            {/* Piccola area */}
            <rect x="34" y="88" width="32" height="13" stroke="rgba(255,255,255,0.38)" strokeWidth="0.55" />

            {/* Porta */}
            <rect x="37" y="101" width="26" height="16" fill="rgba(0,0,0,0.12)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.75" />
            {/* Rete porta - linee orizzontali */}
            <line x1="37" y1="105" x2="63" y2="105" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />
            <line x1="37" y1="109" x2="63" y2="109" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />
            <line x1="37" y1="113" x2="63" y2="113" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />
            {/* Rete porta - linee verticali */}
            <line x1="42.5" y1="101" x2="42.5" y2="117" stroke="rgba(255,255,255,0.13)" strokeWidth="0.35" />
            <line x1="48" y1="101" x2="48" y2="117" stroke="rgba(255,255,255,0.13)" strokeWidth="0.35" />
            <line x1="53.5" y1="101" x2="53.5" y2="117" stroke="rgba(255,255,255,0.13)" strokeWidth="0.35" />
            <line x1="59" y1="101" x2="59" y2="117" stroke="rgba(255,255,255,0.13)" strokeWidth="0.35" />
          </svg>

          {/* Vignette per profondità */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[32px]"
            style={{
              background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.18) 100%)",
            }}
          />

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
                placeholder="Inserisci il nome della tua squadra"
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
              type="button"
              label={pending ? "Salvo..." : "Conferma squadra"}
              disabled={!validation.isValid || pending}
              className="w-full"
              onClick={handleConfermaClick}
            />
          </div>
        </div>
      </div>

      {/* Hint validazione mobile — progressivo */}
      {getMobileHint(validation, teamName) && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 lg:hidden">
          <i className="pi pi-info-circle shrink-0 text-sm text-amber-600" />
          <p className="text-[12px] font-medium text-amber-800">
            {getMobileHint(validation, teamName)}
          </p>
        </div>
      )}

      {/* Errori server mobile */}
      {state?.success === false && (
        <div aria-live="polite" className="flex flex-col items-center gap-0.5 lg:hidden">
          {state.message && (
            <p className="text-[11px] font-medium text-red-500">{state.message}</p>
          )}
          {state.errors?.name && (
            <p className="text-[11px] font-medium text-red-500">{state.errors.name[0]}</p>
          )}
          {state.errors?.captainPlayerId && (
            <p className="text-[11px] font-medium text-red-500">{state.errors.captainPlayerId[0]}</p>
          )}
        </div>
      )}

      {/* Conferma mobile */}
      <div className="flex justify-center lg:hidden">
        <Button
          type="button"
          label={pending ? "Salvo..." : "Conferma squadra"}
          disabled={!validation.isValid || pending}
          className="w-56"
          onClick={handleConfermaClick}
        />
      </div>

      {/* Hidden inputs per il form */}
      <input type="hidden" name="name" value={teamName} />
      <input type="hidden" name="captainPlayerId" value={captainId ?? ""} />
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="playerIds" value={id} />
      ))}

      {/* Dialog conferma squadra */}
      <Dialog
        visible={confirmVisible}
        onHide={() => setConfirmVisible(false)}
        closable={false}
        dismissableMask
        style={{ width: "300px" }}
        pt={{
          root: { style: { borderRadius: "16px", overflow: "hidden" } },
          header: { className: "!hidden" },
          content: { className: "!p-0" },
        }}
        modal
        draggable={false}
        resizable={false}
      >
        <div className="p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
              <i className="pi pi-exclamation-triangle text-lg text-amber-600" />
            </div>
            <div className="text-base font-bold text-[var(--text-primary)]">
              Conferma squadra
            </div>
          </div>
          <p className="mb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
            Una volta confermata, la tua squadra{" "}
            <strong className="text-[var(--text-primary)]">
              non potrà più essere modificata
            </strong>
            . Vuoi procedere?
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              label="Annulla"
              outlined
              className="flex-1"
              disabled={pending}
              onClick={() => setConfirmVisible(false)}
            />
            <Button
              type="button"
              label={pending ? "Salvo..." : "Sì, conferma"}
              className="flex-1"
              disabled={pending}
              onClick={handleConfirm}
            />
          </div>
        </div>
      </Dialog>

      {/* Dialog condivisione Instagram post-creazione */}
      <Dialog
        visible={shareVisible}
        onHide={() => {
          setShareVisible(false);
          router.push("/squadra");
        }}
        closable={false}
        dismissableMask
        style={{ width: "320px" }}
        pt={{
          root: { style: { borderRadius: "20px", overflow: "hidden" } },
          header: { className: "!hidden" },
          content: { className: "!p-0" },
        }}
        modal
        draggable={false}
        resizable={false}
      >
        <div className="p-6">
          <div className="mb-4 flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <i className="pi pi-check-circle text-2xl text-green-600" />
            </div>
            <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Squadra creata!
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Condividi la tua squadra nelle storie di Instagram
            </p>
          </div>
          {state?.success === true && (
            <ShareStoryButton teamId={state.teamId} />
          )}
          <button
            type="button"
            onClick={() => {
              setShareVisible(false);
              router.push("/squadra");
            }}
            className="mt-3 w-full text-center text-sm font-medium transition-colors hover:text-[var(--primary)]"
            style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
          >
            Vai alla squadra →
          </button>
        </div>
      </Dialog>

      {/* Menu contestuale slot pieno */}
      <Dialog
        visible={menuSlot !== null}
        onHide={() => setMenuSlot(null)}
        closable={false}
        dismissableMask
        style={{ width: "240px" }}
        pt={{
          root: { style: { borderRadius: "16px", overflow: "hidden" } },
          header: { className: "!hidden" },
          content: { className: "!p-0" },
        }}
        modal
        draggable={false}
        resizable={false}
      >
        {menuSlot && menuPlayer && (
          <div>
            {/* Player identity */}
            <div className="border-b border-[var(--border-soft)] px-4 pb-3 pt-4">
              <div className="mb-0.5 text-[9px] font-bold uppercase tracking-[1.5px]" style={{ color: "#6466A3" }}>
                {getTeamCode(menuPlayer)}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] font-extrabold text-[var(--text-primary)]">
                  {menuPlayer.name}
                </span>
                {menuIsCaptain && (
                  <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-bold text-yellow-700">
                    ★ C
                  </span>
                )}
              </div>
            </div>

            {/* Azioni */}
            <div className="py-1.5">
              <Button
                type="button"
                unstyled
                onClick={() => {
                  setCaptainId(menuIsCaptain ? null : menuPlayer.id);
                  setMenuSlot(null);
                }}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-yellow-50"
              >
                <i className={`pi ${menuIsCaptain ? "pi-star" : "pi-star-fill"} text-sm text-yellow-600`} />
                <span className="text-sm font-semibold text-yellow-800">
                  {menuIsCaptain ? "Togli capitano" : "Nomina capitano"}
                </span>
              </Button>
              <Button
                type="button"
                unstyled
                onClick={() => openSlot(menuSlot)}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--surface-1)]"
              >
                <i className="pi pi-refresh text-sm text-[var(--text-secondary)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">Cambia giocatore</span>
              </Button>
              <div className="mx-4 border-t border-[var(--border-soft)] my-1" />
              <Button
                type="button"
                unstyled
                onClick={() => {
                  clearSlot(menuSlot);
                  setMenuSlot(null);
                }}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-red-50"
              >
                <i className="pi pi-trash text-sm text-red-400" />
                <span className="text-sm font-semibold text-red-500">Rimuovi</span>
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Bottom sheet: regole del fanta */}
      <Dialog
        visible={rulesVisible}
        onHide={() => setRulesVisible(false)}
        closable={false}
        dismissableMask
        position={isMobile ? "bottom" : "center"}
        style={isMobile ? { width: "100%", margin: 0 } : { width: "min(28rem, 96vw)" }}
        pt={
          isMobile
            ? {
                root: { style: { borderRadius: "20px 20px 0 0", overflow: "hidden" } },
                header: { className: "!px-4 !py-0" },
                content: { className: "!px-4 !pt-0 !pb-8" },
              }
            : {
                root: { style: { borderRadius: "22px", overflow: "hidden" } },
                header: { className: "!px-5 !py-0 !border-b !border-[var(--border-soft)]" },
                content: { className: "!px-5 !pt-3 !pb-6" },
              }
        }
        header={
          <div className="flex flex-col">
            {isMobile && (
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full" style={{ background: "var(--border-medium)" }} />
              </div>
            )}
            <div className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: "var(--primary-light)" }}
                >
                  <i className="pi pi-star-fill text-sm" style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    Guida rapida
                  </div>
                  <div className="text-[15px] font-extrabold leading-tight" style={{ color: "var(--text-primary)" }}>
                    Come funziona il Fanta
                  </div>
                </div>
              </div>
              <Button
                type="button"
                icon="pi pi-times"
                text
                rounded
                severity="secondary"
                aria-label="Chiudi"
                onClick={() => setRulesVisible(false)}
              />
            </div>
          </div>
        }
        modal
        draggable={false}
        resizable={false}
        focusOnShow={false}
      >
        <div className="overflow-y-auto" style={{ maxHeight: isMobile ? "58vh" : "70vh" }}>
          <div
            className="overflow-hidden rounded-2xl"
            style={{ border: "1px solid var(--border-soft)" }}
          >
            {[
              {
                icon: "pi-users",
                color: "var(--primary)",
                bg: "var(--primary-light)",
                title: "La tua rosa",
                text: "Scegli 1 portiere e 4 giocatori di movimento.",
              },
              {
                icon: "pi-shield",
                color: "#7C3AED",
                bg: "#F5F3FF",
                title: "Una squadra per slot",
                text: "Puoi prendere al massimo 1 giocatore per squadra. Quando selezioni un giocatore, la sua squadra sparisce dalle opzioni disponibili.",
              },
              {
                icon: "pi-lock",
                color: "#DC2626",
                bg: "#FEF2F2",
                title: "La rosa è definitiva",
                text: "Una volta confermata, la squadra non si può più modificare. Scegli con cura.",
              },
              {
                icon: "pi-bolt",
                color: "#D97706",
                bg: "#FFFBEB",
                title: "Punti e bonus segreti",
                text: "I punti non si assegnano solo per i goal. Ci sono bonus segreti per le giocate più spettacolari - sprona i tuoi giocatori a fare cose epiche.",
              },
              {
                icon: "pi-trophy",
                color: "#059669",
                bg: "#ECFDF5",
                title: "Vota l'MVP",
                text: "Dopo ogni partita puoi votare il tuo MVP. Non dimenticarti - è un modo concreto per fare punti.",
              },
            ].map((rule, i, arr) => (
              <div
                key={rule.title}
                className="flex items-start gap-3 px-4 py-3.5 bg-white"
                style={i < arr.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : undefined}
              >
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: rule.bg }}
                >
                  <i className={`pi ${rule.icon} text-xs`} style={{ color: rule.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-extrabold" style={{ color: "var(--text-primary)" }}>
                    {rule.title}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {rule.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
        isMobile={isMobile}
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
        ok ? "" : "border border-amber-200 bg-amber-50 text-amber-700"
      }`}
      style={ok ? { background: "rgba(50,215,75,0.12)", color: "#32D74B" } : undefined}
    >
      {ok ? "✓ " : "○ "}
      {label}
    </span>
  );
}
