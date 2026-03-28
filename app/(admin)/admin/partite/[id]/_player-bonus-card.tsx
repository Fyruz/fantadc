"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
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

export default function PlayerBonusCard({ matchId, player, bonuses, bonusTypes }: Props) {
  const [visible, setVisible] = useState(false);
  const [selectedBonusType, setSelectedBonusType] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [state, action, pending] = useActionState(assignBonus, undefined);
  const removeFormRef = useRef<HTMLFormElement>(null);

  const roleColor = player.role === "P" ? "#10B981" : "#3B82F6";

  const bonusTypeOptions = bonusTypes.map((bt) => ({
    label: `${bt.code} — ${bt.name} (${bt.points > 0 ? "+" : ""}${bt.points}pt)`,
    value: String(bt.id),
  }));

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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
      <form
        ref={removeFormRef}
        action={removeMatchPlayer as unknown as (fd: FormData) => void}
        className="hidden"
      >
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="playerId" value={player.id} />
      </form>

      {/* Card */}
      <div
        className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-3 relative cursor-pointer hover:shadow-md hover:-translate-y-px transition-all duration-150 select-none"
        style={{ borderLeft: `3px solid ${roleColor}` }}
        onClick={() => setVisible(true)}
      >
        {/* Remove button */}
        <button
          type="button"
          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
          onClick={handleRemoveClick}
          title="Rimuovi dalla partita"
        >
          <i className="pi pi-times text-xs" />
        </button>

        {/* Name + role badge */}
        <div className="flex items-center gap-1.5 mb-1 pr-5">
          <RoleBadge role={player.role} />
          <span className="text-sm font-semibold text-[#111827] truncate">{player.name}</span>
        </div>
        <p className="text-xs text-[#6B7280]">{player.footballTeam.name}</p>

        {/* Bonus chips */}
        {bonuses.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {bonuses.map((b) => (
              <span
                key={b.id}
                className="bg-[#F3F4F6] text-[#374151] rounded-full px-2 py-0.5 text-xs"
              >
                {b.bonusType.code}
                {b.quantity > 1 ? ` ×${b.quantity}` : ""}{" "}
                {b.points > 0 ? "+" : ""}{b.points}pt
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#9CA3AF] mt-1 flex items-center gap-1">
            <i className="pi pi-plus-circle text-xs" />
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
            <span className="text-base font-semibold">{player.name}</span>
          </div>
        }
        style={{ width: "min(24rem, 95vw)" }}
        modal
        draggable={false}
      >
        <p className="text-xs text-[#6B7280] mb-4">{player.footballTeam.name}</p>

        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="matchId" value={matchId} />
          <input type="hidden" name="playerId" value={player.id} />
          <div>
            <label className="block text-xs font-medium mb-1 text-[#6B7280]">Tipo bonus</label>
            <input type="hidden" name="bonusTypeId" value={selectedBonusType} />
            <Dropdown
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
            <label className="block text-xs font-medium mb-1 text-[#6B7280]">Quantità</label>
            <input type="hidden" name="quantity" value={qty} />
            <InputNumber
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
            <Button
              type="button"
              label="Chiudi"
              severity="secondary"
              size="small"
              onClick={() => setVisible(false)}
            />
            <Button
              type="submit"
              label={pending ? "..." : "+ Assegna"}
              size="small"
              disabled={pending}
            />
          </div>
        </form>

        {bonuses.length > 0 && (
          <div className="mt-4 border-t border-[#E5E7EB] pt-3">
            <p className="text-xs font-medium text-[#6B7280] mb-2">Bonus assegnati</p>
            <ul className="flex flex-col gap-1">
              {bonuses.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between text-xs bg-[#F8F9FC] px-2 py-1.5 rounded-lg"
                >
                  <span className="text-[#111827]">
                    {b.bonusType.code}
                    {b.quantity > 1 ? ` ×${b.quantity}` : ""}{" "}
                    <span className="text-[#6B7280]">
                      ({b.points > 0 ? "+" : ""}{b.points}pt)
                    </span>
                  </span>
                  <form
                    action={deleteBonus as unknown as (fd: FormData) => void}
                    className="inline"
                  >
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="matchId" value={matchId} />
                    <Button
                      type="submit"
                      icon="pi pi-times"
                      severity="danger"
                      text
                      size="small"
                      title="Rimuovi"
                    />
                  </form>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Dialog>
    </>
  );
}
