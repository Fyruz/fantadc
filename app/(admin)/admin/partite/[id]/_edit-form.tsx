"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { updateMatch } from "@/app/actions/admin/matches";

type Team = { id: number; name: string };
type Match = { id: number; homeTeamId: number; awayTeamId: number; startsAt: Date; status: string };

const STATUS_OPTIONS = [
  { label: "DRAFT", value: "DRAFT" },
  { label: "SCHEDULED", value: "SCHEDULED" },
  { label: "CONCLUDED", value: "CONCLUDED" },
  { label: "PUBLISHED", value: "PUBLISHED" },
];

export default function EditMatchForm({ match, teams }: { match: Match; teams: Team[] }) {
  const [state, action, pending] = useActionState(updateMatch, undefined);

  const startsAtLocal = new Date(match.startsAt.getTime() - match.startsAt.getTimezoneOffset() * 60000);
  const defaultDate = startsAtLocal.toISOString().slice(0, 10);
  const defaultTime = startsAtLocal.toISOString().slice(11, 16);

  const [homeTeamId, setHomeTeamId] = useState<string>(String(match.homeTeamId));
  const [awayTeamId, setAwayTeamId] = useState<string>(String(match.awayTeamId));
  const [status, setStatus] = useState<string>(match.status);
  const [date, setDate] = useState<Date | null>(() => {
    const d = new Date(defaultDate);
    return isNaN(d.getTime()) ? null : d;
  });
  const [time, setTime] = useState<Date | null>(() => {
    const [h, m] = defaultTime.split(":").map(Number);
    const t = new Date();
    t.setHours(h, m, 0, 0);
    return t;
  });

  const teamOptions = teams.map((t) => ({ label: t.name, value: String(t.id) }));

  const formattedDate = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";
  const formattedTime = time
    ? `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`
    : "";

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={match.id} />
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Squadra casa</label>
          <input type="hidden" name="homeTeamId" value={homeTeamId} />
          <Dropdown
            value={homeTeamId}
            onChange={(e) => setHomeTeamId(e.value)}
            options={teamOptions}
            className="w-full"
          />
        </div>
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Squadra ospite</label>
          <input type="hidden" name="awayTeamId" value={awayTeamId} />
          <Dropdown
            value={awayTeamId}
            onChange={(e) => setAwayTeamId(e.value)}
            options={teamOptions}
            className="w-full"
          />
        </div>
        <div className="flex-1 min-w-32">
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Data</label>
          <input type="hidden" name="date" value={formattedDate} />
          <Calendar
            value={date}
            onChange={(e) => setDate(e.value as Date | null)}
            dateFormat="yy-mm-dd"
            showIcon
            className="w-full"
          />
        </div>
        <div className="w-28">
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Ora</label>
          <input type="hidden" name="time" value={formattedTime} />
          <Calendar
            value={time}
            onChange={(e) => setTime(e.value as Date | null)}
            timeOnly
            showIcon
            className="w-full"
          />
        </div>
        <div className="flex-1 min-w-32">
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Stato</label>
          <input type="hidden" name="status" value={status} />
          <Dropdown
            value={status}
            onChange={(e) => setStatus(e.value)}
            options={STATUS_OPTIONS}
            className="w-full"
          />
        </div>
      </div>
      {state?.errors?.awayTeamId && <p className="text-red-500 text-sm">{state.errors.awayTeamId[0]}</p>}
      {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
      <div>
        <Button type="submit" label={pending ? "Salvo..." : "Salva modifiche"} disabled={pending} size="small" />
      </div>
    </form>
  );
}
