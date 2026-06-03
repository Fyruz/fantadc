import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { computeTeamHistory } from "@/lib/scoring";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const W = 1080;
const H = 1920;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId: teamIdStr } = await params;
    const teamId = parseInt(teamIdStr, 10);
    if (isNaN(teamId)) return new Response("Invalid teamId", { status: 400 });

    const [team, logoBuffer, tallicaBuffer] = await Promise.all([
      db.fantasyTeam.findUnique({
        where: { id: teamId },
        include: {
          user: { select: { name: true, email: true } },
          players: {
            include: {
              player: {
                include: {
                  footballTeam: { select: { name: true, shortName: true } },
                },
              },
            },
          },
          captain: { select: { id: true } },
        },
      }),
      readFile(path.join(process.cwd(), "public", "logo_dc.png")),
      readFile(path.join(process.cwd(), "public", "fonts", "Tallica", "Tallica-Medium.ttf")),
    ]);

    if (!team) return new Response("Team not found", { status: 404 });

    const history = await computeTeamHistory(teamId);
    const totalPoints = history.reduce((s, m) => s + m.total, 0);

    const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

    const captain = team.players.find((p) => p.player.id === team.captainPlayerId);
    const others = team.players.filter((p) => p.player.id !== team.captainPlayerId);
    const sortedPlayers = captain
      ? [captain, ...others.filter((p) => p.player.role === "P"), ...others.filter((p) => p.player.role === "A")]
      : [...team.players.filter((p) => p.player.role === "P"), ...team.players.filter((p) => p.player.role === "A")];

    const ownerName = team.user.name ?? team.user.email.split("@")[0];

    return new ImageResponse(
      (
        <div
          style={{
            width: W,
            height: H,
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(145deg, #0107A3 0%, #000669 100%)",
            position: "relative",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: -120,
              right: -120,
              width: 440,
              height: 440,
              borderRadius: 220,
              border: "1px solid rgba(255,255,255,0.04)",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 160,
              left: -160,
              width: 560,
              height: 560,
              borderRadius: 280,
              border: "1px solid rgba(255,255,255,0.03)",
              display: "flex",
            }}
          />

          {/* Header — logo centrato e prominente */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "52px 56px 40px",
              gap: 20,
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 32,
                backgroundColor: "rgba(255,255,255,0.14)",
                border: "2px solid rgba(255,255,255,0.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <img src={logoSrc} width={140} height={140} />
            </div>
            <span
              style={{
                fontSize: 44,
                fontWeight: 500,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: 10,
                fontFamily: "Tallica",
              }}
            >
              FANTA DCUP
            </span>
          </div>

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "56px 56px",
              flex: 1,
            }}
          >
            {/* Over-label */}
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "rgba(255,255,255,0.40)",
                letterSpacing: 6,
                marginBottom: 12,
                fontFamily: "Tallica",
              }}
            >
              LA MIA SQUADRA
            </div>

            {/* Team name */}
            <div
              style={{
                fontSize: 84,
                fontWeight: 500,
                color: "#ffffff",
                lineHeight: 1,
                marginBottom: 12,
                fontFamily: "Tallica",
                letterSpacing: 2,
              }}
            >
              {team.name.toUpperCase()}
            </div>

            {/* Owner */}
            <div
              style={{
                fontSize: 26,
                color: "rgba(255,255,255,0.45)",
                marginBottom: 48,
                letterSpacing: 0.6,
              }}
            >
              {`di ${ownerName}`}
            </div>

            {/* Players */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
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
                      padding: "24px 28px",
                      borderRadius: 24,
                      backgroundColor: isCaptain
                        ? "rgba(232,160,0,0.18)"
                        : isGk
                        ? "rgba(255,255,255,0.10)"
                        : "rgba(255,255,255,0.06)",
                      border: isCaptain
                        ? "1px solid rgba(232,160,0,0.38)"
                        : isGk
                        ? "1px solid rgba(255,255,255,0.18)"
                        : "1px solid rgba(255,255,255,0.09)",
                      gap: 24,
                    }}
                  >
                    {/* Badge */}
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: isCaptain
                          ? "#E8A000"
                          : isGk
                          ? "rgba(255,255,255,0.80)"
                          : "rgba(255,255,255,0.40)",
                        width: 72,
                        letterSpacing: 3,
                        fontFamily: "Tallica",
                      }}
                    >
                      {isCaptain ? "CAP" : isGk ? "POR" : "OUT"}
                    </div>

                    {/* Name */}
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: isCaptain ? 700 : 600,
                        color: isCaptain ? "#E8A000" : "#ffffff",
                        flex: 1,
                      }}
                    >
                      {player.name}
                    </div>

                    {/* Team */}
                    <div
                      style={{
                        fontSize: 24,
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: 1,
                      }}
                    >
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
                backgroundColor: "rgba(255,255,255,0.08)",
                marginTop: 48,
                marginBottom: 40,
              }}
            />

            {/* Points */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "rgba(232,160,0,0.10)",
                border: "1px solid rgba(232,160,0,0.28)",
                borderRadius: 28,
                padding: "28px 80px",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  color: "rgba(255,255,255,0.65)",
                  letterSpacing: 8,
                  fontFamily: "Tallica",
                }}
              >
                PUNTI TOTALI
              </div>
              <div
                style={{
                  fontSize: 120,
                  fontWeight: 500,
                  color: "#E8A000",
                  lineHeight: 1,
                  fontFamily: "Tallica",
                }}
              >
                {totalPoints.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: W,
        height: H,
        fonts: [
          {
            name: "Tallica",
            data: tallicaBuffer,
            weight: 500,
            style: "normal",
          },
        ],
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[story route]", msg, err);
    return new Response(`Story generation failed: ${msg}`, { status: 500 });
  }
}
