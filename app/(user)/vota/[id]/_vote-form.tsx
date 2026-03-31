"use client";

import { useActionState } from "react";
import { castVote } from "@/app/actions/user/vote";

type Player = { id: number; name: string; footballTeam: { name: string } };

export default function VoteForm({
  matchId,
  players,
}: {
  matchId: number;
  players: Player[];
}) {
  const [state, action, pending] = useActionState(castVote, undefined);

  if (state?.success) {
    return (
      <div className="text-center py-8">
        <p className="text-2xl mb-2">✓</p>
        <p className="font-semibold text-green-700">Voto registrato!</p>
        <p className="text-zinc-500 text-sm mt-1">
          Il risultato finale sarà visibile alla chiusura della finestra di voto.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="matchId" value={matchId} />
      {players.map((p) => (
        <button
          key={p.id}
          type="submit"
          name="playerId"
          value={p.id}
          disabled={pending}
          className="flex items-center justify-between admin-card px-4 py-3 text-left w-full hover:bg-[#F0F1FC] active:bg-[#E8E9F8] transition-colors disabled:opacity-50"
        >
          <span className="font-medium text-sm text-[#111827]">{p.name}</span>
          <span className="text-xs text-[#6B7280]">{p.footballTeam.name}</span>
        </button>
      ))}
      {state?.success === false && (
        <p className="text-red-500 text-sm text-center">{state.message}</p>
      )}
    </form>
  );
}
