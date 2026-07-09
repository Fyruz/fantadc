"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Dropdown } from "primereact/dropdown";
import RoleBadge from "@/components/role-badge";

type Row = {
  playerId: number;
  name: string;
  role: string;
  teamName: string;
  bonusTypeId: number;
  quantity: number;
};

type BonusType = { id: number; code: string; name: string; points: number };

type RankRow = {
  id: number;
  name: string;
  role: string;
  teamName: string;
  count: number;
};

const ALL = "all";

export default function BonusMalusTables({
  rows,
  bonusTypes,
}: {
  rows: Row[];
  bonusTypes: BonusType[];
}) {
  const [filter, setFilter] = useState<string>(ALL);

  const bonusTypeById = useMemo(() => new Map(bonusTypes.map((bt) => [bt.id, bt])), [bonusTypes]);

  const filterOptions = useMemo(
    () => [
      { label: "Tutti i tipi", value: ALL },
      ...bonusTypes
        .filter((bt) => bt.points > 0)
        .map((bt) => ({ label: bt.code, value: String(bt.id) })),
      ...bonusTypes
        .filter((bt) => bt.points < 0)
        .map((bt) => ({ label: bt.code, value: String(bt.id) })),
    ],
    [bonusTypes]
  );

  const { topBonus, topMalus, single, singleType } = useMemo(() => {
    if (filter !== ALL) {
      const typeId = Number(filter);
      const type = bonusTypeById.get(typeId);
      const filtered = rows.filter((r) => r.bonusTypeId === typeId);
      const list: RankRow[] = filtered
        .map((r) => ({ id: r.playerId, name: r.name, role: r.role, teamName: r.teamName, count: r.quantity }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
      return { topBonus: [], topMalus: [], single: list, singleType: type ?? null };
    }

    const byPlayer = new Map<number, RankRow & { sign: number }>();
    for (const r of rows) {
      const type = bonusTypeById.get(r.bonusTypeId);
      if (!type) continue;
      const sign = type.points > 0 ? 1 : type.points < 0 ? -1 : 0;
      const existing = byPlayer.get(r.playerId);
      if (existing) {
        if (sign > 0) existing.count += r.quantity;
      } else if (sign > 0) {
        byPlayer.set(r.playerId, { id: r.playerId, name: r.name, role: r.role, teamName: r.teamName, count: r.quantity, sign });
      }
    }
    const byPlayerMalus = new Map<number, RankRow>();
    for (const r of rows) {
      const type = bonusTypeById.get(r.bonusTypeId);
      if (!type || type.points >= 0) continue;
      const existing = byPlayerMalus.get(r.playerId);
      if (existing) {
        existing.count += r.quantity;
      } else {
        byPlayerMalus.set(r.playerId, { id: r.playerId, name: r.name, role: r.role, teamName: r.teamName, count: r.quantity });
      }
    }

    const bonusList = Array.from(byPlayer.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
    const malusList = Array.from(byPlayerMalus.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return { topBonus: bonusList, topMalus: malusList, single: [], singleType: null };
  }, [rows, filter, bonusTypeById]);

  return (
    <div>
      <div className="mb-4">
        <Dropdown
          value={filter}
          onChange={(e) => setFilter(e.value)}
          options={filterOptions}
          optionLabel="label"
          filter
          filterPlaceholder="Cerca tipo..."
          scrollHeight="260px"
          className="w-full"
        />
      </div>

      {filter === ALL ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border-soft)" }}>
              <i className="pi pi-arrow-up-right text-sm" style={{ color: "#065F46" }} />
              <div className="over-label">Più bonus presi</div>
            </div>
            <RankList rows={topBonus} countColor="#065F46" />
          </div>
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border-soft)" }}>
              <i className="pi pi-arrow-down-right text-sm" style={{ color: "#991B1B" }} />
              <div className="over-label">Più malus presi</div>
            </div>
            <RankList rows={topMalus} countColor="#991B1B" />
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border-soft)" }}>
            <i
              className={`pi ${singleType && singleType.points < 0 ? "pi-arrow-down-right" : "pi-arrow-up-right"} text-sm`}
              style={{ color: singleType && singleType.points < 0 ? "#991B1B" : "#065F46" }}
            />
            <div className="over-label">
              {singleType ? `${singleType.name} — classifica` : "Classifica"}
            </div>
          </div>
          <RankList rows={single} countColor={singleType && singleType.points < 0 ? "#991B1B" : "#065F46"} />
        </div>
      )}
    </div>
  );
}

function RankList({ rows, countColor }: { rows: RankRow[]; countColor: string }) {
  if (rows.length === 0) {
    return <p className="px-4 py-10 text-center over-label">Nessun dato.</p>;
  }
  return (
    <div>
      {rows.map((row, idx) => (
        <Link
          key={row.id}
          href={`/admin/giocatori/${row.id}/edit`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-1)] transition-colors"
          style={idx < rows.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center font-display font-black text-xs flex-shrink-0"
            style={{ background: "var(--surface-1)", color: "var(--text-muted)" }}
          >
            {idx + 1}
          </div>
          <RoleBadge role={row.role} />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
              {row.name}
            </div>
            <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
              {row.teamName}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="font-display font-black text-base" style={{ color: countColor }}>
              {row.count}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
