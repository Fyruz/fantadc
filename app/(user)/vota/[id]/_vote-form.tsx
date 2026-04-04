"use client";

import { useActionState } from "react";
import { castVote } from "@/app/actions/user/vote";

type Player = { id: number; name: string; footballTeam: { name: string } };

export default function VoteForm({ matchId, players }: { matchId: number; players: Player[] }) {
  const [state, action, pending] = useActionState(castVote, undefined);

  if (state?.success) {
    return (
      <div className="card p-8 text-center">
        <div className="text-3xl mb-2">✓</div>
        <div className="font-display font-black text-lg uppercase" style={{ color: "#065F46" }}>
          VOTO REGISTRATO!
        </div>
        <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Il risultato sarà visibile alla chiusura della finestra di voto.
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="matchId" value={matchId} />
      {players.map((p) => (
        <button
          key={p.id}
          type="submit"
          name="playerId"
          value={p.id}
          disabled={pending}
          className="card px-4 py-3.5 flex items-center justify-between text-left w-full transition-colors hover:bg-[var(--surface-1)] active:bg-[var(--surface-2)] disabled:opacity-50"
        >
          <span className="font-display font-black text-[13px] uppercase" style={{ color: "var(--text-primary)" }}>
            {p.name}
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{p.footballTeam.name}</span>
        </button>
      ))}
      {state?.success === false && (
        <p className="text-sm text-center" style={{ color: "#EF4444" }}>{state.message}</p>
      )}
    </form>
  );
}
