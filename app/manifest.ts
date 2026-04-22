import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: siteConfig.scope,
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: siteConfig.startUrl,
    scope: siteConfig.scope,
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "portrait",
    background_color: siteConfig.backgroundColor,
    theme_color: siteConfig.themeColor,
    lang: "it",
    categories: [...siteConfig.categories],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: siteConfig.shortcuts.map((shortcut) => ({
      name: shortcut.name,
      short_name: shortcut.shortName,
      description: shortcut.description,
      url: shortcut.url,
      icons: [
        {
          src: shortcut.icon,
          sizes: "192x192",
          type: "image/png",
        },
      ],
    })),
  };
}
