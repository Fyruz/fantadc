import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    const reusableStaticAsset = "public, max-age=604800, stale-while-revalidate=2592000";

    return [
      {
        // Bandiere self-hosted: statiche e stabili, cache aggressiva lato browser
        // così dopo il primo caricamento sono servite dalla cache locale.
        source: "/flags/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: reusableStaticAsset },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: reusableStaticAsset },
        ],
      },
    ];
  },
};

export default nextConfig;
