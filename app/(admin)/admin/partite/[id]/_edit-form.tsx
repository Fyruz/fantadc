"use client";

import { useActionState } from "react";
import { updateMatch } from "@/app/actions/admin/matches";

type Team = { id: number; name: string };
type Match = { id: number; homeTeamId: number; awayTeamId: number; startsAt: Date; status: string };

export default function EditMatchForm({ match, teams }: { match: Match; teams: Team[] }) {
  const [state, action, pending] = useActionState(updateMatch, undefined);
  const startsAtLocal = new Date(match.startsAt.getTime() - match.startsAt.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={match.id} />
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-40">
          <label className="block text-sm font-medium mb-1">Squadra casa</label>
          <select name="homeTeamId" defaultValue={match.homeTeamId} className="input w-full" required>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-40">
          <label className="block text-sm font-medium mb-1">Squadra ospite</label>
          <select name="awayTeamId" defaultValue={match.awayTeamId} className="input w-full" required>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-40">
          <label className="block text-sm font-medium mb-1">Data e ora</label>
          <input name="startsAt" type="datetime-local" defaultValue={startsAtLocal} className="input w-full" required />
        </div>
        <div className="flex-1 min-w-32">
          <label className="block text-sm font-medium mb-1">Stato</label>
          <select name="status" defaultValue={match.status} className="input w-full">
            <option value="DRAFT">DRAFT</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="CONCLUDED">CONCLUDED</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
        </div>
      </div>
      {state?.errors?.awayTeamId && <p className="text-red-500 text-sm">{state.errors.awayTeamId[0]}</p>}
      {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
      <div>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Salvo..." : "Salva modifiche"}
        </button>
      </div>
    </form>
  );
}
