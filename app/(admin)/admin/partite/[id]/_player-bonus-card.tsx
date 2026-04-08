"use client";

import { useState, useRef, useEffect } from "react";
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-8 h-8 rounded-full text-base font-bold flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
      >−</button>
      <span className="font-display font-black text-xl w-6 text-center tabular-nums" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(10, value + 1))}
        className="w-8 h-8 rounded-full text-base font-bold flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
      >+</button>
    </div>
  );
}

export default function PlayerBonusCard({ matchId, player, bonuses, bonusTypes }: Props) {
  const [visible, setVisible] = useState(false);
  const [selectedBonusType, setSelectedBonusType] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [state, action, pending] = useActionState(assignBonus, undefined);
  const removeFormRef = useRef<HTMLFormElement>(null);
  const prevStateRef = useRef<typeof state>(undefined);

  useEffect(() => {
    if (state !== undefined && state !== prevStateRef.current && !state?.message && !state?.errors) {
      setSelectedBonusType("");
      setQty(1);
    }
    prevStateRef.current = state;
  }, [state]);

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
        header={
          <div className="flex items-center gap-2">
            <RoleBadge role={player.role} />
            <div className="min-w-0">
              <div className="font-display font-black text-base uppercase truncate" style={{ color: "var(--text-primary)" }}>
                {player.name}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{player.footballTeam.name}</div>
            </div>
          </div>
        }
        style={{ width: "min(26rem, 96vw)" }}
        modal
        draggable={false}
        resizable={false}
      >
        <div className="flex flex-col gap-4">

          {/* Existing bonuses */}
          {bonuses.length > 0 && (
            <div>
              <div className="over-label mb-2">Bonus assegnati</div>
              <div className="flex flex-col gap-1.5">
                {bonuses.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: "var(--surface-1)", border: "1px solid var(--border-soft)" }}
                  >
                    <span
                      className="text-[11px] font-black px-2 py-1 rounded-lg flex-shrink-0"
                      style={{
                        background: b.points >= 0 ? "#ECFDF5" : "#FEF2F2",
                        color: b.points >= 0 ? "#065F46" : "#991B1B",
                      }}
                    >
                      {b.bonusType.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {b.quantity > 1 ? `×${b.quantity}  ` : ""}
                        {b.points > 0 ? "+" : ""}{b.points * b.quantity}pt
                      </span>
                    </div>
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

          {/* Divider */}
          {bonuses.length > 0 && (
            <div style={{ borderTop: "1px solid var(--border-soft)" }} />
          )}

          {/* Assign form */}
          <form action={action} className="flex flex-col gap-3">
            <div className="over-label">Assegna bonus</div>
            <input type="hidden" name="matchId" value={matchId} />
            <input type="hidden" name="playerId" value={player.id} />
            <input type="hidden" name="bonusTypeId" value={selectedBonusType} />
            <input type="hidden" name="quantity" value={qty} />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
                Tipo bonus
              </label>
              <Dropdown
                value={selectedBonusType}
                onChange={(e) => setSelectedBonusType(e.value)}
                options={bonusTypeOptions}
                placeholder="Seleziona..."
                className="w-full"
                itemTemplate={(opt) => (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-sm">{opt.label}</span>
                    </div>
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
                <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.bonusTypeId[0]}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Quantità
                </label>
                <Qty value={qty} onChange={setQty} />
              </div>
              {selectedBt && (
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Totale</div>
                  <div
                    className="font-display font-black text-2xl"
                    style={{ color: selectedBt.points >= 0 ? "#065F46" : "#991B1B" }}
                  >
                    {selectedBt.points * qty > 0 ? "+" : ""}{(selectedBt.points * qty).toFixed(1)}pt
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
