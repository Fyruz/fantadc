"use client";

import { useActionState, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { assignBonus, deleteBonus } from "@/app/actions/admin/bonuses";
import { removeMatchPlayer } from "@/app/actions/admin/match-players";
import { isSuccessfulActionResult } from "@/lib/action-result";
import RoleBadge from "@/components/role-badge";

type Bonus = { id: number; bonusType: { code: string }; quantity: number; points: number };
type BonusType = { id: number; code: string; name: string; points: number };

interface Props {
  matchId: number;
  player: { id: number; name: string; role: string; footballTeam: { name: string } };
  bonuses: Bonus[];
  bonusTypes: BonusType[];
}

export default function PlayerBonusCard({ matchId, player, bonuses, bonusTypes }: Props) {
  const [visible, setVisible] = useState(false);
  const [selectedBonusType, setSelectedBonusType] = useState<string>("");
  const [qty, setQty] = useState(1);
  const removeFormRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    async (
      previousState: Awaited<ReturnType<typeof assignBonus>> | undefined,
      formData: FormData
    ) => {
      const result = await assignBonus(previousState, formData);
      if (isSuccessfulActionResult(result)) {
        setSelectedBonusType("");
        setQty(1);
        setVisible(false);
      }
      return result;
    },
    undefined
  );

  const isGk = player.role === "P";
  const borderColor = isGk ? "#E8A000" : "var(--border-medium)";

  const bonusTypeOptions = bonusTypes.map((bt) => ({
    label: `${bt.code} — ${bt.name} (${bt.points > 0 ? "+" : ""}${bt.points}pt)`,
    value: String(bt.id),
  }));

  const handleRemoveClick = (e: React.MouseEvent<HTMLElement>) => {
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
        className="rounded-xl p-3 relative cursor-pointer transition-all duration-150 select-none hover:shadow-md"
        style={{
          background: "#fff",
          border: `1px solid var(--border-soft)`,
          borderLeft: `3px solid ${borderColor}`,
          boxShadow: "0 1px 4px rgba(1,7,163,0.06)",
        }}
        onClick={() => setVisible(true)}
      >
        {/* Remove button */}
        <button
          type="button"
          aria-label="Rimuovi"
          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
          style={{ color: "var(--text-disabled)" }}
          onClick={handleRemoveClick}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-disabled)")}
        >
          <i className="pi pi-times text-[11px]" />
        </button>

        {/* Name + role */}
        <div className="flex items-center gap-1.5 mb-1 pr-6">
          <RoleBadge role={player.role} />
          <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {player.name}
          </span>
        </div>
        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
          {player.footballTeam.name}
        </p>

        {/* Bonus chips */}
        {bonuses.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {bonuses.map((b) => {
              const pts = b.points;
              return (
                <span
                  key={b.id}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: pts >= 0 ? "#ECFDF5" : "#FEF2F2",
                    color: pts >= 0 ? "#065F46" : "#991B1B",
                  }}
                >
                  {b.bonusType.code}{b.quantity > 1 ? ` ×${b.quantity}` : ""} {pts > 0 ? "+" : ""}{pts}pt
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: "var(--text-disabled)" }}>
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
            <span className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              {player.name}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{player.footballTeam.name}</span>
          </div>
        }
        style={{ width: "min(24rem, 95vw)" }}
        modal
        draggable={false}
      >
        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="matchId" value={matchId} />
          <input type="hidden" name="playerId" value={player.id} />
          <div>
            <label htmlFor="bonus-type-select" className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              Tipo bonus
            </label>
            <input type="hidden" name="bonusTypeId" value={selectedBonusType} />
            <Dropdown
              inputId="bonus-type-select"
              value={selectedBonusType}
              onChange={(e) => setSelectedBonusType(e.value)}
              options={bonusTypeOptions}
              placeholder="Seleziona..."
              className="w-full"
            />
            {state?.errors?.bonusTypeId && (
              <p className="text-red-500 text-xs mt-1">{state.errors.bonusTypeId[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="bonus-qty" className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              Quantità
            </label>
            <input type="hidden" name="quantity" value={qty} />
            <InputNumber
              inputId="bonus-qty"
              value={qty}
              onValueChange={(e) => setQty(e.value ?? 1)}
              min={1}
              max={10}
              showButtons
              className="w-full"
            />
          </div>
          {state?.message && <p className="text-red-500 text-xs">{state.message}</p>}
          <div className="flex gap-2 justify-end mt-1">
            <Button type="button" label="Chiudi" severity="secondary" size="small" onClick={() => setVisible(false)} />
            <Button type="submit" label={pending ? "..." : "Assegna"} size="small" disabled={pending} />
          </div>
        </form>

        {/* Existing bonuses */}
        {bonuses.length > 0 && (
          <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border-soft)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Bonus assegnati
            </p>
            <ul className="flex flex-col gap-1">
              {bonuses.map((b) => {
                const pts = b.points;
                return (
                  <li
                    key={b.id}
                    className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg"
                    style={{ background: "var(--surface-1)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="font-bold px-1.5 py-0.5 rounded text-[10px]"
                        style={{
                          background: pts >= 0 ? "#ECFDF5" : "#FEF2F2",
                          color: pts >= 0 ? "#065F46" : "#991B1B",
                        }}
                      >
                        {b.bonusType.code}
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>
                        {b.quantity > 1 ? `×${b.quantity}` : ""} {pts > 0 ? "+" : ""}{pts}pt
                      </span>
                    </div>
                    <form action={deleteBonus as unknown as (fd: FormData) => void} className="inline">
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="matchId" value={matchId} />
                      <Button type="submit" icon="pi pi-times" severity="danger" text size="small" title="Rimuovi" />
                    </form>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Dialog>
    </>
  );
}
