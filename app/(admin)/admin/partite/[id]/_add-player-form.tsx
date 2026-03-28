"use client";

import { addMatchPlayer } from "@/app/actions/admin/match-players";

type Player = { id: number; name: string; role: string; footballTeam: { name: string } };

export default function AddMatchPlayerForm({ matchId, availablePlayers }: { matchId: number; availablePlayers: Player[] }) {
  return (
    <form action={addMatchPlayer as unknown as (fd: FormData) => void} className="flex gap-2 items-end flex-wrap">
      <input type="hidden" name="matchId" value={matchId} />
      <div>
        <label className="block text-xs font-medium mb-1 text-zinc-500">Aggiungi giocatore</label>
        <select name="playerId" className="input" required>
          <option value="">Seleziona...</option>
          {availablePlayers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.role}) — {p.footballTeam.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-secondary">+ Aggiungi</button>
    </form>
  );
}
