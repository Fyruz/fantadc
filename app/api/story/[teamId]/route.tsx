import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { computeTeamHistory } from "@/lib/scoring";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

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

    const gk = team.players.find((p) => p.player.role === "P");
    const outfield = team.players.filter((p) => p.player.role === "A");
    // Captain first, then GK, then outfield
    const captain = team.players.find((p) => p.player.id === team.captainPlayerId);
    const others = team.players.filter((p) => p.player.id !== team.captainPlayerId);
    const sortedPlayers = captain
      ? [captain, ...others.filter((p) => p.player.role === "P"), ...others.filter((p) => p.player.role === "A")]
      : [...(gk ? [gk] : []), ...outfield];

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
          {/* Decorative circles (depth effect) */}
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: 110,
              border: "1px solid rgba(255,255,255,0.04)",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: -80,
              width: 280,
              height: 280,
              borderRadius: 140,
              border: "1px solid rgba(255,255,255,0.03)",
              display: "flex",
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              padding: "22px 28px",
              gap: 12,
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <img src={logoSrc} width={38} height={38} />
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: "rgba(255,255,255,0.90)",
                letterSpacing: 4,
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
              padding: "28px 28px 28px",
              flex: 1,
            }}
          >
            {/* Over-label */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.40)",
                letterSpacing: 3,
                marginBottom: 6,
                fontFamily: "Tallica",
              }}
            >
              LA MIA SQUADRA
            </div>

            {/* Team name */}
            <div
              style={{
                fontSize: 42,
                fontWeight: 500,
                color: "#ffffff",
                lineHeight: 1,
                marginBottom: 6,
                fontFamily: "Tallica",
                letterSpacing: 1,
              }}
            >
              {team.name.toUpperCase()}
            </div>

            {/* Owner */}
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                marginBottom: 24,
                letterSpacing: 0.3,
              }}
            >
              {`di ${ownerName}`}
            </div>

            {/* Players */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
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
                      padding: "12px 14px",
                      borderRadius: 12,
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
                      gap: 12,
                    }}
                  >
                    {/* Badge */}
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: isCaptain
                          ? "#E8A000"
                          : isGk
                          ? "rgba(255,255,255,0.80)"
                          : "rgba(255,255,255,0.40)",
                        width: 36,
                        letterSpacing: 1.5,
                        fontFamily: "Tallica",
                      }}
                    >
                      {isCaptain ? "CAP" : isGk ? "POR" : "OUT"}
                    </div>

                    {/* Name */}
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: isCaptain ? 700 : 600,
                        color: isCaptain ? "#E8A000" : "#ffffff",
                        flex: 1,
                      }}
                    >
                      {player.name}
                    </div>

                    {/* Team short */}
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: 0.5,
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
                marginTop: 24,
                marginBottom: 20,
              }}
            />

            {/* Points */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.40)",
                  letterSpacing: 4,
                  marginBottom: 4,
                  fontFamily: "Tallica",
                }}
              >
                PUNTI TOTALI
              </div>
              <div
                style={{
                  fontSize: 72,
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
