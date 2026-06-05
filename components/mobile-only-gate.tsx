"use client";

import type { ReactNode } from "react";
import { Button } from "primereact/button";
import { appStoreConfig, siteConfig } from "@/lib/site";

type StoreAction = {
  icon: string;
  label: string;
  url: string | null;
};

const storeActions: StoreAction[] = [
  {
    icon: "pi-apple",
    label: "App Store",
    url: appStoreConfig.appleAppStoreUrl,
  },
  {
    icon: "pi-android",
    label: "Google Play",
    url: appStoreConfig.googlePlayStoreUrl,
  },
];

function StoreButton({ action }: { action: StoreAction }) {
  if (!action.url) {
    return (
      <Button
        icon={`pi ${action.icon}`}
        label={`${action.label}: link in arrivo`}
        disabled
        className="w-full justify-center"
      />
    );
  }

  return (
    <a href={action.url} className="block w-full" target="_blank" rel="noreferrer">
      <Button
        icon={`pi ${action.icon}`}
        label={`Scarica da ${action.label}`}
        className="w-full justify-center"
      />
    </a>
  );
}

export function DesktopServicePage() {
  return (
    <main
      className="min-h-screen w-full px-6 py-10"
      style={{ background: "linear-gradient(180deg, #F5F6FF 0%, #FFFFFF 100%)" }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col justify-center gap-6">
        <section
          className="overflow-hidden rounded-[32px] border px-7 py-9 shadow-xl"
          style={{
            background: "linear-gradient(160deg, #000228 0%, #0107A3 100%)",
            borderColor: "rgba(255,255,255,0.08)",
            boxShadow: "0 16px 48px rgba(1,7,163,0.2)",
          }}
        >
          <div
            className="inline-flex h-14 w-14 items-center justify-center rounded-[20px]"
            style={{ background: "rgba(232,160,0,0.14)", color: "#E8A000" }}
          >
            <i className="pi pi-mobile text-xl" />
          </div>
          <h1 className="mt-5 font-display text-4xl font-black uppercase leading-none text-white">
            Apri {siteConfig.name} da mobile
          </h1>
          <p className="mt-4 text-sm leading-6" style={{ color: "rgba(255,255,255,0.72)" }}>
            Da desktop l&apos;app non è disponibile. Scaricala dagli store o apri il sito da smartphone.
          </p>
        </section>

        <section
          className="rounded-3xl border bg-white p-6"
          style={{ borderColor: "var(--border-medium)", boxShadow: "0 12px 32px rgba(1,7,163,0.08)" }}
        >
          <div className="over-label">Nome sugli store</div>
          <p className="mt-3 text-xl font-black" style={{ color: "var(--text-primary)" }}>
            {appStoreConfig.appName}
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {storeActions.map((action) => (
              <StoreButton key={action.label} action={action} />
            ))}
          </div>
        </section>

        <p className="text-center text-xs leading-5" style={{ color: "var(--text-muted)" }}>
          Se hai già installato l&apos;app, aprila dal tuo smartphone.
        </p>
      </div>
    </main>
  );
}

export default function MobileOnlyGate({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="md:hidden">{children}</div>
      <div className="hidden md:block">
        <DesktopServicePage />
      </div>
    </>
  );
}
