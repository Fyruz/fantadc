"use client";

import { useRouter } from "next/navigation";
import { Button } from "primereact/button";

export default function BackButton() {
  const router = useRouter();
  return (
    <Button
      type="button"
      onClick={() => router.back()}
      icon="pi pi-chevron-left"
      text
      rounded
      className="flex h-8 w-8 items-center justify-center p-0"
      aria-label="Indietro"
      style={{ color: "var(--text-primary)" }}
    />
  );
}
