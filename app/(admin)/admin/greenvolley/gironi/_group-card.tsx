"use client";

import { useActionState, useTransition } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addTeamToVolleyGroup,
  removeTeamFromVolleyGroup,
  setVolleyTeamQualified,
  deleteVolleyGroup,
} from "@/app/actions/admin/volley";

type GroupTeam = { teamId: number; teamName: string; qualified: boolean };
type Group = { id: number; name: string; teams: GroupTeam[] };
type SelectItem = { id: number; name: string };

export default function GroupCard({
  group,
  availableTeams,
}: {
  group: Group;
  availableTeams: SelectItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const addAction = addTeamToVolleyGroup.bind(null, group.id);
  const [addState, formAction, addPending] = useActionState(addAction, undefined);

  return (
    <div className="admin-card p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-black text-base uppercase tracking-wide">{group.name}</h3>
        <Button
          icon="pi pi-trash"
          text
          size="small"
          severity="danger"
          onClick={() => {
            if (confirm(`Eliminare il girone "${group.name}"?`)) {
              startTransition(async () => {
                await deleteVolleyGroup(group.id);
                router.refresh();
              });
            }
          }}
          loading={isPending}
          aria-label="Elimina girone"
        />
      </div>

      {/* Team list */}
      <div className="flex flex-col gap-2">
        {group.teams.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Nessuna squadra nel girone.
          </p>
        ) : (
          group.teams.map((gt) => (
            <div
              key={gt.teamId}
              className="flex items-center justify-between rounded-xl px-3 py-2"
              style={{ background: "var(--surface-1)" }}
            >
              <span className="text-sm font-semibold">{gt.teamName}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    startTransition(async () => {
                      await setVolleyTeamQualified(group.id, gt.teamId, !gt.qualified);
                      router.refresh();
                    })
                  }
                  className="text-xs font-bold"
                >
                  {gt.qualified ? (
                    <Tag value="Qualificata" severity="success" />
                  ) : (
                    <Tag value="Non qualificata" severity="secondary" />
                  )}
                </button>
                <Button
                  icon="pi pi-times"
                  text
                  size="small"
                  severity="danger"
                  onClick={() =>
                    startTransition(async () => {
                      await removeTeamFromVolleyGroup(group.id, gt.teamId);
                      router.refresh();
                    })
                  }
                  aria-label="Rimuovi"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add team form */}
      {availableTeams.length > 0 && (
        <form action={formAction} className="flex gap-2">
          {addState?.error && (
            <p className="text-xs" style={{ color: "var(--error, #dc2626)" }}>
              {addState.error}
            </p>
          )}
          <Dropdown
            options={availableTeams}
            optionLabel="name"
            optionValue="id"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.value)}
            placeholder="Aggiungi squadra"
            className="flex-1"
          />
          <input type="hidden" name="teamId" value={selectedTeamId ?? ""} />
          <Button
            type="submit"
            icon="pi pi-plus"
            loading={addPending}
            style={{ background: "#3DD907", border: "none", color: "#fff" }}
            aria-label="Aggiungi"
          />
        </form>
      )}
    </div>
  );
}
