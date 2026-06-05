"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center justify-center w-6 h-6"
      aria-label="Indietro"
    >
      <img src="/icons/chevron_left.svg" width={24} height={24} alt="" />
    </button>
  );
}
