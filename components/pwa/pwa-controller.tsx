"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "primereact/button";

const INSTALL_DISMISS_KEY = "fantadc:pwa-install-dismissed";
const UPDATE_DISMISS_KEY = "fantadc:pwa-update-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface Navigator {
    standalone?: boolean;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIosDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isPromptDismissed(storageKey: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(storageKey) === "1";
}

export default function PwaController() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(() => isPromptDismissed(INSTALL_DISMISS_KEY));
  const [updateDismissed, setUpdateDismissed] = useState(() => isPromptDismissed(UPDATE_DISMISS_KEY));
  const [installed, setInstalled] = useState(() => isStandaloneMode());
  const [iosHintEnabled, setIosHintEnabled] = useState(() => isIosDevice() && !isStandaloneMode());

  const shouldHide = useMemo(
    () => pathname.startsWith("/admin") || pathname.startsWith("/api") || installed,
    [installed, pathname],
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let ignore = false;
    let reloading = false;

    const registerServiceWorker = async () => {
      try {
        const swRegistration = await navigator.serviceWorker.register("/sw.js");
        if (ignore) {
          return;
        }

        setRegistration(swRegistration);

        if (swRegistration.waiting && !isPromptDismissed(UPDATE_DISMISS_KEY)) {
          setUpdateReady(true);
        }

        swRegistration.addEventListener("updatefound", () => {
          const nextWorker = swRegistration.installing;
          if (!nextWorker) {
            return;
          }

          nextWorker.addEventListener("statechange", () => {
            if (
              nextWorker.state === "installed" &&
              navigator.serviceWorker.controller &&
              !isPromptDismissed(UPDATE_DISMISS_KEY)
            ) {
              setUpdateReady(true);
            }
          });
        });
      } catch {
        // Silent fallback: the app still works without offline support.
      }
    };

    const handleControllerChange = () => {
      if (reloading) {
        return;
      }

      reloading = true;
      window.location.reload();
    };

    void registerServiceWorker();
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    return () => {
      ignore = true;
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIosHintEnabled(false);
    };

    const handleAppInstalled = () => {
      window.localStorage.removeItem(INSTALL_DISMISS_KEY);
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismissInstallPrompt = () => {
    window.localStorage.setItem(INSTALL_DISMISS_KEY, "1");
    setInstallDismissed(true);
  };

  const dismissUpdatePrompt = () => {
    window.localStorage.setItem(UPDATE_DISMISS_KEY, "1");
    setUpdateDismissed(true);
    setUpdateReady(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      window.localStorage.removeItem(INSTALL_DISMISS_KEY);
      setInstallDismissed(false);
    }

    setDeferredPrompt(null);
  };

  const handleRefresh = async () => {
    window.localStorage.removeItem(UPDATE_DISMISS_KEY);
    setUpdateDismissed(false);
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      return;
    }

    window.location.reload();
  };

  const handleInstallClick = () => {
    // Intentionally fire-and-forget: the browser owns the native install dialog lifecycle.
    void handleInstall();
  };

  const handleRefreshClick = () => {
    // Intentionally fire-and-forget: the page reloads when the waiting service worker activates.
    void handleRefresh();
  };

  if (shouldHide) {
    return null;
  }

  const showInstallCard = !installDismissed && (Boolean(deferredPrompt) || iosHintEnabled);
  const showUpdateCard = updateReady && !updateDismissed;

  if (!showInstallCard && !showUpdateCard) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4 pb-safe">
      <div
        className="mx-auto flex max-w-md flex-col gap-4 rounded-3xl border p-4 shadow-2xl"
        style={{
          background: "rgba(255,255,255,0.96)",
          borderColor: "var(--border-medium)",
          boxShadow: "0 12px 40px rgba(1,7,163,0.18)",
          backdropFilter: "blur(18px)",
        }}
      >
        {showUpdateCard ? (
          <>
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: "var(--primary-light)", color: "var(--primary)" }}
              >
                <i className="pi pi-refresh text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-black uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>
                  Aggiornamento disponibile
                </div>
                <p className="mt-1 text-sm leading-5" style={{ color: "var(--text-muted)" }}>
                  Installa l&apos;ultima versione della web app per avere cache aggiornata e supporto offline.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                label="Più tardi"
                text
                size="small"
                onClick={dismissUpdatePrompt}
              />
              <Button
                label="Aggiorna"
                size="small"
                onClick={handleRefreshClick}
              />
            </div>
          </>
        ) : null}

        {showInstallCard ? (
          <>
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: "rgba(232,160,0,0.12)", color: "var(--gold)" }}
              >
                <i className="pi pi-mobile text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-black uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>
                  Installa Fantadc
                </div>
                <p className="mt-1 text-sm leading-5" style={{ color: "var(--text-muted)" }}>
                  Aggiungi l&apos;app alla schermata Home per usarla a tutto schermo, con icona dedicata e pagina offline.
                </p>
                {iosHintEnabled && !deferredPrompt ? (
                  <p className="mt-2 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
                    Su iPhone/iPad apri <strong>Condividi</strong> e scegli <strong>Aggiungi a Home</strong>.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                label="Chiudi"
                text
                size="small"
                onClick={dismissInstallPrompt}
              />
              {deferredPrompt ? (
                <Button
                  label="Installa"
                  size="small"
                  onClick={handleInstallClick}
                />
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
