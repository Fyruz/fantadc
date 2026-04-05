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
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 transition-colors select-none"
        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.color = "var(--primary)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
      >
        −
      </button>
      <span
        className="font-display font-black text-3xl w-8 text-center leading-none select-none"
        style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(99, value + 1))}
        className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 transition-colors select-none"
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
    <form action={action} className="card px-4 py-3">
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="homeScore" value={home} />
      <input type="hidden" name="awayScore" value={away} />

      <div className="flex items-center gap-2">
        {/* Casa */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wide truncate mb-1.5" style={{ color: "var(--text-disabled)" }}>
            {homeTeamName}
          </p>
          <Stepper value={home} onChange={setHome} />
        </div>

        <span className="font-display font-black text-xl flex-shrink-0" style={{ color: "var(--text-disabled)" }}>—</span>

        {/* Ospite */}
        <div className="flex-1 min-w-0 flex flex-col items-end">
          <p className="text-[9px] font-bold uppercase tracking-wide truncate mb-1.5 text-right w-full" style={{ color: "var(--text-disabled)" }}>
            {awayTeamName}
          </p>
          <Stepper value={away} onChange={setAway} />
        </div>

        {/* Save inline */}
        <Button
          type="submit"
          label={pending ? "..." : "Salva"}
          disabled={pending}
          size="small"
          className="flex-shrink-0 ml-1"
        />
      </div>

      {state?.message && (
        <p className="text-xs mt-2" style={{ color: "#991B1B" }}>{state.message}</p>
      )}
    </form>
  );
}
