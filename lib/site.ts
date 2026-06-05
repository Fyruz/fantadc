export const siteConfig = {
  name: "Danimarca's Cup",
  shortName: "DCup",
  description: "L'app ufficiale della Danimarca's Cup, il torneo di calcio più grevigiano di sempre.",
  themeColor: "#0107A3",
  backgroundColor: "#F5F6FF",
  scope: "/",
  startUrl: "/",
  offlineUrl: "/offline",
  categories: ["sports", "games", "entertainment"],
  shortcuts: [
    {
      name: "Classifica",
      shortName: "Classifica",
      description: "Apri la classifica fantasy aggiornata.",
      url: "/classifica",
      icon: "/icons/icon-192.png",
    },
    {
      name: "Partite",
      shortName: "Partite",
      description: "Controlla calendario e risultati del torneo.",
      url: "/partite",
      icon: "/icons/icon-192.png",
    },
    {
      name: "Dashboard",
      shortName: "Dashboard",
      description: "Vai alla tua area personale.",
      url: "/dashboard",
      icon: "/icons/icon-192.png",
    },
  ],
} as const;

export const appStoreConfig: {
  appName: string;
  appleAppStoreUrl: string | null;
  googlePlayStoreUrl: string | null;
} = {
  appName: "Danimarca's Cup",
  appleAppStoreUrl: null,
  googlePlayStoreUrl: null,
};

function resolveAppUrl(value: string | undefined) {
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[Fantadc PWA] NEXTAUTH_URL/NEXT_PUBLIC_APP_URL not set, falling back to localhost metadata URLs.");
    }

    return "http://localhost:3000";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export function getSiteUrl() {
  return resolveAppUrl(process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL);
}
