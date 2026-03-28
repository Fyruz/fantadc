"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { assignBonus, deleteBonus } from "@/app/actions/admin/bonuses";
import { removeMatchPlayer } from "@/app/actions/admin/match-players";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

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

  // Reset form after successful submit
  const prevStateRef = { current: state };
  if (state !== undefined && state !== prevStateRef.current) {
    if (!state.message && !state.errors) {
      setSelectedBonusType("");
      setQty(1);
    }
  }

  const bonusTypeOptions = bonusTypes.map((bt) => ({
    label: `${bt.code} — ${bt.name} (${bt.points > 0 ? "+" : ""}${bt.points}pt)`,
    value: String(bt.id),
  }));

  return (
    <>
      <div className="border rounded p-3 hover:border-blue-400 transition-colors select-none">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm">
            {player.name}{" "}
            <span className="text-zinc-400 text-xs">({player.role})</span>{" "}
            <span className="text-zinc-400 text-xs">— {player.footballTeam.name}</span>
          </span>
          <ConfirmDeleteForm
            action={removeMatchPlayer}
            hiddenInputs={{ matchId, playerId: player.id }}
            confirmMessage={`Rimuovere ${player.name} dalla partita?`}
            buttonLabel="Rimuovi"
          />
        </div>
        {bonuses.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5 mt-2">
            {bonuses.map((b) => (
              <li key={b.id} className="flex items-center gap-1 text-xs bg-zinc-100 px-2 py-0.5 rounded">
                <span>{b.bonusType.code}</span>
                {b.quantity > 1 && <span>×{b.quantity}</span>}
                <span className="text-zinc-500">
                  ({b.points > 0 ? "+" : ""}{b.points}pt)
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-400 mt-1">Nessun bonus</p>
        )}
        <div className="mt-2">
          <Button
            type="button"
            label="Aggiungi bonus"
            icon="pi pi-plus"
            size="small"
            text
            onClick={() => setVisible(true)}
          />
        </div>
      </div>

      <Dialog
        visible={visible}
        onHide={() => setVisible(false)}
        header={player.name}
        style={{ width: "24rem" }}
        modal
        draggable={false}
      >
        <p className="text-xs text-zinc-500 mb-4">{player.role} — {player.footballTeam.name}</p>

        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="matchId" value={matchId} />
          <input type="hidden" name="playerId" value={player.id} />
          <div>
            <label className="block text-xs font-medium mb-1 text-zinc-500">Tipo bonus</label>
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
            <label className="block text-xs font-medium mb-1 text-zinc-500">Quantità</label>
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
          <div className="mt-4 border-t pt-3">
            <p className="text-xs font-medium text-zinc-500 mb-2">Bonus assegnati</p>
            <ul className="flex flex-col gap-1">
              {bonuses.map((b) => (
                <li key={b.id} className="flex items-center justify-between text-xs bg-zinc-50 px-2 py-1 rounded">
                  <span>
                    {b.bonusType.code}{b.quantity > 1 ? ` ×${b.quantity}` : ""}{" "}
                    <span className="text-zinc-500">({b.points > 0 ? "+" : ""}{b.points}pt)</span>
                  </span>
                  <form action={deleteBonus as unknown as (fd: FormData) => void} className="inline">
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
