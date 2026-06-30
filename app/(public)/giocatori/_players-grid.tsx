"use client";

import { useState } from "react";
import RoleBadge from "@/components/role-badge";
import PlayerDialog from "@/components/player-dialog";
import { resolveTeamFlag } from "@/lib/flags";
import type { PublicPlayerGridRow } from "@/lib/data/public/players";

type Group = { teamName: string; players: PublicPlayerGridRow[] };

export default function PlayersGrid({ groups }: { groups: Group[] }) {
  const [selected, setSelected] = useState<PublicPlayerGridRow | null>(null);

  return (
    <>
      {selected && (
        <PlayerDialog player={selected} onHide={() => setSelected(null)} />
      )}

      <div className="flex flex-col gap-6">
        {groups.map(({ teamName, players }) => (
          <div
            key={teamName}
            className="bg-white rounded-3xl overflow-hidden"
            style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
          >
            <div className="p-6 flex flex-col gap-5">
              {/* Team header */}
              <div className="flex items-center gap-3">
                {(() => {
                  const t = players[0]?.footballTeam;
                  if (!t) return null;
                  const src = resolveTeamFlag(t);
                  if (!src) return null;
                  return (
                    <div className="shrink-0 flex items-center justify-center" style={{ width: 32, height: 32, padding: 4 }}>
                      <img src={src} alt={teamName} className="w-full h-full object-contain" />
                    </div>
                  );
                })()}
                <span className="text-base font-normal text-black">
                  {teamName}
                </span>
              </div>

              {/* Player list */}
              <div className="flex flex-col gap-3">
                {players.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="flex items-center gap-3 text-left w-full"
                    onClick={() => setSelected(p)}
                  >
                    <RoleBadge role={p.role} />
                    <span className="text-sm flex-1 truncate text-black">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
