"use client";

import { useRouter } from "next/navigation";
import { Button } from "primereact/button";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Indietro"
      className="inline-flex items-center justify-center w-6 h-6"
    >
      <i className="pi pi-chevron-left" style={{ fontSize: 12, color: "var(--text-primary)" }} />
    </button>
  );
}
