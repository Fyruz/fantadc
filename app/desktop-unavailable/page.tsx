import type { Metadata } from "next";
import { DesktopServicePage } from "@/components/mobile-only-gate";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `Apri da mobile | ${siteConfig.name}`,
};

export default function DesktopUnavailablePage() {
  return <DesktopServicePage />;
}
