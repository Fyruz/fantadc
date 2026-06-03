"use client";

import { useActionState, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { castVote } from "@/app/actions/user/vote";

type Team = { id: number; name: string; countryCode: string | null; logoUrl: string | null };
type Player = {
  id: number;
  name: string;
  role: string;
  footballTeamId: number;
  footballTeam: Team;
};

function TeamLogo({ team, size = 24 }: { team: Team; size?: number }) {
  if (team.logoUrl)
    return <img src={team.logoUrl} alt={team.name} style={{ width: size, height: size, objectFit: "contain" }} />;
  if (team.countryCode)
    return <img src={`https://flagcdn.com/w40/${team.countryCode.toLowerCase()}.png`} alt={team.name} style={{ width: size, height: size * 0.67, objectFit: "contain", borderRadius: 2 }} />;
  return null;
}

export default function VoteForm({
  matchId,
  userVote,
  homeTeam,
  awayTeam,
  players,
}: {
  matchId: number;
  userVote: { playerName: string; team: { id?: number; countryCode: string | null; logoUrl: string | null; name: string } } | null;
  homeTeam: Team | null;
  awayTeam: Team | null;
  players: Player[];
}) {
  const [state, action, pending] = useActionState(castVote, undefined);
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [teamFilter, setTeamFilter] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const playerIdRef = useRef<HTMLInputElement>(null);

  const handleConfirm = () => {
    if (!selectedPlayer || !playerIdRef.current || !formRef.current) return;
    playerIdRef.current.value = String(selectedPlayer.id);
    formRef.current.requestSubmit();
  };

  const filteredPlayers = teamFilter
    ? players.filter((p) => p.footballTeamId === teamFilter)
    : players;

  const outfield = filteredPlayers.filter((p) => p.role !== "P");
  const goalkeepers = filteredPlayers.filter((p) => p.role === "P");

  const votedName = state?.success ? selectedPlayer?.name : userVote?.playerName;
  const votedTeam = state?.success ? selectedPlayer?.footballTeam : userVote?.team;

  return (
    <>
      <form ref={formRef} action={action} style={{ display: "contents" }}>
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="playerId" ref={playerIdRef} />
      </form>

      {/* Selection card */}
      <div
        className="bg-white rounded-3xl p-6 flex flex-col items-center gap-4 text-center"
        style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
      >
        <p className="text-base text-(--text-primary)">Chi sarà il Player of the Match?</p>

        {selectedPlayer ? (
          /* Selected state */
          <>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center" style={{ width: 48, height: 48 }}>
                <TeamLogo team={selectedPlayer.footballTeam} size={40} />
              </div>
              <span className="text-sm font-semibold text-(--text-primary)">{selectedPlayer.name}</span>
              <button
                type="button"
                onClick={() => setSelectOpen(true)}
                className="text-xs text-black/40 underline-offset-2 underline"
              >
                Cambia
              </button>
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={pending}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--primary)" }}
            >
              {pending ? "..." : "Conferma voto"}
            </button>
          </>
        ) : votedName ? (
          /* Already voted state */
          <div className="flex flex-col items-center gap-2">
            {votedTeam && (
              <div className="flex items-center justify-center" style={{ width: 48, height: 48 }}>
                <TeamLogo team={{ id: votedTeam.id ?? 0, ...votedTeam }} size={40} />
              </div>
            )}
            <span className="text-sm font-semibold text-(--text-primary)">{votedName}</span>
          </div>
        ) : (
          /* Default state */
          <>
            <button
              type="button"
              onClick={() => setSelectOpen(true)}
              disabled={pending}
              className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-40"
              style={{ border: "1.5px solid rgba(9,20,76,0.15)" }}
            >
              <i className="pi pi-plus" style={{ color: "var(--primary)", fontSize: 18 }} />
            </button>
            <button
              type="button"
              onClick={() => setSelectOpen(true)}
              disabled={pending}
              className="text-sm font-semibold text-(--text-primary) disabled:opacity-40"
            >
              Seleziona giocatore
            </button>
          </>
        )}

        {state?.success === false && (
          <p className="text-xs text-red-500">{state.message}</p>
        )}
      </div>

      {/* Player selection modal */}
      <Dialog
        visible={selectOpen}
        onHide={() => setSelectOpen(false)}
        header={null}
        closable={false}
        modal
        draggable={false}
        resizable={false}
        style={{ width: "min(500px, 96vw)", maxHeight: "90vh" }}
        contentStyle={{ padding: 0, overflowY: "auto" }}
        pt={{ root: { style: { borderRadius: "24px", overflow: "hidden" } } }}
      >
        <div className="flex flex-col">
          {/* Close + title */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4">
            <p className="text-base text-(--text-primary) flex-1 text-center">Chi sarà il Player of the Match?</p>
            <button type="button" onClick={() => setSelectOpen(false)} className="shrink-0 ml-2">
              <i className="pi pi-times" style={{ fontSize: 14, color: "rgba(9,20,76,0.4)" }} />
            </button>
          </div>

          {/* Team filter pills */}
          {(homeTeam || awayTeam) && (
            <div className="flex gap-3 px-6 pb-5 justify-center flex-wrap">
              {homeTeam && (
                <button
                  type="button"
                  onClick={() => setTeamFilter(teamFilter === homeTeam.id ? null : homeTeam.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    border: `1.5px solid ${teamFilter === homeTeam.id ? "var(--primary)" : "rgba(9,20,76,0.12)"}`,
                    color: teamFilter === homeTeam.id ? "var(--primary)" : "var(--text-primary)",
                    background: teamFilter === homeTeam.id ? "rgba(9,20,76,0.04)" : "white",
                  }}
                >
                  <TeamLogo team={homeTeam} size={20} />
                  {homeTeam.name}
                </button>
              )}
              {awayTeam && (
                <button
                  type="button"
                  onClick={() => setTeamFilter(teamFilter === awayTeam.id ? null : awayTeam.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    border: `1.5px solid ${teamFilter === awayTeam.id ? "var(--primary)" : "rgba(9,20,76,0.12)"}`,
                    color: teamFilter === awayTeam.id ? "var(--primary)" : "var(--text-primary)",
                    background: teamFilter === awayTeam.id ? "rgba(9,20,76,0.04)" : "white",
                  }}
                >
                  <TeamLogo team={awayTeam} size={20} />
                  {awayTeam.name}
                </button>
              )}
            </div>
          )}

          {/* Outfield players */}
          {outfield.length > 0 && (
            <div className="px-6 pb-4">
              <p className="text-sm font-semibold text-(--text-primary) mb-4">Giocatori di movimento</p>
              <div className="grid grid-cols-3 gap-x-4 gap-y-6">
                {outfield.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setSelectedPlayer(p); setSelectOpen(false); }}
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <div className="relative flex items-center justify-center" style={{ width: 48, height: 48 }}>
                      <TeamLogo team={p.footballTeam} size={40} />
                      {selectedPlayer?.id === p.id && (
                        <i className="pi pi-star-fill absolute -top-1 -right-1" style={{ fontSize: 12, color: "#E8A000" }} />
                      )}
                    </div>
                    <span className={`text-xs leading-tight ${selectedPlayer?.id === p.id ? "font-bold text-(--text-primary)" : "text-(--text-primary)"}`}>
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Goalkeepers */}
          {goalkeepers.length > 0 && (
            <div className="px-6 pb-6">
              <p className="text-sm font-semibold text-(--text-primary) mb-4">Portieri</p>
              <div className="grid grid-cols-3 gap-x-4 gap-y-6">
                {goalkeepers.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setSelectedPlayer(p); setSelectOpen(false); }}
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <div className="relative flex items-center justify-center" style={{ width: 48, height: 48 }}>
                      <TeamLogo team={p.footballTeam} size={40} />
                      {selectedPlayer?.id === p.id && (
                        <i className="pi pi-star-fill absolute -top-1 -right-1" style={{ fontSize: 12, color: "#E8A000" }} />
                      )}
                    </div>
                    <span className={`text-xs leading-tight ${selectedPlayer?.id === p.id ? "font-bold text-(--text-primary)" : "text-(--text-primary)"}`}>
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
