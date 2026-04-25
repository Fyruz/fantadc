"use client";

import { useActionState, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { castVote } from "@/app/actions/user/vote";

type Player = { id: number; name: string; footballTeam: { name: string } };

export default function VoteForm({ matchId, players }: { matchId: number; players: Player[] }) {
  const [state, action, pending] = useActionState(castVote, undefined);
  const [pendingPlayer, setPendingPlayer] = useState<Player | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const playerIdRef = useRef<HTMLInputElement>(null);

  const handleConfirm = () => {
    if (!pendingPlayer || !playerIdRef.current || !formRef.current) return;
    playerIdRef.current.value = String(pendingPlayer.id);
    setPendingPlayer(null);
    formRef.current.requestSubmit();
  };

  if (state?.success) {
    return (
      <div className="card p-8 text-center">
        <div className="text-3xl mb-2">✓</div>
        <div className="font-display font-black text-lg uppercase" style={{ color: "#065F46" }}>
          VOTO REGISTRATO!
        </div>
        <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Il risultato sarà visibile alla chiusura della finestra di voto.
        </div>
      </div>
    );
  }

  return (
    <>
      <form ref={formRef} action={action} className="flex flex-col gap-2">
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="playerId" ref={playerIdRef} />
        {players.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={pending}
            onClick={() => setPendingPlayer(p)}
            className="card px-4 py-3.5 flex items-center justify-between text-left w-full transition-colors hover:bg-[var(--surface-1)] active:bg-[var(--surface-2)] disabled:opacity-50"
          >
            <span className="font-display font-black text-[13px] uppercase" style={{ color: "var(--text-primary)" }}>
              {p.name}
            </span>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{p.footballTeam.name}</span>
          </button>
        ))}
        {state?.success === false && (
          <p className="text-sm text-center" style={{ color: "#EF4444" }}>{state.message}</p>
        )}
      </form>

      <Dialog
        visible={!!pendingPlayer}
        onHide={() => setPendingPlayer(null)}
        header={null}
        closable={false}
        modal
        draggable={false}
        resizable={false}
        style={{ width: "min(22rem, 92vw)" }}
        contentStyle={{ padding: 0 }}
        pt={{ root: { style: { borderRadius: "20px", overflow: "hidden" } } }}
      >
        <div className="px-6 pt-6 pb-2 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(232,160,0,0.12)" }}
          >
            <i className="pi pi-star-fill text-xl" style={{ color: "#E8A000" }} />
          </div>
          <div className="font-display font-black text-lg uppercase mb-1" style={{ color: "var(--text-primary)" }}>
            Conferma voto MVP
          </div>
          <p className="text-sm leading-5" style={{ color: "var(--text-muted)" }}>
            Stai per votare
          </p>
          <p className="font-display font-black text-base uppercase mt-1" style={{ color: "var(--primary)" }}>
            {pendingPlayer?.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-disabled)" }}>
            {pendingPlayer?.footballTeam.name}
          </p>
        </div>
        <div className="flex gap-2 px-4 pt-4 pb-5">
          <Button
            label="Annulla"
            outlined
            className="flex-1"
            onClick={() => setPendingPlayer(null)}
          />
          <Button
            label="Vota"
            className="flex-1"
            loading={pending}
            onClick={handleConfirm}
          />
        </div>
      </Dialog>
    </>
  );
}
