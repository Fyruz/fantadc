"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { useAppToast } from "@/components/toast-provider";

export default function ShareStoryButton({
  teamId,
  variant = "default",
}: {
  teamId: number;
  variant?: "default" | "subtle";
}) {
  const [loading, setLoading] = useState(false);
  const { error: showError, success: showSuccess, info: showInfo } = useAppToast();

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
    const dismissInfo = showInfo("Stiamo generando l'immagine da condividere...");

    try {
      const res = await fetch(`/api/story/${teamId}`);
      dismissInfo();
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(body || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const file = new File([blob], "squadra-dcup.png", { type: "image/png" });

      // Prova Web Share API (mobile/PWA)
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          return;
        } catch (shareErr) {
          if (shareErr instanceof Error && shareErr.name === "AbortError") return;
          // Fallback: download
        }
      }

      triggerDownload(blob);
      showSuccess("Immagine scaricata! Aprila dalla galleria e condividila nelle Storie.");
    } catch (err) {
      dismissInfo();
      const msg = err instanceof Error ? err.message : "Errore sconosciuto";
      showError(`Impossibile generare l'immagine: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  if (variant === "subtle") {
    return (
      <Button
        type="button"
        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-instagram"}
        label={loading ? "Genero la story..." : "Condividi su Instagram"}
        disabled={loading}
        onClick={handleShare}
        className="w-full justify-center rounded-2xl text-xs font-black uppercase tracking-wide"
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.20)",
          color: "#FFFFFF",
          boxShadow: "none",
          padding: "0.7rem 0.9rem",
        }}
      />
    );
  }

  return (
    <Button
      type="button"
      icon={loading ? "pi pi-spin pi-spinner" : "pi pi-share-alt"}
      label={loading ? "Generando..." : "Condividi su Instagram"}
      disabled={loading}
      onClick={handleShare}
      className="w-full"
    />
  );
}
