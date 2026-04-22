"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { subscribeToPush, unsubscribeFromPush } from "@/app/actions/user/push";

type SupportState = "loading" | "unsupported" | "config-missing" | "permission-denied" | "ready";

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

async function ensurePushRegistration() {
  return navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });
}

export default function PushNotificationCard() {
  const [supportState, setSupportState] = useState<SupportState>("loading");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    const syncSubscription = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || typeof Notification === "undefined") {
        if (!cancelled) {
          setSupportState("unsupported");
        }
        return;
      }

      if (!PUBLIC_VAPID_KEY) {
        if (!cancelled) {
          setSupportState("config-missing");
        }
        return;
      }

      try {
        const registration = await ensurePushRegistration();
        const currentSubscription = await registration.pushManager.getSubscription();

        if (cancelled) {
          return;
        }

        setSubscription(currentSubscription);
        if (Notification.permission === "denied" && !currentSubscription) {
          setSupportState("permission-denied");
          return;
        }

        setSupportState("ready");
      } catch (error) {
        if (!cancelled) {
          console.error("[Fantadc Push] Failed to initialize push notifications.", error);
          setSupportState("unsupported");
          setMessage("Impossibile inizializzare le notifiche su questo dispositivo.");
        }
      }
    };

    void syncSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  const statusLabel = useMemo(() => {
    switch (supportState) {
      case "unsupported":
        return { value: "Non supportate", severity: "warning" as const };
      case "config-missing":
        return { value: "Config server", severity: "danger" as const };
      case "permission-denied":
        return { value: "Permesso negato", severity: "danger" as const };
      case "ready":
        return subscription
          ? { value: "Attive", severity: "success" as const }
          : { value: "Disattivate", severity: "warning" as const };
      default:
        return { value: "Verifica...", severity: "info" as const };
    }
  }, [subscription, supportState]);

  const description = useMemo(() => {
    if (supportState === "unsupported") {
      return "Questo browser non supporta le push web. Su iPhone servono Safari e l'app aggiunta alla Home.";
    }

    if (supportState === "config-missing") {
      return "Mancano le chiavi VAPID sul server: configura l'ambiente prima di attivare le push.";
    }

    if (supportState === "permission-denied") {
      return "Il browser ha negato il permesso. Riattivalo dalle impostazioni del sito per ricevere il link diretto al voto.";
    }

    if (subscription) {
      return "Riceverai una notifica appena una partita viene conclusa, con il collegamento diretto alla pagina di voto MVP.";
    }

    return "Attiva le push per ricevere il promemoria di voto MVP appena una partita viene conclusa.";
  }, [subscription, supportState]);

  const handleEnable = () => {
    startTransition(async () => {
      setMessage(null);

      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setSupportState(permission === "denied" ? "permission-denied" : "ready");
          setMessage("Permesso notifiche non concesso.");
          return;
        }

        const registration = await ensurePushRegistration();
        const currentSubscription =
          (await registration.pushManager.getSubscription()) ??
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
          }));

        const serializedSubscription = currentSubscription.toJSON();
        if (
          !serializedSubscription.endpoint ||
          !serializedSubscription.keys?.p256dh ||
          !serializedSubscription.keys?.auth
        ) {
          setMessage("Subscription push incompleta.");
          return;
        }

        const result = await subscribeToPush({
          endpoint: serializedSubscription.endpoint,
          expirationTime: serializedSubscription.expirationTime ?? null,
          keys: {
            p256dh: serializedSubscription.keys.p256dh,
            auth: serializedSubscription.keys.auth,
          },
        });

        if (!result.success) {
          setMessage(result.message);
          return;
        }

        setSubscription(currentSubscription);
        setSupportState("ready");
        setMessage(result.message);
      } catch (error) {
        console.error("[Fantadc Push] Failed to enable push notifications.", error);
        setMessage("Non sono riuscito ad attivare le notifiche push.");
      }
    });
  };

  const handleDisable = () => {
    startTransition(async () => {
      if (!subscription) {
        return;
      }

      setMessage(null);

      try {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        const result = await unsubscribeFromPush(endpoint);
        setSubscription(null);
        setSupportState(Notification.permission === "denied" ? "permission-denied" : "ready");
        setMessage(result.message);
      } catch (error) {
        console.error("[Fantadc Push] Failed to disable push notifications.", error);
        setMessage("Non sono riuscito a disattivare le notifiche push.");
      }
    });
  };

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="over-label mb-1">Notifiche push</div>
          <div className="font-display text-base font-black uppercase" style={{ color: "var(--text-primary)" }}>
            Voto MVP diretto
          </div>
        </div>
        <Tag value={statusLabel.value} severity={statusLabel.severity} />
      </div>

      <p className="text-sm leading-5" style={{ color: "var(--text-muted)" }}>
        {description}
      </p>

      {message ? (
        <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        {supportState === "ready" && subscription ? (
          <Button
            label="Disattiva push"
            outlined
            size="small"
            onClick={handleDisable}
            loading={isPending}
          />
        ) : null}
        {supportState === "ready" && !subscription ? (
          <Button
            label="Attiva push"
            size="small"
            onClick={handleEnable}
            loading={isPending}
          />
        ) : null}
      </div>
    </div>
  );
}
