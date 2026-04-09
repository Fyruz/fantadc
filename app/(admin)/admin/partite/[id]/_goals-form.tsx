"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { addGoal, deleteGoal } from "@/app/actions/admin/goals";

type Player = {
  id: number;
  name: string;
  role: string;
  footballTeamId: number;
  footballTeam: { name: string };
};

type Goal = {
  id: number;
  scorerId: number;
  isOwnGoal: boolean;
  minute: number | null;
  scorer: { name: string; footballTeam: { name: string } };
};

interface Props {
  matchId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  players: Player[];
  goals: Goal[];
}

export default function GoalsForm({
  matchId,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  players,
  goals,
}: Props) {
  const [state, action, pending] = useActionState(addGoal, undefined);
  const [scorerId, setScorerId] = useState<string>("");
  const [isOwnGoal, setIsOwnGoal] = useState(false);
  const [minute, setMinute] = useState<number | null>(null);

  // Determine which team scored based on selected player
  // For the dropdown: show attacker's team players first (opposite team), then own team
  const selectedPlayer = players.find((p) => String(p.id) === scorerId);
  const selectedTeamId = selectedPlayer?.footballTeamId;

  // Group players: home and away
  const homePlayers = players.filter((p) => p.footballTeamId === homeTeamId);
  const awayPlayers = players.filter((p) => p.footballTeamId === awayTeamId);

  const toOption = (p: Player, suffix?: string) => ({
    label: `${p.name}${suffix ? ` (${suffix})` : ""}`,
    value: String(p.id),
    teamId: p.footballTeamId,
  });

  const playerOptions = [
    { label: homeTeamName, value: "__home", items: homePlayers.map((p) => toOption(p)) },
    { label: awayTeamName, value: "__away", items: awayPlayers.map((p) => toOption(p)) },
  ];

  const goalsHome = goals.filter((g) => {
    const scorer = players.find((p) => p.id === g.scorerId);
    return g.isOwnGoal
      ? scorer?.footballTeamId === awayTeamId   // OG from away counts for home
      : scorer?.footballTeamId === homeTeamId;
  });

  const goalsAway = goals.filter((g) => {
    const scorer = players.find((p) => p.id === g.scorerId);
    return g.isOwnGoal
      ? scorer?.footballTeamId === homeTeamId   // OG from home counts for away
      : scorer?.footballTeamId === awayTeamId;
  });

  const totalGoals = goals.length;
  const expectedGoals = (homeScore ?? 0) + (awayScore ?? 0);
  const mismatch = homeScore !== null && awayScore !== null && totalGoals !== expectedGoals;

  return (
    <div className="card px-4 py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="over-label">Marcatori</div>
        {mismatch && (
          <span
            className="text-[11px] font-bold px-2 py-1 rounded-full"
            style={{ background: "rgba(234,179,8,0.12)", color: "#92400E", border: "1px solid rgba(234,179,8,0.3)" }}
          >
            ⚠ {totalGoals} / {expectedGoals} goal registrati
          </span>
        )}
        {!mismatch && totalGoals > 0 && (
          <span
            className="text-[11px] font-bold px-2 py-1 rounded-full"
            style={{ background: "#ECFDF5", color: "#065F46" }}
          >
            ✓ {totalGoals} / {expectedGoals}
          </span>
        )}
      </div>

      {/* Goal list by team */}
      {goals.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {/* Home goals */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              {homeTeamName}
            </div>
            <div className="flex flex-col gap-1">
              {goalsHome.length === 0 ? (
                <span className="text-xs" style={{ color: "var(--text-disabled)" }}>—</span>
              ) : (
                goalsHome.map((g) => (
                  <GoalRow key={g.id} goal={g} matchId={matchId} players={players} />
                ))
              )}
            </div>
          </div>
          {/* Away goals */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              {awayTeamName}
            </div>
            <div className="flex flex-col gap-1">
              {goalsAway.length === 0 ? (
                <span className="text-xs" style={{ color: "var(--text-disabled)" }}>—</span>
              ) : (
                goalsAway.map((g) => (
                  <GoalRow key={g.id} goal={g} matchId={matchId} players={players} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add goal form */}
      <form action={action} className="flex flex-col gap-3 pt-1" style={{ borderTop: goals.length > 0 ? "1px solid var(--border-soft)" : undefined }}>
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="scorerId" value={scorerId} />
        <input type="hidden" name="isOwnGoal" value={String(isOwnGoal)} />
        <input type="hidden" name="minute" value={minute ?? ""} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Scorer */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
              Marcatore
            </label>
            <Dropdown
              value={scorerId}
              onChange={(e) => { setScorerId(e.value); setIsOwnGoal(false); }}
              options={playerOptions}
              optionGroupLabel="label"
              optionGroupChildren="items"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleziona giocatore..."
              className="w-full"
              filter
            />
            {state?.errors?.scorerId && (
              <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.scorerId[0]}</p>
            )}
          </div>

          {/* Minute */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
              Minuto (opz.)
            </label>
            <InputNumber
              value={minute}
              onValueChange={(e) => setMinute(e.value ?? null)}
              min={1}
              max={120}
              placeholder="—"
              className="w-full"
              inputClassName="w-full"
            />
          </div>
        </div>

        {/* Autogoal toggle */}
        {scorerId && (
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              className="w-4 h-4 rounded"
              checked={isOwnGoal}
              onChange={(e) => setIsOwnGoal(e.target.checked)}
            />
            <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Autogoal
              {selectedPlayer && (
                <span className="font-normal ml-1" style={{ color: "var(--text-muted)" }}>
                  (segna per {isOwnGoal
                    ? selectedPlayer.footballTeamId === homeTeamId ? awayTeamName : homeTeamName
                    : selectedPlayer.footballTeam.name
                  })
                </span>
              )}
            </span>
          </label>
        )}

        {state?.message && (
          <p className="text-xs" style={{ color: "#991B1B" }}>{state.message}</p>
        )}

        <Button
          type="submit"
          label={pending ? "Aggiungo..." : "Aggiungi goal"}
          icon="pi pi-plus"
          severity="secondary"
          disabled={pending || !scorerId}
          className="w-full sm:w-auto"
        />
      </form>
    </div>
  );
}

function GoalRow({ goal, matchId, players }: { goal: Goal; matchId: number; players: Player[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
      style={{ background: "var(--surface-1)", border: "1px solid var(--border-soft)" }}
    >
      {goal.minute && (
        <span className="text-[10px] font-black tabular-nums flex-shrink-0" style={{ color: "var(--text-disabled)" }}>
          {goal.minute}&apos;
        </span>
      )}
      <span className="text-xs font-semibold flex-1 truncate" style={{ color: "var(--text-primary)" }}>
        {goal.scorer.name}
        {goal.isOwnGoal && (
          <span className="ml-1 text-[9px] font-black px-1 py-0.5 rounded" style={{ background: "#FEF2F2", color: "#991B1B" }}>
            AG
          </span>
        )}
      </span>
      <form ref={formRef} action={deleteGoal as unknown as (fd: FormData) => void} className="flex-shrink-0">
        <input type="hidden" name="id" value={goal.id} />
        <input type="hidden" name="matchId" value={matchId} />
        <button
          type="submit"
          className="w-6 h-6 flex items-center justify-center rounded-full transition-colors"
          style={{ color: "var(--text-disabled)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-disabled)")}
          title="Rimuovi"
        >
          <i className="pi pi-times text-[10px]" />
        </button>
      </form>
    </div>
  );
}
