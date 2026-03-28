"use client";

import { useActionState, useState, useMemo } from "react";
import { createFantasyTeam } from "@/app/actions/user/fantasy-teams";

type Player = {
  id: number;
  name: string;
  role: "GK" | "PLAYER";
  footballTeam: { id: number; name: string };
};

export default function CreaSquadraForm({ players }: { players: Player[] }) {
  const [state, action, pending] = useActionState(createFantasyTeam, undefined);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");

  const gks = players.filter((p) => p.role === "GK");
  const outfield = players.filter((p) => p.role === "PLAYER");

  const selectedPlayers = useMemo(
    () => players.filter((p) => selectedIds.includes(p.id)),
    [players, selectedIds]
  );

  const validation = useMemo(() => {
    const gkCount = selectedPlayers.filter((p) => p.role === "GK").length;
    const playerCount = selectedPlayers.filter((p) => p.role === "PLAYER").length;
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

  function togglePlayer(id: number, role: "GK" | "PLAYER") {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (captainId === id) setCaptainId(null);
        return prev.filter((x) => x !== id);
      }
      const gkCount = players.filter((p) => prev.includes(p.id) && p.role === "GK").length;
      const playerCount = players.filter((p) => prev.includes(p.id) && p.role === "PLAYER").length;
      if (prev.length >= 5) return prev;
      if (role === "GK" && gkCount >= 1) return prev;
      if (role === "PLAYER" && playerCount >= 4) return prev;
      return [...prev, id];
    });
  }

  function renderPlayerList(list: Player[], label: string) {
    return (
      <div>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">{label}</h3>
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
              p.role === "GK" &&
              selectedPlayers.some((sp) => sp.role === "GK");
            const playerBlock =
              !selected &&
              p.role === "PLAYER" &&
              selectedPlayers.filter((sp) => sp.role === "PLAYER").length >= 4;
            const countBlock = !selected && selectedIds.length >= 5;
            const disabled = sameTeamBlock || gkBlock || playerBlock || countBlock;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlayer(p.id, p.role)}
                disabled={disabled}
                className={`flex items-center justify-between px-3 py-2 rounded border text-sm text-left transition-colors ${
                  selected
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : disabled
                    ? "opacity-30 bg-zinc-50 border-zinc-200 cursor-not-allowed"
                    : "hover:bg-zinc-50 border-zinc-200"
                }`}
              >
                <span>{p.name}</span>
                <span className={`text-xs ml-2 ${selected ? "text-zinc-300" : "text-zinc-400"}`}>
                  {p.footballTeam.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* Team name */}
      <div>
        <label className="block text-sm font-medium mb-1">Nome squadra *</label>
        <input
          name="name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="input w-full max-w-sm"
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
          <label className="block text-sm font-medium mb-2">Capitano *</label>
          <div className="flex flex-wrap gap-2">
            {selectedPlayers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setCaptainId(p.id)}
                className={`px-3 py-1.5 rounded border text-sm transition-colors ${
                  captainId === p.id
                    ? "bg-yellow-400 border-yellow-400 text-zinc-900 font-semibold"
                    : "border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {captainId === p.id && "★ "}{p.name}
              </button>
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
        <button
          type="submit"
          disabled={!validation.isValid || pending}
          className="btn-primary"
        >
          {pending ? "Salvo..." : "Conferma squadra"}
        </button>
        {!validation.isValid && (
          <p className="text-zinc-400 text-xs mt-2">
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
        ok ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
      }`}
    >
      {ok ? "✓ " : "○ "}{label}
    </span>
  );
}
