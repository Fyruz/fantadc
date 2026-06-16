import BackButton from "@/components/back-button";
import Link from "next/link";
import { getPublicScorerRanking } from "@/lib/data/public/players";

export const dynamic = 'force-dynamic'
export const revalidate = 60;

export const metadata = { title: "Capocannoniere" };

export default async function ClassificaMarcatoriPage() {
  const ranked = await getPublicScorerRanking();

  return (
    <div className="flex flex-col gap-10">
      {/* Header mobile */}
      <div className="md:hidden flex items-center justify-between h-12">
        <div className="flex-1 flex items-center">
          <BackButton />
        </div>
        <span
          className="flex-1 text-center uppercase"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          Capocannoniere
        </span>
        <div className="flex-1" />
      </div>

      {ranked.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
          Nessun gol segnato.
        </p>
      ) : (
        <div className="flex flex-col">
          {ranked.map((p, idx) => {
            return (
              <div
                key={p.id}
                className={`flex gap-4 items-center pb-3${idx === 0 ? "" : " pt-3"}`}
                style={idx < ranked.length - 1 ? { borderBottom: "1px solid rgba(0,0,0,0.05)" } : undefined}
              >
                {/* Rank */}
                <span className="text-xs text-black shrink-0">{idx + 1}</span>

                {/* Logo + name */}
                <div className="flex flex-1 gap-3 items-center min-w-0">
                  <div className="w-9 h-9 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    {p.flagSrc ? (
                      <img src={p.flagSrc} alt={p.footballTeam.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] font-black uppercase" style={{ color: "var(--primary)" }}>
                        {(p.footballTeam.shortName ?? p.footballTeam.name).slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-[14px] text-black truncate">{p.name}</span>
                </div>

                {/* Goals */}
                <span className="text-[14px] font-semibold text-black shrink-0">{p.goals}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
