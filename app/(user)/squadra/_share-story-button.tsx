"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { useAppToast } from "@/components/toast-provider";

export default function ShareStoryButton({ teamId }: { teamId: number }) {
  const [loading, setLoading] = useState(false);
  const { error: showError, success: showSuccess } = useAppToast();

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
      // 1. Genera immagine
      const res = await fetch(`/api/story/${teamId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], "squadra-dcup.png", { type: "image/png" });

      // 2. Prova Web Share API (mobile)
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          return;
        } catch (shareErr) {
          // AbortError = utente ha annullato, ok
          if (shareErr instanceof Error && shareErr.name === "AbortError") return;
          // NotAllowedError o altro (es. iOS gesto scaduto) → fallback download
        }
      }

      // 3. Fallback: scarica e avvisa
      triggerDownload(blob);
      showSuccess("Immagine scaricata! Aprila dalla galleria e condividila nelle Storie.");
    } catch {
      showError("Impossibile generare l'immagine. Controlla la connessione e riprova.");
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
