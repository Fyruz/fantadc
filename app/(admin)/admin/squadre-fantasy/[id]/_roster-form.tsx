"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { adminUpdateFantasyRoster } from "@/app/actions/admin/fantasy-teams";
import RoleBadge from "@/components/role-badge";

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
  const [selectedCaptain, setSelectedCaptain] = useState<string>(String(captainPlayerId));

  const captainOptions = allPlayers.map((p) => ({
    label: `${p.name} (${p.footballTeam.name})`,
    value: String(p.id),
  }));

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="fantasyTeamId" value={fantasyTeamId} />

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
          Seleziona 5 giocatori — 1 Portiere + 4 Giocatori, squadre diverse
        </label>
        <div className="admin-card overflow-hidden max-h-80 overflow-y-auto">
          {allPlayers.map((p, i) => (
            <label
              key={p.id}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[var(--surface-1)] transition-colors text-sm ${
                i < allPlayers.length - 1 ? "border-b border-[var(--border-soft)]" : ""
              }`}
            >
              <input
                type="checkbox"
                name="playerIds"
                value={p.id}
                defaultChecked={currentPlayerIds.includes(p.id)}
                className="accent-[var(--primary)] w-4 h-4 flex-shrink-0"
              />
              <RoleBadge role={p.role} />
              <span className="font-medium text-[var(--text-primary)] flex-1">{p.name}</span>
              <span className="text-xs text-[var(--text-secondary)]">{p.footballTeam.name}</span>
            </label>
          ))}
        </div>
        {state?.errors?.playerIds && (
          <p className="text-red-500 text-xs mt-1">{state.errors.playerIds[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Capitano *</label>
        <input type="hidden" name="captainPlayerId" value={selectedCaptain} />
        <Dropdown
          value={selectedCaptain}
          onChange={(e) => setSelectedCaptain(e.value)}
          options={captainOptions}
          placeholder="Seleziona capitano"
          className="w-full max-w-sm"
        />
        {state?.errors?.captainPlayerId && (
          <p className="text-red-500 text-xs mt-1">{state.errors.captainPlayerId[0]}</p>
        )}
      </div>

      {state?.message && (
        <p
          className="text-sm font-medium"
          style={{ color: state.message === "Rosa aggiornata." ? "#065F46" : "#991B1B" }}
        >
          {state.message}
        </p>
      )}

      <div>
        <Button
          type="submit"
          label={pending ? "Salvo..." : "Salva rosa"}
          disabled={pending}
        />
      </div>
    </form>
  );
}

