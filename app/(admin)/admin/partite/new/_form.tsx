"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { createMatch } from "@/app/actions/admin/matches";

type Team = { id: number; name: string };
type Group = { id: number; name: string; slug: string };
type Round = { id: number; name: string };

const STATUS_OPTIONS = [
  { label: "Bozza",       value: "DRAFT"      },
  { label: "Programmata", value: "SCHEDULED"  },
];

const PHASE_OPTIONS = [
  { label: "Nessuna (amichevole)", value: "" },
  { label: "Girone", value: "group" },
  { label: "Eliminazione diretta", value: "knockout" },
];

export default function NuovaPartitaForm({
  teams,
  groups,
  rounds,
  defaultGroupId,
  defaultKnockoutRoundId,
}: {
  teams: Team[];
  groups: Group[];
  rounds: Round[];
  defaultGroupId: number | null;
  defaultKnockoutRoundId: number | null;
}) {
  const [state, action, pending] = useActionState(createMatch, undefined);
  const [homeTeamId, setHomeTeamId] = useState<string>("");
  const [awayTeamId, setAwayTeamId] = useState<string>("");
  const [status, setStatus]         = useState<string>("DRAFT");
  const [date, setDate]             = useState<Date | null>(null);
  const [time, setTime]             = useState<Date | null>(null);
  const [phase, setPhase] = useState<string>(
    defaultGroupId ? "group" : defaultKnockoutRoundId ? "knockout" : ""
  );
  const [groupId, setGroupId] = useState<string>(defaultGroupId ? String(defaultGroupId) : "");
  const [knockoutRoundId, setKnockoutRoundId] = useState<string>(
    defaultKnockoutRoundId ? String(defaultKnockoutRoundId) : ""
  );

  const allTeamOptions = teams.map((t) => ({ label: t.name, value: String(t.id) }));
  const homeOptions    = allTeamOptions.filter((t) => t.value !== awayTeamId);
  const awayOptions    = allTeamOptions.filter((t) => t.value !== homeTeamId);

  const needsDateTime = status !== "DRAFT";

  const formattedDate = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";
  const formattedTime = time
    ? `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`
    : "";

  const groupOptions = groups.map((g) => ({ label: `Girone ${g.slug} — ${g.name}`, value: String(g.id) }));
  const roundOptions = rounds.map((r) => ({ label: r.name, value: String(r.id) }));

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="groupId" value={phase === "group" ? groupId : ""} />
      <input type="hidden" name="knockoutRoundId" value={phase === "knockout" ? knockoutRoundId : ""} />

      {/* Fase */}
      <div className="max-w-xs">
        <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Fase del torneo
        </label>
        <Dropdown
          value={phase}
          onChange={(e) => { setPhase(e.value); setGroupId(""); setKnockoutRoundId(""); }}
          options={PHASE_OPTIONS}
          className="w-full"
        />
      </div>

      {phase === "group" && (
        <div className="max-w-xs">
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Girone *
          </label>
          <Dropdown value={groupId} onChange={(e) => setGroupId(e.value)} options={groupOptions} className="w-full" placeholder="Seleziona girone" />
        </div>
      )}

      {phase === "knockout" && (
        <div className="max-w-xs">
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Turno eliminazione *
          </label>
          <Dropdown value={knockoutRoundId} onChange={(e) => setKnockoutRoundId(e.value)} options={roundOptions} className="w-full" placeholder="Seleziona turno" />
        </div>
      )}

      {/* Squadre */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Squadra casa *
          </label>
          <input type="hidden" name="homeTeamId" value={homeTeamId} />
          <Dropdown
            value={homeTeamId}
            onChange={(e) => setHomeTeamId(e.value)}
            options={homeOptions}
            placeholder="Seleziona squadra"
            className="w-full"
            filter
          />
          {state?.errors?.homeTeamId && (
            <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.homeTeamId[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Squadra ospite *
          </label>
          <input type="hidden" name="awayTeamId" value={awayTeamId} />
          <Dropdown
            value={awayTeamId}
            onChange={(e) => setAwayTeamId(e.value)}
            options={awayOptions}
            placeholder="Seleziona squadra"
            className="w-full"
            filter
          />
          {state?.errors?.awayTeamId && (
            <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.awayTeamId[0]}</p>
          )}
        </div>
      </div>

      {/* Stato */}
      <div className="max-w-xs">
        <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Stato
        </label>
        <input type="hidden" name="status" value={status} />
        <Dropdown
          value={status}
          onChange={(e) => setStatus(e.value)}
          options={STATUS_OPTIONS}
          className="w-full"
        />
      </div>

      {/* Data e ora — solo se non bozza */}
      {needsDateTime && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Data *
            </label>
            <input type="hidden" name="date" value={formattedDate} />
            <Calendar
              value={date}
              onChange={(e) => setDate(e.value as Date | null)}
              dateFormat="dd/mm/yy"
              showIcon
              className="w-full"
              inputClassName="w-full"
              showButtonBar
            />
            {state?.errors?.date && (
              <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.date[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Ora *
            </label>
            <input type="hidden" name="time" value={formattedTime} />
            <Calendar
              value={time}
              onChange={(e) => setTime(e.value as Date | null)}
              timeOnly
              showIcon
              className="w-full"
              inputClassName="w-full"
              hourFormat="24"
            />
            {state?.errors?.time && (
              <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.time[0]}</p>
            )}
          </div>
        </div>
      )}

      {state?.message && (
        <p className="text-xs" style={{ color: "#991B1B" }}>{state.message}</p>
      )}

      <div>
        <Button type="submit" label={pending ? "Salvo..." : "Crea partita"} disabled={pending} icon="pi pi-check" />
      </div>
    </form>
  );
}
