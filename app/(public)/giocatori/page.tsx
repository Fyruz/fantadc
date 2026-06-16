import BackButton from "@/components/back-button";
import Link from "next/link";
import { getPublicPlayersGroups } from "@/lib/data/public/players";
import PlayersGrid from "./_players-grid";

export const dynamic = 'force-dynamic'
export const revalidate = 60;

export default async function GiocatoriPublicPage() {
  const groups = await getPublicPlayersGroups();

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
          Giocatori
        </span>
        <div className="flex-1" />
      </div>

      {groups.length === 0 ? (
        <div
          className="card p-8 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Nessun giocatore presente.
        </div>
      ) : (
        <PlayersGrid groups={groups} />
      )}
    </div>
  );
}
