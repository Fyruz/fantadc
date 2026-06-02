import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { computeTeamHistory } from "@/lib/scoring";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

// 9:16 — metà della risoluzione nativa per ridurre memoria e tempo di generazione
const W = 540;
const H = 960;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
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

    const ownerName = team.user.name ?? team.user.email.split("@")[0];

    return new ImageResponse(
      (
        <div
          style={{
            width: W,
            height: H,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Header navy */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#1d3f8a",
              padding: "24px 36px",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <img src={logoSrc} width={40} height={40} />
            </div>
            <span
              style={{
                color: "#ffffff",
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: 3,
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
              padding: "40px 40px 30px",
            }}
          >
            {/* Team name */}
            <div
              style={{
                fontSize: 50,
                fontWeight: 900,
                color: "#1e293b",
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {team.name}
            </div>

            {/* Owner */}
            <div style={{ fontSize: 22, color: "#64748b", marginBottom: 32 }}>
              di {ownerName}
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                backgroundColor: "#e2e8f0",
                marginBottom: 28,
              }}
            />

            {/* Players */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 11,
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
                      padding: "15px 22px",
                      borderRadius: 10,
                      backgroundColor: isCaptain
                        ? "#fef9c3"
                        : isGk
                        ? "#eff6ff"
                        : "#f8fafc",
                      gap: 18,
                    }}
                  >
                    {/* Badge ruolo */}
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: isCaptain
                          ? "#ca8a04"
                          : isGk
                          ? "#2563eb"
                          : "#94a3b8",
                        width: 65,
                      }}
                    >
                      {isCaptain ? "★ CAP" : isGk ? "POR" : "OUT"}
                    </div>

                    {/* Nome giocatore */}
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: isCaptain ? 800 : 600,
                        color: "#1e293b",
                        flex: 1,
                      }}
                    >
                      {player.name}
                    </div>

                    {/* Squadra reale */}
                    <div style={{ fontSize: 17, color: "#94a3b8" }}>
                      {teamShort}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                backgroundColor: "#e2e8f0",
                marginTop: 28,
                marginBottom: 28,
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
                  fontSize: 15,
                  color: "#94a3b8",
                  letterSpacing: 3,
                  marginBottom: 6,
                }}
              >
                PUNTI TOTALI
              </div>
              <div
                style={{
                  fontSize: 75,
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
      { width: W, height: H }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[story route]", msg, err);
    return new Response(`Story generation failed: ${msg}`, { status: 500 });
  }
}
