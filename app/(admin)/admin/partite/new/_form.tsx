"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { createMatch } from "@/app/actions/admin/matches";

type Team = { id: number; name: string };

export default function NuovaPartitaForm({ teams }: { teams: Team[] }) {
  const [state, action, pending] = useActionState(createMatch, undefined);
  const [homeTeamId, setHomeTeamId] = useState<string>("");
  const [awayTeamId, setAwayTeamId] = useState<string>("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);

  const teamOptions = teams.map((t) => ({ label: t.name, value: String(t.id) }));

  const formattedDate = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";
  const formattedTime = time
    ? `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`
    : "";

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Squadra casa *
          </label>
          <input type="hidden" name="homeTeamId" value={homeTeamId} />
          <Dropdown
            value={homeTeamId}
            onChange={(e) => setHomeTeamId(e.value)}
            options={teamOptions}
            placeholder="Seleziona squadra"
            className="w-full"
          />
          {state?.errors?.homeTeamId && (
            <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.homeTeamId[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Squadra ospite *
          </label>
          <input type="hidden" name="awayTeamId" value={awayTeamId} />
          <Dropdown
            value={awayTeamId}
            onChange={(e) => setAwayTeamId(e.value)}
            options={teamOptions}
            placeholder="Seleziona squadra"
            className="w-full"
          />
          {state?.errors?.awayTeamId && (
            <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.awayTeamId[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Data *
          </label>
          <input type="hidden" name="date" value={formattedDate} />
          <Calendar
            value={date}
            onChange={(e) => setDate(e.value as Date | null)}
            dateFormat="dd/mm/yy"
            showIcon
            className="w-full"
          />
          {state?.errors?.date && (
            <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.date[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Ora *
          </label>
          <input type="hidden" name="time" value={formattedTime} />
          <Calendar
            value={time}
            onChange={(e) => setTime(e.value as Date | null)}
            timeOnly
            showIcon
            className="w-full"
          />
          {state?.errors?.time && (
            <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{state.errors.time[0]}</p>
          )}
        </div>
      </div>

      {state?.message && (
        <p className="text-xs" style={{ color: "#991B1B" }}>{state.message}</p>
      )}
      <div>
        <Button type="submit" label={pending ? "Salvo..." : "Crea partita"} disabled={pending} />
      </div>
    </form>
  );
}
