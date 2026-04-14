"use client";

import { useActionState } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { useState } from "react";
import { initBracket, assignKnockoutTeams, deleteBracket } from "@/app/actions/admin/knockout";
import type { ActionResult } from "@/app/actions/admin/football-teams";

/* ── Init bracket ───────────────────────────────────────────────── */
export function InitBracketForm() {
  const [state, action, pending] = useActionState(initBracket, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      {state?.message && <p className="text-sm" style={{ color: "#991B1B" }}>{state.message}</p>}
      <Button
        type="submit"
        label={pending ? "Inizializzazione..." : "Inizializza bracket"}
        icon="pi pi-sitemap"
        disabled={pending}
        size="small"
      />
    </form>
  );
}

/* ── Delete bracket ─────────────────────────────────────────────── */
export function DeleteBracketForm() {
  const [state, action, pending] = useActionState(deleteBracket, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      {state?.message && <p className="text-sm" style={{ color: "#991B1B" }}>{state.message}</p>}
      <Button
        type="submit"
        label={pending ? "..." : "Elimina bracket"}
        severity="danger"
        outlined
        disabled={pending}
        size="small"
      />
    </form>
  );
}

/* ── Assign knockout teams ──────────────────────────────────────── */
type FootballTeam = { id: number; name: string; shortName: string | null };

export function AssignTeamsForm({ matchId, teams }: { matchId: number; teams: FootballTeam[] }) {
  const [state, action, pending] = useActionState(assignKnockoutTeams, undefined);
  const [homeId, setHomeId] = useState<number | null>(null);
  const [awayId, setAwayId] = useState<number | null>(null);

  const options = teams.map((t) => ({ label: t.name, value: t.id }));

  return (
    <form action={action} className="flex flex-col gap-2 mt-2">
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="homeTeamId" value={homeId ?? ""} />
      <input type="hidden" name="awayTeamId" value={awayId ?? ""} />
      <div className="grid grid-cols-2 gap-2">
        <Dropdown options={options} value={homeId} onChange={(e) => setHomeId(e.value)} placeholder="Casa" className="w-full" filter />
        <Dropdown options={options} value={awayId} onChange={(e) => setAwayId(e.value)} placeholder="Trasferta" className="w-full" filter />
      </div>
      {state?.message && <p className="text-xs" style={{ color: "#991B1B" }}>{state.message}</p>}
      <Button type="submit" label={pending ? "..." : "Assegna squadre"} disabled={pending || !homeId || !awayId} size="small" icon="pi pi-check" />
    </form>
  );
}
