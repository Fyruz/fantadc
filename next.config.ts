import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        // Bandiere self-hosted: statiche e stabili, cache aggressiva lato browser
        // così dopo il primo caricamento sono servite dalla cache locale.
        source: "/flags/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
