import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/icons/logo_greenvolley.ico", sizes: "48x48" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: ["/icons/logo_greenvolley.ico"],
  },
};

export default function GreenVolleyLayout({ children }: { children: ReactNode }) {
  return <div className="gv-theme">{children}</div>;
}
