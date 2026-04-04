"use client";

import { useActionState, useState, useMemo } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { createFantasyTeam } from "@/app/actions/user/fantasy-teams";

type Player = {
  id: number;
  name: string;
  role: "P" | "A";
  footballTeam: { id: number; name: string };
};

export default function CreaSquadraForm({ players }: { players: Player[] }) {
  const [state, action, pending] = useActionState(createFantasyTeam, undefined);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");

  const gks = players.filter((p) => p.role === "P");
  const outfield = players.filter((p) => p.role === "A");

  const selectedPlayers = useMemo(
    () => players.filter((p) => selectedIds.includes(p.id)),
    [players, selectedIds]
  );

  const validation = useMemo(() => {
    const gkCount = selectedPlayers.filter((p) => p.role === "P").length;
    const playerCount = selectedPlayers.filter((p) => p.role === "A").length;
    const teamIds = selectedPlayers.map((p) => p.footballTeam.id);
    const uniqueTeams = new Set(teamIds).size;
    const captainOk = captainId !== null && selectedIds.includes(captainId);

    return {
      count: selectedIds.length,
      gkOk: gkCount === 1,
      playerOk: playerCount === 4,
      teamsOk: uniqueTeams === selectedIds.length,
      captainOk,
      nameOk: teamName.trim().length >= 1,
      isValid:
        selectedIds.length === 5 &&
        gkCount === 1 &&
        playerCount === 4 &&
        uniqueTeams === 5 &&
        captainOk &&
        teamName.trim().length >= 1,
    };
  }, [selectedIds, selectedPlayers, captainId, teamName]);

  function togglePlayer(id: number, role: "P" | "A") {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (captainId === id) setCaptainId(null);
        return prev.filter((x) => x !== id);
      }
      const gkCount = players.filter((p) => prev.includes(p.id) && p.role === "P").length;
      const playerCount = players.filter((p) => prev.includes(p.id) && p.role === "A").length;
      if (prev.length >= 5) return prev;
      if (role === "P" && gkCount >= 1) return prev;
      if (role === "A" && playerCount >= 4) return prev;
      return [...prev, id];
    });
  }

  function renderPlayerList(list: Player[], label: string) {
    return (
      <div>
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{label}</h3>
        <div className="flex flex-col gap-1">
          {list.map((p) => {
            const selected = selectedIds.includes(p.id);
            const sameTeamBlock =
              !selected &&
              selectedPlayers.some(
                (sp) => sp.footballTeam.id === p.footballTeam.id
              );
            const gkBlock =
              !selected &&
              p.role === "P" &&
              selectedPlayers.some((sp) => sp.role === "P");
            const playerBlock =
              !selected &&
              p.role === "A" &&
              selectedPlayers.filter((sp) => sp.role === "A").length >= 4;
            const countBlock = !selected && selectedIds.length >= 5;
            const disabled = sameTeamBlock || gkBlock || playerBlock || countBlock;

            return (
              <Button
                key={p.id}
                unstyled
                type="button"
                onClick={() => togglePlayer(p.id, p.role)}
                disabled={disabled}
                className={`flex items-center justify-between px-3 py-2 rounded border text-sm text-left transition-colors w-full ${
                  selected
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : disabled
                    ? "opacity-30 bg-[var(--bg-base)] border-[var(--border-soft)] cursor-not-allowed"
                    : "hover:bg-[var(--bg-base)] border-[var(--border-soft)]"
                }`}
              >
                <span>{p.name}</span>
                <span className={`text-xs ml-2 ${selected ? "text-white/70" : "text-[var(--text-muted)]"}`}>
                  {p.footballTeam.name}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Nome squadra *</label>
        <InputText
          name="name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full max-w-sm"
          placeholder="es. I Guerrieri"
          maxLength={40}
          required
        />
        {state?.success === false && state.errors?.name && (
          <p className="text-red-500 text-sm mt-1">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Validation status */}
      <div className="flex flex-wrap gap-2 text-xs">
        <StatusBadge ok={validation.gkOk} label="1 Portiere" />
        <StatusBadge ok={validation.playerOk} label="4 Giocatori" />
        <StatusBadge ok={validation.teamsOk} label="5 squadre diverse" />
        <StatusBadge ok={validation.captainOk} label="Capitano scelto" />
      </div>

      {/* Player selection */}
      <div className="grid md:grid-cols-2 gap-6">
        {renderPlayerList(gks, "Portieri")}
        {renderPlayerList(outfield, "Giocatori di movimento")}
      </div>

      {/* Hidden inputs for selected players */}
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="playerIds" value={id} />
      ))}

      {/* Captain selection */}
      {selectedPlayers.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Capitano *</label>
          <div className="flex flex-wrap gap-2">
            {selectedPlayers.map((p) => (
              <Button
                key={p.id}
                unstyled
                type="button"
                onClick={() => setCaptainId(p.id)}
                className={`px-3 py-1.5 rounded border text-sm transition-colors ${
                  captainId === p.id
                    ? "bg-yellow-400 border-yellow-400 text-[var(--text-primary)] font-semibold"
                    : "border-[var(--border-soft)] hover:bg-[var(--bg-base)]"
                }`}
              >
                {captainId === p.id && "★ "}{p.name}
              </Button>
            ))}
          </div>
          {state?.success === false && state.errors?.captainPlayerId && (
            <p className="text-red-500 text-sm mt-1">{state.errors.captainPlayerId[0]}</p>
          )}
        </div>
      )}

      <input type="hidden" name="captainPlayerId" value={captainId ?? ""} />

      {state?.success === false && state.message && (
        <p className="text-red-500 text-sm">{state.message}</p>
      )}

      <div>
        <Button
          type="submit"
          label={pending ? "Salvo..." : "Conferma squadra"}
          disabled={!validation.isValid || pending}
          className="w-full md:w-auto"
        />
        {!validation.isValid && (
          <p className="text-[var(--text-muted)] text-xs mt-2">
            Completa la selezione prima di confermare.
          </p>
        )}
      </div>
    </form>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${
        ok ? "" : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
      }`}
      style={ok ? { background: 'rgba(50,215,75,0.12)', color: '#32D74B' } : undefined}
    >
      {ok ? "✓ " : "○ "}{label}
    </span>
  );
}
