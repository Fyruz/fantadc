"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { assignBonus, deleteBonus } from "@/app/actions/admin/bonuses";
import { removeMatchPlayer } from "@/app/actions/admin/match-players";
import RoleBadge from "@/components/role-badge";

type Bonus = { id: number; bonusType: { code: string }; quantity: number; points: number };
type BonusType = { id: number; code: string; name: string; points: number };

interface Props {
  matchId: number;
  player: { id: number; name: string; role: string; footballTeam: { name: string } };
  bonuses: Bonus[];
  bonusTypes: BonusType[];
}

function Qty({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-9 h-9 rounded-full text-lg font-bold flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
      >−</button>
      <span className="font-display font-black text-2xl w-8 text-center tabular-nums" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(10, value + 1))}
        className="w-9 h-9 rounded-full text-lg font-bold flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
      >+</button>
    </div>
  );
}

export default function PlayerBonusCard({ matchId, player, bonuses, bonusTypes }: Props) {
  const [visible, setVisible] = useState(false);
  const [selectedBonusType, setSelectedBonusType] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [state, action, pending] = useActionState(
    async (prevState: Awaited<ReturnType<typeof assignBonus>> | undefined, formData: FormData) => {
      const nextState = await assignBonus(prevState, formData);

      if (!nextState?.message && !nextState?.errors) {
        setSelectedBonusType("");
        setQty(1);
      }

      return nextState;
    },
    undefined
  );
  const removeFormRef = useRef<HTMLFormElement>(null);

  const bonusTypeOptions = bonusTypes.map((bt) => ({
    label: `${bt.code} — ${bt.name}`,
    value: String(bt.id),
    points: bt.points,
  }));

  const selectedBt = bonusTypes.find((bt) => String(bt.id) === selectedBonusType);

  const handleRemove = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    confirmPopup({
      target: e.currentTarget,
      message: `Rimuovere ${player.name} dalla partita?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì",
      rejectLabel: "No",
      accept: () => removeFormRef.current?.requestSubmit(),
    });
  };

  const totalPoints = bonuses.reduce((s, b) => s + b.points * b.quantity, 0);

  return (
    <>
      <ConfirmPopup />

      {/* Hidden remove form */}
      <form ref={removeFormRef} action={removeMatchPlayer as unknown as (fd: FormData) => void} className="hidden">
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="playerId" value={player.id} />
      </form>

      {/* Card */}
      <div
        className="rounded-xl p-3 relative cursor-pointer transition-all duration-150 select-none hover:shadow-md active:scale-[0.98]"
        style={{
          background: "#fff",
          border: "1.5px solid var(--border-medium)",
          borderLeft: `3px solid ${player.role === "GK" ? "#E8A000" : "var(--primary)"}`,
          boxShadow: "0 1px 4px rgba(1,7,163,0.05)",
        }}
        onClick={() => setVisible(true)}
      >
        {/* Remove */}
        <button
          type="button"
          aria-label="Rimuovi"
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
          style={{ color: "var(--text-disabled)" }}
          onClick={handleRemove}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-disabled)")}
        >
          <i className="pi pi-times text-[10px]" />
        </button>

        {/* Player */}
        <div className="flex items-center gap-1.5 pr-6 mb-0.5">
          <RoleBadge role={player.role} />
          <span className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
            {player.name}
          </span>
        </div>
        <p className="text-[11px] truncate mb-2" style={{ color: "var(--text-muted)" }}>
          {player.footballTeam.name}
        </p>

        {/* Bonus summary */}
        {bonuses.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {bonuses.map((b) => (
              <span
                key={b.id}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: b.points >= 0 ? "#ECFDF5" : "#FEF2F2",
                  color: b.points >= 0 ? "#065F46" : "#991B1B",
                }}
              >
                {b.bonusType.code}{b.quantity > 1 ? ` ×${b.quantity}` : ""}
              </span>
            ))}
            <span
              className="text-[10px] font-black px-1.5 py-0.5 rounded-full ml-auto"
              style={{ background: "var(--primary-light)", color: "var(--primary)" }}
            >
              {totalPoints > 0 ? "+" : ""}{totalPoints}pt
            </span>
          </div>
        ) : (
          <p className="text-[11px] flex items-center gap-1" style={{ color: "var(--text-disabled)" }}>
            <i className="pi pi-plus-circle text-[10px]" />
            Tocca per bonus
          </p>
        )}
      </div>

      {/* Dialog */}
      <Dialog
        visible={visible}
        onHide={() => setVisible(false)}
        header={null}
        closable={false}
        style={{ width: "min(26rem, 94vw)", padding: 0 }}
        contentStyle={{ padding: 0 }}
        pt={{ root: { style: { borderRadius: "20px", overflow: "hidden" } } }}
        modal
        draggable={false}
        resizable={false}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-soft)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
            style={{
              background: player.role === "GK" ? "rgba(232,160,0,0.12)" : "rgba(1,7,163,0.08)",
              color: player.role === "GK" ? "#C87800" : "var(--primary)",
            }}
          >
            {player.role === "GK" ? "P" : "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-black text-base uppercase leading-tight truncate" style={{ color: "var(--text-primary)" }}>
              {player.name}
            </div>
            <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {player.footballTeam.name}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition-colors"
            style={{ background: "var(--surface-1)", color: "var(--text-muted)" }}
          >
            <i className="pi pi-times text-xs" />
          </button>
        </div>

        <div className="flex flex-col gap-0">
          {/* ── Existing bonuses ── */}
          {bonuses.length > 0 && (
            <div className="px-5 pt-4 pb-2">
              <div
                className="text-[10px] font-black uppercase tracking-widest mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Bonus assegnati
              </div>
              <div className="flex flex-col gap-1.5">
                {bonuses.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: "var(--surface-1)", border: "1px solid var(--border-soft)" }}
                  >
                    <span
                      className="text-[11px] font-black px-2 py-1 rounded-lg flex-shrink-0 min-w-[2.5rem] text-center"
                      style={{
                        background: b.points >= 0 ? "#ECFDF5" : "#FEF2F2",
                        color: b.points >= 0 ? "#065F46" : "#991B1B",
                      }}
                    >
                      {b.bonusType.code}
                    </span>
                    <span className="flex-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {b.quantity > 1 ? `×${b.quantity}  ` : ""}
                      {b.points > 0 ? "+" : ""}{b.points * b.quantity}pt
                    </span>
                    <form action={deleteBonus as unknown as (fd: FormData) => void} className="flex-shrink-0">
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="matchId" value={matchId} />
                      <button
                        type="submit"
                        className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
                        style={{ color: "var(--text-disabled)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-disabled)")}
                        title="Rimuovi"
                      >
                        <i className="pi pi-trash text-xs" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Assign form ── */}
          <form action={action} className="flex flex-col gap-4 px-5 pt-4 pb-5">
            <div
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Assegna bonus
            </div>

            <input type="hidden" name="matchId" value={matchId} />
            <input type="hidden" name="playerId" value={player.id} />
            <input type="hidden" name="bonusTypeId" value={selectedBonusType} />
            <input type="hidden" name="quantity" value={qty} />

            {/* Bonus type */}
            <Dropdown
              value={selectedBonusType}
              onChange={(e) => setSelectedBonusType(e.value)}
              options={bonusTypeOptions}
              placeholder="Seleziona tipo bonus..."
              className="w-full"
              itemTemplate={(opt) => (
                <div className="flex items-center justify-between gap-3 py-0.5">
                  <span className="text-sm font-semibold">{opt.label}</span>
                  <span
                    className="text-[11px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: opt.points >= 0 ? "#ECFDF5" : "#FEF2F2",
                      color: opt.points >= 0 ? "#065F46" : "#991B1B",
                    }}
                  >
                    {opt.points > 0 ? "+" : ""}{opt.points}pt
                  </span>
                </div>
              )}
            />
            {state?.errors?.bonusTypeId && (
              <p className="text-xs -mt-2" style={{ color: "#991B1B" }}>{state.errors.bonusTypeId[0]}</p>
            )}

            {/* Quantity + total */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Quantità
                </span>
                <Qty value={qty} onChange={setQty} />
              </div>
              {selectedBt && (
                <div
                  className="rounded-xl px-4 py-2.5 text-right"
                  style={{ background: selectedBt.points >= 0 ? "#ECFDF5" : "#FEF2F2" }}
                >
                  <div className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: selectedBt.points >= 0 ? "#065F46" : "#991B1B", opacity: 0.6 }}>
                    Totale
                  </div>
                  <div
                    className="font-display font-black text-2xl leading-none"
                    style={{ color: selectedBt.points >= 0 ? "#065F46" : "#991B1B" }}
                  >
                    {selectedBt.points * qty > 0 ? "+" : ""}{(selectedBt.points * qty).toFixed(selectedBt.points % 1 === 0 ? 0 : 1)}pt
                  </div>
                </div>
              )}
            </div>

            {state?.message && (
              <p className="text-xs" style={{ color: "#991B1B" }}>{state.message}</p>
            )}

            <Button
              type="submit"
              label={pending ? "Assegno..." : "Assegna bonus"}
              icon="pi pi-plus"
              disabled={pending || !selectedBonusType}
              className="w-full"
            />
          </form>
        </div>
      </Dialog>
    </>
  );
}
