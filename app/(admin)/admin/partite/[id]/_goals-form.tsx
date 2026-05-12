"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
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
  scorer: { name: string; footballTeam: { name: string } };
};

interface Props {
  matchId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  players: Player[];
  goals: Goal[];
}

export default function GoalsForm({
  matchId,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  players,
  goals,
}: Props) {
  const [scorerId, setScorerId] = useState<string>("");
  const [isOwnGoal, setIsOwnGoal] = useState(false);
  const [state, action, pending] = useActionState(
    async (prevState: Awaited<ReturnType<typeof addGoal>> | undefined, formData: FormData) => {
      const nextState = await addGoal(prevState, formData);

      if (!nextState?.message && !nextState?.errors) {
        setScorerId("");
        setIsOwnGoal(false);
      }

      return nextState;
    },
    undefined
  );

  // Determine which team scored based on selected player
  // For the dropdown: show attacker's team players first (opposite team), then own team
  const selectedPlayer = players.find((p) => String(p.id) === scorerId);

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

  return (
    <div className="card px-4 py-4 flex flex-col gap-4">
      <ConfirmPopup />
      <div className="over-label">Marcatori</div>

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
                    <GoalRow key={g.id} goal={g} matchId={matchId} />
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
                    <GoalRow key={g.id} goal={g} matchId={matchId} />
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

        <div>
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

function GoalRow({ goal, matchId }: { goal: Goal; matchId: number }) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleDelete = (e: React.MouseEvent<HTMLElement>) => {
    confirmPopup({
      target: e.currentTarget,
      message: `Eliminare il goal di ${goal.scorer.name}?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì",
      rejectLabel: "No",
      accept: () => formRef.current?.requestSubmit(),
    });
  };

  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
      style={{ background: "var(--surface-1)", border: "1px solid var(--border-soft)" }}
    >
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
        <Button
          type="button"
          icon="pi pi-times"
          text
          rounded
          severity="secondary"
          aria-label="Rimuovi goal"
          title="Rimuovi"
          onClick={handleDelete}
        />
      </form>
    </div>
  );
}
