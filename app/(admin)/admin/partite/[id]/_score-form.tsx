"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Button } from "primereact/button";
import { updateMatchScore } from "@/app/actions/admin/matches";

interface Props {
  matchId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-full" style={{ color: "var(--text-disabled)" }}>
        {label}
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 transition-colors select-none"
          style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
        >
          −
        </button>
        <span
          className="font-display font-black text-4xl w-10 text-center leading-none select-none tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(99, value + 1))}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 transition-colors select-none"
          style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function ScoreForm({ matchId, homeTeamName, awayTeamName, homeScore, awayScore }: Props) {
  const [state, action, pending] = useActionState(updateMatchScore, undefined);
  const [home, setHome] = useState(homeScore ?? 0);
  const [away, setAway] = useState(awayScore ?? 0);

  return (
    <form action={action} className="card px-5 py-4">
      <div className="over-label mb-4">Risultato</div>
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="homeScore" value={home} />
      <input type="hidden" name="awayScore" value={away} />

      <div className="flex items-center justify-center gap-4">
        <div className="flex-1 flex justify-center">
          <Stepper label={homeTeamName} value={home} onChange={setHome} />
        </div>
        <span className="font-display font-black text-3xl flex-shrink-0" style={{ color: "var(--text-disabled)" }}>—</span>
        <div className="flex-1 flex justify-center">
          <Stepper label={awayTeamName} value={away} onChange={setAway} />
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <Button
          type="submit"
          label={pending ? "Salvo..." : "Salva risultato"}
          disabled={pending}
          icon="pi pi-check"
          className="w-full sm:w-auto"
        />
        {state?.message && (
          <p className="text-xs text-center" style={{ color: "#991B1B" }}>{state.message}</p>
        )}
      </div>
    </form>
  );
}
