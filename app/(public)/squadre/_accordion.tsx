"use client";

import { Accordion, AccordionTab } from "primereact/accordion";
import RoleBadge from "@/components/role-badge";

type Player = { id: number; name: string; role: string };
type Team = {
  id: number;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
  players: Player[];
};

export default function SquadreAccordion({ teams }: { teams: Team[] }) {
  return (
    <Accordion multiple className="flex flex-col gap-2">
      {teams.map((team) => {
        const header = (
          <div className="flex items-center gap-3 w-full">
            {team.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={team.logoUrl} alt={team.name} className="w-7 h-7 object-contain flex-shrink-0" />
            ) : (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs flex-shrink-0"
                style={{ background: "var(--primary)" }}
              >
                {team.shortName ?? team.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-display font-black text-sm uppercase flex-1 leading-tight" style={{ color: "var(--text-primary)" }}>
              {team.name}
            </span>
            <span className="text-xs font-semibold flex-shrink-0 mr-2" style={{ color: "var(--text-muted)" }}>
              {team.players.length} {team.players.length === 1 ? "giocatore" : "giocatori"}
            </span>
          </div>
        );

        return (
          <AccordionTab key={team.id} header={header}>
            {team.players.length === 0 ? (
              <p className="text-sm py-2 text-center" style={{ color: "var(--text-muted)" }}>
                Nessun giocatore in rosa.
              </p>
            ) : (
              <div className="flex flex-col">
                {team.players.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 py-2"
                    style={{ borderBottom: idx < team.players.length - 1 ? "1px solid var(--border-soft)" : undefined }}
                  >
                    <RoleBadge role={p.role} />
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </AccordionTab>
        );
      })}
    </Accordion>
  );
}
