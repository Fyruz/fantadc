import BackButton from "@/components/back-button";
import { getPublicFantasyPlayerPickRows } from "@/lib/data/public/players";
import PlayerPickList from "./_list";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function GiocatoriFantaPage() {
  const rows = await getPublicFantasyPlayerPickRows();

  if (rows.length === 0) {
    return (
      <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>
        Nessuna squadra fanta registrata.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Header mobile */}
      <div className="md:hidden flex items-center justify-between h-12">
        <div className="flex-1 flex items-center">
          <BackButton />
        </div>
        <span
          className="flex-1 text-center uppercase whitespace-nowrap"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          Scelti dai fantallenatori
        </span>
        <div className="flex-1" />
      </div>

      <PlayerPickList rows={rows} />
    </div>
  );
}
