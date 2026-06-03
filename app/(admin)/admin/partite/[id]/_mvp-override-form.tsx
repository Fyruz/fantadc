"use client";

import { useActionState, useState } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { updateMatchMvpOverride } from "@/app/actions/admin/matches";

type PlayerOption = {
  id: number;
  name: string;
  footballTeamName: string;
};

type VoteRow = PlayerOption & {
  votes: number;
};

export default function MvpOverrideForm({
  matchId,
  currentPlayerId,
  players,
  voteRows,
  statusLabel,
}: {
  matchId: number;
  currentPlayerId: number | null;
  players: PlayerOption[];
  voteRows: VoteRow[];
  statusLabel: string;
}) {
  const [state, action, pending] = useActionState(updateMatchMvpOverride, undefined);
  const [playerId, setPlayerId] = useState<number | null>(currentPlayerId);

  const options = [
    { label: "Nessun MVP manuale", value: null },
    ...players.map((player) => ({
      label: `${player.name} - ${player.footballTeamName}`,
      value: player.id,
    })),
  ];

  return (
    <div className="card p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="over-label">MVP partita</div>
          <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            {statusLabel}
          </p>
        </div>
        {currentPlayerId && (
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide"
            style={{ background: "rgba(232,160,0,0.12)", color: "#A96500" }}
          >
            Override admin
          </span>
        )}
      </div>

      {voteRows.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-[var(--border-soft)]">
          {voteRows.map((row, index) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
              style={index < voteRows.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : undefined}
            >
              <div className="min-w-0">
                <div className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>{row.name}</div>
                <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{row.footballTeamName}</div>
              </div>
              <span className="font-display font-black tabular-nums" style={{ color: "var(--primary)" }}>
                {row.votes}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl px-3 py-2 text-sm" style={{ background: "var(--surface-1)", color: "var(--text-muted)" }}>
          Nessun voto registrato per questa partita.
        </p>
      )}

      <form action={action} className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="playerId" value={playerId ?? ""} />
        <Dropdown
          value={playerId}
          options={options}
          onChange={(event) => setPlayerId(event.value)}
          placeholder="Seleziona MVP manuale"
          className="w-full"
        />
        <Button
          type="submit"
          label={pending ? "Salvataggio..." : "Salva MVP"}
          icon="pi pi-star"
          disabled={pending}
        />
      </form>

      {state?.message && <p className="text-sm" style={{ color: "#991B1B" }}>{state.message}</p>}
    </div>
  );
}
