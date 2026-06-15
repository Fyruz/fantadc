import Link from "next/link";
import { db } from "@/lib/db";
import { measureServerTiming } from "@/lib/perf";
import {
  computeCumulativeRankings,
  computePhaseRankings,
  computeCurrentPhaseRankings,
} from "@/lib/scoring";
import ClassificaTable from "@/app/(public)/classifica/_table";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function ClassificaFantaPage({
  searchParams,
}: {
  searchParams: Promise<{ fase?: string }>;
}) {
  const { fase } = await searchParams;
  const phases = await measureServerTiming("public.classifica-fanta.phases.fetch", () =>
    db.scoringPhase.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    })
  );

  const selected: string = fase ?? "generale";

  let rankings;
  if (selected === "corrente") {
    rankings = await measureServerTiming("public.classifica-fanta.rankings.fetch", () =>
      computeCurrentPhaseRankings()
    );
  } else if (/^\d+$/.test(selected) && phases.some((p) => String(p.id) === selected)) {
    rankings = await measureServerTiming("public.classifica-fanta.rankings.fetch", () =>
      computePhaseRankings(Number(selected))
    );
  } else {
    rankings = await measureServerTiming("public.classifica-fanta.rankings.fetch", () =>
      computeCumulativeRankings()
    );
  }

  const tabs: { key: string; label: string; href: string }[] = [
    { key: "generale", label: "Generale", href: "/classifica-fanta" },
    ...phases.map((p) => ({ key: String(p.id), label: p.name, href: `/classifica-fanta?fase=${p.id}` })),
    { key: "corrente", label: "Fase in corso", href: "/classifica-fanta?fase=corrente" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="over-label mb-1">Stagione 2026</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          CLASSIFICA FANTA
        </h1>
      </div>

      {phases.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {tabs.map((t) => {
            const active = t.key === selected;
            return (
              <Link
                key={t.key}
                href={t.href}
                scroll={false}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors"
                style={
                  active
                    ? { background: "var(--primary)", color: "#fff" }
                    : { background: "var(--surface-1)", color: "var(--text-secondary)" }
                }
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      )}

      {rankings.length === 0 ? (
        <div className="card p-10 text-center over-label">Nessun risultato ancora pubblicato.</div>
      ) : (
        <ClassificaTable rows={rankings} />
      )}
    </div>
  );
}
