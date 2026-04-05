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

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 transition-colors select-none"
        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.color = "var(--primary)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
      >
        −
      </button>
      <span
        className="font-display font-black text-5xl w-12 text-center leading-none select-none"
        style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(99, value + 1))}
        className="w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 transition-colors select-none"
        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.color = "var(--primary)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
      >
        +
      </button>
    </div>
  );
}

export default function ScoreForm({ matchId, homeTeamName, awayTeamName, homeScore, awayScore }: Props) {
  const [state, action, pending] = useActionState(updateMatchScore, undefined);
  const [home, setHome] = useState(homeScore ?? 0);
  const [away, setAway] = useState(awayScore ?? 0);

  return (
    <form action={action} className="card p-4">
      <p className="over-label mb-4">Risultato partita</p>
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="homeScore" value={home} />
      <input type="hidden" name="awayScore" value={away} />

      <div className="flex items-center justify-center gap-4">
        {/* Casa */}
        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide truncate w-full text-center" style={{ color: "var(--text-muted)" }}>
            {homeTeamName}
          </p>
          <Stepper value={home} onChange={setHome} />
        </div>

        <span className="font-display font-black text-3xl flex-shrink-0 pb-1" style={{ color: "var(--text-disabled)" }}>
          —
        </span>

        {/* Ospite */}
        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide truncate w-full text-center" style={{ color: "var(--text-muted)" }}>
            {awayTeamName}
          </p>
          <Stepper value={away} onChange={setAway} />
        </div>
      </div>

      {state?.message && (
        <p className="text-xs mt-3 text-center" style={{ color: "#991B1B" }}>{state.message}</p>
      )}

      <div className="mt-4">
        <Button
          type="submit"
          label={pending ? "Salvo..." : "Salva risultato"}
          disabled={pending}
          size="small"
          className="w-full"
        />
      </div>
    </form>
  );
}
