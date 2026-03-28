"use client";

import { useActionState } from "react";
import { assignBonus } from "@/app/actions/admin/bonuses";

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

  return (
    <form action={action} className="flex gap-2 items-end flex-wrap">
      <input type="hidden" name="matchId" value={matchId} />
      <div>
        <label className="block text-xs font-medium mb-1 text-zinc-500">Giocatore</label>
        <select name="playerId" className="input" required>
          <option value="">Seleziona...</option>
          {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-zinc-500">Tipo bonus</label>
        <select name="bonusTypeId" className="input" required>
          <option value="">Seleziona...</option>
          {bonusTypes.map((bt) => (
            <option key={bt.id} value={bt.id}>{bt.code} — {bt.name} ({Number(bt.points) > 0 ? "+" : ""}{Number(bt.points)}pt)</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-zinc-500">Quantità</label>
        <input name="quantity" type="number" min={1} max={10} defaultValue={1} className="input w-16" />
      </div>
      {state?.errors?.bonusTypeId && <p className="text-red-500 text-xs self-end">{state.errors.bonusTypeId[0]}</p>}
      {state?.message && <p className="text-red-500 text-xs self-end">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-secondary">
        {pending ? "..." : "+ Assegna"}
      </button>
    </form>
  );
}
