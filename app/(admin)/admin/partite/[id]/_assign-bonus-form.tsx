"use client";

import { useActionState, useState } from "react";
import { assignBonus } from "@/app/actions/admin/bonuses";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";

type Player = { id: number; name: string };
type BonusType = { id: number; code: string; name: string; points: number };

export default function AssignBonusForm({
  matchId,
  players,
  bonusTypes,
}: {
  matchId: number;
  players: Player[];
  bonusTypes: BonusType[];
}) {
  const [state, action, pending] = useActionState(assignBonus, undefined);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [bonusTypeId, setBonusTypeId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const playerOptions = players.map((p) => ({ label: p.name, value: p.id }));
  const bonusTypeOptions = bonusTypes.map((bt) => ({
    label: `${bt.code} — ${bt.name} (${Number(bt.points) > 0 ? "+" : ""}${Number(bt.points)}pt)`,
    value: bt.id,
  }));

  return (
    <form action={action} className="flex gap-2 items-end flex-wrap">
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="playerId" value={playerId ?? ""} />
      <input type="hidden" name="bonusTypeId" value={bonusTypeId ?? ""} />
      <input type="hidden" name="quantity" value={quantity} />
      <div>
        <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">Giocatore</label>
        <Dropdown
          value={playerId}
          onChange={(e) => setPlayerId(e.value)}
          options={playerOptions}
          placeholder="Seleziona..."
          className="w-48"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">Tipo bonus</label>
        <Dropdown
          value={bonusTypeId}
          onChange={(e) => setBonusTypeId(e.value)}
          options={bonusTypeOptions}
          placeholder="Seleziona..."
          className="w-64"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">Quantità</label>
        <InputNumber
          value={quantity}
          onValueChange={(e) => setQuantity(e.value ?? 1)}
          min={1}
          max={10}
          className="w-20"
        />
      </div>
      {state?.errors?.bonusTypeId && <p className="text-red-500 text-xs self-end">{state.errors.bonusTypeId[0]}</p>}
      {state?.message && <p className="text-red-500 text-xs self-end">{state.message}</p>}
      <Button type="submit" disabled={pending} label={pending ? "..." : "+ Assegna"} severity="secondary" size="small" />
    </form>
  );
}
