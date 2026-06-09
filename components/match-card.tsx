import Link from "next/link";
import { resolveTeamFlag } from "@/lib/flags";

type MatchTeam = {
  name: string;
  shortName: string | null;
  countryCode: string | null;
  logoUrl: string | null;
} | null;

type Props = {
  match: {
    id: number;
    status: string;
    startsAt: Date | null;
    homeScore: number | null;
    awayScore: number | null;
    homeSeed: string | null;
    awaySeed: string | null;
    homeTeam: MatchTeam;
    awayTeam: MatchTeam;
    group: { name: string } | null;
    knockoutRound: { name: string } | null;
  };
  showDate?: boolean;
};

function TeamFlag({ team }: { team: MatchTeam }) {
  if (!team) return <div className="w-6 h-4" />;
  const src = resolveTeamFlag(team);
  if (!src) return null;
  return <img src={src} alt={team.name} width={24} height={16} />;
}

export default function MatchCard({ match: m, showDate = false }: Props) {
  const scored = m.homeScore !== null && m.awayScore !== null;
  const concluded = m.status === "CONCLUDED";
  const label = m.group?.name ?? m.knockoutRound?.name ?? null;
  const date = m.startsAt ? m.startsAt.toLocaleDateString("it-IT", { day: "numeric", month: "short", timeZone: "UTC" }) : null;
  const time = m.startsAt ? m.startsAt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) : null;

  return (
    <Link
      href={`/partite/${m.id}`}
      className="bg-white rounded-3xl p-6 flex flex-col gap-4 block"
      style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
    >
      {(label || (showDate && date)) && (
        <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid rgba(9,20,76,0.05)" }}>
          {label && <span className="text-sm text-black">{label}</span>}
          {showDate && date && <span className="text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>{date}</span>}
        </div>
      )}

      <div className="flex gap-6 items-center">
        <div className="flex flex-col gap-4 flex-1 min-w-0 pr-6" style={{ borderRight: "1px solid rgba(9,20,76,0.05)" }}>
          <div className="flex items-center gap-4">
            <div className="shrink-0 flex items-center justify-center">
              <TeamFlag team={m.homeTeam} />
            </div>
            <span className="text-sm text-black flex-1 truncate">{m.homeTeam?.shortName ?? m.homeTeam?.name ?? m.homeSeed ?? "TBD"}</span>
            {scored && <span className="text-sm font-semibold text-black shrink-0">{m.homeScore}</span>}
          </div>
          <div className="flex items-center gap-4">
            <div className="shrink-0 flex items-center justify-center">
              <TeamFlag team={m.awayTeam} />
            </div>
            <span className="text-sm text-black flex-1 truncate">{m.awayTeam?.shortName ?? m.awayTeam?.name ?? m.awaySeed ?? "TBD"}</span>
            {scored && <span className="text-sm font-semibold text-black shrink-0">{m.awayScore}</span>}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 shrink-0">
          {concluded
            ? <span className="text-xs font-medium" style={{ color: "rgba(0,0,0,0.65)" }}>Fischio finale</span>
            : time && <span className="text-sm text-black">{time}</span>
          }
          <span className="text-xs font-medium text-black">Vedi i dettagli</span>
        </div>
      </div>
    </Link>
  );
}
