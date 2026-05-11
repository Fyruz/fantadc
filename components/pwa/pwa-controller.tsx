"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "primereact/button";

const UPDATE_DISMISS_KEY = "fantadc:pwa-update-dismissed";

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isPromptDismissed(storageKey: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(storageKey) === "1";
}

export default function PwaController() {
  const pathname = usePathname();
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [updateDismissed, setUpdateDismissed] = useState(() => isPromptDismissed(UPDATE_DISMISS_KEY));
  const [installed, setInstalled] = useState(() => isStandaloneMode());
  const isReloadingRef = useRef(false);

  const shouldHide = useMemo(
    () => pathname.startsWith("/admin") || pathname.startsWith("/api") || installed,
    [installed, pathname],
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let ignore = false;
    const registerServiceWorker = async () => {
      try {
        const swRegistration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
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
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[Fantadc PWA] Service worker registration failed.", error);
        }
      }
    };

    const handleControllerChange = () => {
      if (isReloadingRef.current) {
        return;
      }

      isReloadingRef.current = true;
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
    const handleAppInstalled = () => {
      setInstalled(true);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismissUpdatePrompt = () => {
    window.localStorage.setItem(UPDATE_DISMISS_KEY, "1");
    setUpdateDismissed(true);
    setUpdateReady(false);
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

  const handleRefreshClick = () => {
    // Intentionally fire-and-forget: the page reloads when the waiting service worker activates.
    void handleRefresh();
  };

  if (shouldHide) {
    return null;
  }

  const showUpdateCard = updateReady && !updateDismissed;

  if (!showUpdateCard) {
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

      </div>
    </div>
  );
}
