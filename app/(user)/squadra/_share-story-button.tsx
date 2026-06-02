"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { useAppToast } from "@/components/toast-provider";

export default function ShareStoryButton({ teamId }: { teamId: number }) {
  const [loading, setLoading] = useState(false);
  const { error: showError, success: showSuccess } = useAppToast();

  // Pre-fetch the image blob as soon as the component mounts so it's
  // ready when the user taps — this avoids the iOS PWA gesture-context
  // expiry that happens when navigator.share() is called after a long await.
  const prefetchRef = useRef<Promise<Blob> | null>(null);

  useEffect(() => {
    prefetchRef.current = fetch(`/api/story/${teamId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .catch(() => {
        prefetchRef.current = null;
      }) as Promise<Blob>;
  }, [teamId]);

  function triggerDownload(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "squadra-dcup.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleShare() {
    setLoading(true);
    try {
      // Use pre-fetched blob if ready, otherwise fetch now
      const blob = await (prefetchRef.current ?? (async () => {
        const res = await fetch(`/api/story/${teamId}`);
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          throw new Error(body || `HTTP ${res.status}`);
        }
        return res.blob();
      })());

      const file = new File([blob], "squadra-dcup.png", { type: "image/png" });

      // Try Web Share API (mobile/PWA)
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          return;
        } catch (shareErr) {
          if (shareErr instanceof Error && shareErr.name === "AbortError") return;
          // NotAllowedError o altro → fallback download
        }
      }

      // Fallback: scarica e avvisa
      triggerDownload(blob);
      showSuccess("Immagine scaricata! Aprila dalla galleria e condividila nelle Storie.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Errore sconosciuto";
      showError(`Impossibile generare l'immagine: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      icon={loading ? "pi pi-spin pi-spinner" : "pi pi-share-alt"}
      label="Condividi su Instagram"
      disabled={loading}
      onClick={handleShare}
      className="w-full"
    />
  );
}
