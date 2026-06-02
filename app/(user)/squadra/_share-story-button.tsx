"use client";

import { useState } from "react";
import { Button } from "primereact/button";

export default function ShareStoryButton({ teamId }: { teamId: number }) {
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    setLoading(true);
    try {
      const res = await fetch(`/api/story/${teamId}`);
      if (!res.ok) throw new Error("Errore nella generazione della storia");
      const blob = await res.blob();
      const file = new File([blob], "squadra-dcup.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "squadra-dcup.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Share error:", err);
      }
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
