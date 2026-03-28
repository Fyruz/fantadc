"use client";

import { useRef, useEffect, useState } from "react";
import { useActionState } from "react";
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0);
  const [state, action, pending] = useActionState(assignBonus, undefined);

  useEffect(() => {
    if (state !== undefined && !state.message && !state.errors) {
      setFormKey((k) => k + 1);
    }
  }, [state]);

  return (
    <>
      <div
        className="border rounded p-3 cursor-pointer hover:border-blue-400 transition-colors select-none"
        onClick={() => dialogRef.current?.showModal()}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm">
            {player.name}{" "}
            <span className="text-zinc-400 text-xs">({player.role})</span>{" "}
            <span className="text-zinc-400 text-xs">— {player.footballTeam.name}</span>
          </span>
          <div onClick={(e) => e.stopPropagation()}>
            <ConfirmDeleteForm
              action={removeMatchPlayer}
              hiddenInputs={{ matchId, playerId: player.id }}
              confirmMessage={`Rimuovere ${player.name} dalla partita?`}
              buttonLabel="Rimuovi"
              buttonClassName="text-red-500 text-xs hover:underline"
            />
          </div>
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
      </div>

      <dialog
        ref={dialogRef}
        className="rounded-lg p-6 shadow-xl w-full max-w-sm backdrop:bg-black/50"
        onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current?.close(); }}
      >
        <h3 className="font-bold text-base mb-0.5">{player.name}</h3>
        <p className="text-xs text-zinc-500 mb-4">{player.role} — {player.footballTeam.name}</p>

        <form key={formKey} action={action} className="flex flex-col gap-3">
          <input type="hidden" name="matchId" value={matchId} />
          <input type="hidden" name="playerId" value={player.id} />
          <div>
            <label className="block text-xs font-medium mb-1 text-zinc-500">Tipo bonus</label>
            <select name="bonusTypeId" className="input w-full" required>
              <option value="">Seleziona...</option>
              {bonusTypes.map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {bt.code} — {bt.name} ({bt.points > 0 ? "+" : ""}{bt.points}pt)
                </option>
              ))}
            </select>
            {state?.errors?.bonusTypeId && (
              <p className="text-red-500 text-xs mt-1">{state.errors.bonusTypeId[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-zinc-500">Quantità</label>
            <input name="quantity" type="number" min={1} max={10} defaultValue={1} className="input w-20" />
          </div>
          {state?.message && <p className="text-red-500 text-xs">{state.message}</p>}
          <div className="flex gap-2 justify-end mt-1">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => dialogRef.current?.close()}
            >
              Chiudi
            </button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "..." : "+ Assegna"}
            </button>
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
                    <button type="submit" className="text-red-500 hover:text-red-700 ml-2 text-base leading-none" title="Rimuovi">×</button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        )}
      </dialog>
    </>
  );
}
