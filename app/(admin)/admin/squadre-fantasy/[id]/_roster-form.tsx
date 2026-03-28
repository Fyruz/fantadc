"use client";

import { useActionState } from "react";
import { adminUpdateFantasyRoster } from "@/app/actions/admin/fantasy-teams";

type Player = { id: number; name: string; role: string; footballTeam: { name: string } };

export default function RosterForm({
  fantasyTeamId,
  currentPlayerIds,
  captainPlayerId,
  allPlayers,
}: {
  fantasyTeamId: number;
  currentPlayerIds: number[];
  captainPlayerId: number;
  allPlayers: Player[];
}) {
  const [state, action, pending] = useActionState(adminUpdateFantasyRoster, undefined);

  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <input type="hidden" name="fantasyTeamId" value={fantasyTeamId} />
      <div>
        <label className="block text-sm font-medium mb-2">Seleziona 5 giocatori (1 P + 4 A, squadre diverse)</label>
        <div className="flex flex-col gap-1 max-h-80 overflow-y-auto border rounded p-2">
          {allPlayers.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-zinc-50 px-2 py-1 rounded">
              <input
                type="checkbox"
                name="playerIds"
                value={p.id}
                defaultChecked={currentPlayerIds.includes(p.id)}
              />
              <span>
                <span className="font-medium">{p.name}</span>
                <span className="text-zinc-400 ml-1 text-xs">({p.role})</span>
                <span className="text-zinc-400 ml-1 text-xs">— {p.footballTeam.name}</span>
              </span>
            </label>
          ))}
        </div>
        {state?.errors?.playerIds && <p className="text-red-500 text-sm mt-1">{state.errors.playerIds[0]}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Capitano *</label>
        <select name="captainPlayerId" defaultValue={captainPlayerId} className="input w-full">
          <option value="">Seleziona capitano</option>
          {allPlayers.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.footballTeam.name})</option>
          ))}
        </select>
        {state?.errors?.captainPlayerId && <p className="text-red-500 text-sm mt-1">{state.errors.captainPlayerId[0]}</p>}
      </div>
      {state?.message && (
        <p className={`text-sm ${state.message.startsWith("Rosa") ? "text-green-600" : "text-red-500"}`}>
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-fit">
        {pending ? "Salvo..." : "Salva rosa"}
      </button>
    </form>
  );
}
