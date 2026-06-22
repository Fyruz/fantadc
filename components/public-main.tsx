"use client";

import { usePathname } from "next/navigation";

const FULL_BLEED = ["/squadre-fanta/"];

export default function PublicMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullBleed = FULL_BLEED.some((p) => pathname.startsWith(p));

  return (
    <main
      className={`flex-1 max-w-6xl mx-auto w-full min-h-0${
        isFullBleed ? " flex flex-col pt-6 max-w-3xl overflow-hidden" : " px-4 py-6 pb-34 md:pb-8"
      }`}
    >
      {children}
    </main>
  );
}
