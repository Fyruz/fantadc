import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { computeTeamHistory } from "@/lib/scoring";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId: teamIdStr } = await params;
  const teamId = parseInt(teamIdStr, 10);
  if (isNaN(teamId)) return new Response("Invalid teamId", { status: 400 });

  const team = await db.fantasyTeam.findUnique({
    where: { id: teamId },
    include: {
      user: { select: { name: true, email: true } },
      players: {
        include: {
          player: {
            include: { footballTeam: { select: { name: true, shortName: true } } },
          },
        },
      },
      captain: { select: { id: true } },
    },
  });

  if (!team) return new Response("Team not found", { status: 404 });

  const history = await computeTeamHistory(teamId);
  const totalPoints = history.reduce((s, m) => s + m.total, 0);

  const logoBuffer = await readFile(
    path.join(process.cwd(), "public", "logo_dc.png")
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  const gk = team.players.find((p) => p.player.role === "P");
  const outfield = team.players.filter((p) => p.player.role === "A");
  const sortedPlayers = [...(gk ? [gk] : []), ...outfield];

  const ownerName =
    team.user.name ?? team.user.email.split("@")[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header navy */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#1d3f8a",
            padding: "48px 72px",
            gap: "28px",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img src={logoSrc} width={80} height={80} />
          </div>
          <span
            style={{
              color: "#ffffff",
              fontSize: 40,
              fontWeight: 900,
              letterSpacing: 5,
            }}
          >
            FANTA DCUP
          </span>
        </div>

        {/* Body */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "80px 80px 60px",
          }}
        >
          {/* Team name */}
          <div
            style={{
              fontSize: 100,
              fontWeight: 900,
              color: "#1e293b",
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            {team.name}
          </div>

          {/* Owner */}
          <div style={{ fontSize: 44, color: "#64748b", marginBottom: 64 }}>
            di {ownerName}
          </div>

          {/* Divider */}
          <div
            style={{
              height: 2,
              backgroundColor: "#e2e8f0",
              marginBottom: 56,
            }}
          />

          {/* Players */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
              flex: 1,
            }}
          >
            {sortedPlayers.map(({ player }) => {
              const isGk = player.role === "P";
              const isCaptain = player.id === team.captainPlayerId;
              const teamShort =
                player.footballTeam.shortName ?? player.footballTeam.name;

              return (
                <div
                  key={player.id}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: "30px 44px",
                    borderRadius: 20,
                    backgroundColor: isCaptain
                      ? "#fef9c3"
                      : isGk
                      ? "#eff6ff"
                      : "#f8fafc",
                    border: isCaptain
                      ? "2px solid #fde047"
                      : isGk
                      ? "2px solid #bfdbfe"
                      : "2px solid #f1f5f9",
                    gap: 36,
                  }}
                >
                  {/* Badge ruolo */}
                  <div
                    style={{
                      fontSize: 30,
                      fontWeight: 700,
                      color: isCaptain
                        ? "#ca8a04"
                        : isGk
                        ? "#2563eb"
                        : "#94a3b8",
                      width: 130,
                    }}
                  >
                    {isCaptain ? "★ CAP" : isGk ? "POR" : "OUT"}
                  </div>

                  {/* Nome giocatore */}
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: isCaptain ? 800 : 600,
                      color: "#1e293b",
                      flex: 1,
                    }}
                  >
                    {player.name}
                  </div>

                  {/* Squadra reale */}
                  <div style={{ fontSize: 34, color: "#94a3b8" }}>
                    {teamShort}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div
            style={{
              height: 2,
              backgroundColor: "#e2e8f0",
              marginTop: 56,
              marginBottom: 56,
            }}
          />

          {/* Punti */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 30,
                color: "#94a3b8",
                letterSpacing: 5,
                marginBottom: 12,
              }}
            >
              PUNTI TOTALI
            </div>
            <div
              style={{
                fontSize: 150,
                fontWeight: 900,
                color: "#1d3f8a",
                lineHeight: 1,
              }}
            >
              {totalPoints.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
