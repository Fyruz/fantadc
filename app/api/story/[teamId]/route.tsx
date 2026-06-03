import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { computeTeamHistory } from "@/lib/scoring";
import { getFlagUrlFromCountryCode } from "@/lib/flags";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const W = 1080;
const H = 1920;

function fitStoryText(value: string, maxLength: number) {
  const normalized = value.trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
}

function teamFlagSrc(team: { countryCode: string | null; logoUrl: string | null }) {
  return team.logoUrl ?? getFlagUrlFromCountryCode(team.countryCode);
}

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
                  footballTeam: {
                    select: {
                      name: true,
                      shortName: true,
                      countryCode: true,
                      logoUrl: true,
                    },
                  },
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
    const displayTeamName = fitStoryText(team.name.toUpperCase(), 24);
    const teamNameFontSize =
      displayTeamName.length > 20 ? 64 : displayTeamName.length > 14 ? 74 : 88;

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
              padding: "54px 56px 44px",
              gap: 18,
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              style={{
                width: 196,
                height: 196,
                borderRadius: 42,
                backgroundColor: "rgba(255,255,255,0.18)",
                border: "3px solid rgba(255,255,255,0.34)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
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
                fontSize: 48,
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
              padding: "42px 56px 56px",
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
                fontSize: teamNameFontSize,
                fontWeight: 500,
                color: "#ffffff",
                lineHeight: 1,
                marginBottom: 12,
                fontFamily: "Tallica",
                letterSpacing: 2,
              }}
            >
              {displayTeamName}
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
                const flagSrc = teamFlagSrc(player.footballTeam);
                const displayName = fitStoryText(player.name, 22);
                const displayTeam = fitStoryText(teamShort, 9).toUpperCase();
                const playerFontSize = displayName.length > 18 ? 30 : 34;

                return (
                  <div
                    key={player.id}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      width: "100%",
                      height: 96,
                      padding: "18px 24px",
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
                      gap: 18,
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
                        width: 76,
                        letterSpacing: 3,
                        fontFamily: "Tallica",
                      }}
                    >
                      {isCaptain ? "CAP" : isGk ? "POR" : "OUT"}
                    </div>

                    {/* Flag */}
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 14,
                        backgroundColor: "rgba(255,255,255,0.14)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {flagSrc ? (
                        <img
                          src={flagSrc}
                          width={54}
                          height={54}
                          style={{ objectFit: "contain" }}
                        />
                      ) : (
                        <span
                          style={{
                            fontSize: 17,
                            color: "rgba(255,255,255,0.45)",
                            fontWeight: 700,
                          }}
                        >
                          {displayTeam.slice(0, 2)}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <div
                      style={{
                        fontSize: playerFontSize,
                        fontWeight: isCaptain ? 700 : 600,
                        color: isCaptain ? "#E8A000" : "#ffffff",
                        flex: 1,
                        lineHeight: 1.05,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {displayName}
                    </div>

                    {/* Team */}
                    <div
                      style={{
                        width: 128,
                        fontSize: 22,
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: 1,
                        textAlign: "right",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {displayTeam}
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
                padding: "24px 80px 30px",
                gap: 10,
              }}
            >
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
